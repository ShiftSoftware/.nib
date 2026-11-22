import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { git, nibRoot, siteRoot, isSiteCopy, undoNibChanges, starterHooks } from './lib.mjs';

const site = siteRoot();
const siteCopy = isSiteCopy(site);

if (process.argv.includes('--update-nib')) {
  if (!siteCopy) process.exit(0);
  // Runs in the background: make the site's copy exactly GitHub's default branch, whatever was done to it.
  git('-C', nibRoot, 'fetch', '--quiet', 'origin');
  const branch = (git('-C', nibRoot, 'rev-parse', '--abbrev-ref', 'origin/HEAD').out || 'origin/main').replace(/^origin\//, '');
  git('-C', nibRoot, 'checkout', '--force', '--quiet', '-B', branch, `origin/${branch}`);
  git('-C', nibRoot, 'clean', '-fdq');
  process.exit(0);
}

const background = (cmd, args) => spawn(cmd, args, { detached: true, stdio: 'ignore', windowsHide: true }).unref();

if (siteCopy && undoNibChanges()) console.log('NOTE changes to .nib were undone; .nib is read-only in a site.');

const hooks = siteCopy ? '.nib/hooks' : join(nibRoot, 'hooks').replaceAll('\\', '/');
const current = git('-C', site, 'config', '--local', 'core.hooksPath').out;
const ours = (p) => p.replaceAll('\\', '/').endsWith('.nib/hooks');
if (current !== hooks && (!current || ours(current))) git('-C', site, 'config', '--local', 'core.hooksPath', hooks);
else if (current !== hooks) console.log(`NOTE this repo already uses its own Git hooks (${current}); the .nib hook that refuses pushes to main is not active.`);

if (siteCopy) {
  const file = join(site, '.claude', 'settings.json');
  let settings = {};
  try { settings = JSON.parse(readFileSync(file, 'utf8')); } catch {}
  const wanted = starterHooks();
  if (JSON.stringify(settings.hooks) !== JSON.stringify(wanted)) {
    mkdirSync(join(site, '.claude'), { recursive: true });
    writeFileSync(file, `${JSON.stringify({ ...settings, hooks: wanted }, null, 2)}\n`);
    console.log('NOTE .claude/settings.json hooks restored from .nib/starter; send them with the next changes.');
  }
  background(process.execPath, [fileURLToPath(import.meta.url), '--update-nib']);
} else {
  background('git', ['-C', nibRoot, 'pull', '--ff-only', '--quiet']);
}
background('git', ['-C', site, 'pull', '--ff-only', '--quiet']);

if (process.argv.includes('--rules')) {
  for (const f of [join(nibRoot, 'AGENTS.md'), join(site, 'AGENTS.md'), join(site, '.knowledge', 'README.md')]) {
    if (existsSync(f)) console.log(`\n===== ${f.slice(site.length + 1).replaceAll('\\', '/')} (follow it) =====\n${readFileSync(f, 'utf8')}`);
  }
}
console.log('OK syncing .nib and the site in the background. Follow AGENTS.md and .nib/AGENTS.md.');
