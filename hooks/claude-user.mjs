// Claude Code user-level hook: gives every session the .nib site hooks, wherever it was opened.
// A site's own .claude/settings.json loads only when the session starts in the site's folder.
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { copyFileSync, existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const NIB = 'https://github.com/ShiftSoftware/.nib';

let event = {};
try { event = JSON.parse(readFileSync(0, 'utf8')); } catch {}
const input = event.tool_input || {};
const same = (a, b) => process.platform === 'win32' ? a.toLowerCase() === b.toLowerCase() : a === b;
const cwd = event.cwd || process.cwd();

function siteOf(p) {
  for (let dir = resolve(cwd, p); ; dir = dirname(dir)) {
    try {
      if (existsSync(join(dir, 'site', 'public')) && readFileSync(join(dir, '.claude', 'settings.json'), 'utf8').includes(NIB)) return dir;
    } catch {}
    if (dirname(dir) === dir) return null;
  }
}

const target = input.file_path || input.notebook_path || input.path;
const site = [target, cwd].filter(Boolean).map(siteOf).find(Boolean);
const project = process.env.CLAUDE_PROJECT_DIR;
if (!site || (project && same(resolve(project), site))) process.exit(0);

const git = (...args) => spawnSync('git', args, { cwd: site, encoding: 'utf8' });
const nib = join(site, '.nib');
if (!existsSync(join(nib, '.git'))) {
  rmSync(nib, { recursive: true, force: true });
  if (git('clone', '--quiet', NIB, '.nib').status !== 0) process.exit(0);
}
// Only ever run Shift Software's .nib, never a folder that merely has the name.
if (git('-C', '.nib', 'remote', 'get-url', 'origin').stdout.trim().replace(/\.git$/, '') !== NIB) process.exit(0);

const self = fileURLToPath(import.meta.url);
const latest = join(nib, 'hooks', 'claude-user.mjs');
if (existsSync(latest) && readFileSync(latest, 'utf8') !== readFileSync(self, 'utf8')) copyFileSync(latest, self);

const node = (script, ...args) => spawnSync(process.execPath, [join(nib, 'scripts', script), ...args],
  { cwd: site, input: JSON.stringify(event), encoding: 'utf8', env: { ...process.env, CLAUDE_PROJECT_DIR: site } });

const name = event.hook_event_name;
const seen = join(tmpdir(), `nib-${event.session_id || 'session'}-${createHash('sha1').update(site).digest('hex').slice(0, 12)}`);
if (!existsSync(seen) && ['SessionStart', 'UserPromptSubmit', 'PostToolUse'].includes(name)) {
  const r = node('sync.mjs', '--rules');
  writeFileSync(seen, '');
  const context = `This work is in the .nib site ${site}. Its rules follow; obey them for everything you do there.\n${r.stdout}`;
  console.log(JSON.stringify({ hookSpecificOutput: { hookEventName: name, additionalContext: context } }));
  process.exit(0);
}

const r = name === 'UserPromptSubmit' ? node('sync.mjs')
  : name === 'PreToolUse' && /^(Edit|Write|MultiEdit|NotebookEdit)$/.test(event.tool_name) ? node('guard.mjs')
  : name === 'PostToolUse' ? node('guard.mjs')
  : null;
if (!r) process.exit(0);
process.stdout.write(r.stdout || '');
process.stderr.write(r.stderr || '');
process.exit(r.status === 2 ? 2 : 0);
