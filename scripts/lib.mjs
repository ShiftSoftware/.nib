import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const nibRoot = join(dirname(fileURLToPath(import.meta.url)), '..');

export function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { encoding: 'utf8', ...opts });
  return { ok: r.status === 0, out: (r.stdout || '').trim(), err: (r.stderr || '').trim(), missing: r.error?.code === 'ENOENT' };
}

export const git = (...args) => run('git', args);

export function ghostscript() {
  for (const name of ['gs', 'gswin64c']) if (!run(name, ['--version']).missing) return name;
  if (process.platform !== 'win32') return null;
  // The Windows installer doesn't add Ghostscript to PATH.
  const base = join(process.env.ProgramFiles || 'C:\\Program Files', 'gs');
  if (!existsSync(base)) return null;
  const exe = readdirSync(base).sort().reverse().map((v) => join(base, v, 'bin', 'gswin64c.exe')).find(existsSync);
  return exe || null;
}

export function siteRoot() {
  const top = git('rev-parse', '--show-toplevel');
  const root = top.ok ? top.out : process.cwd();
  if (!existsSync(join(root, 'site', 'public'))) {
    console.log(`ERROR not a .nib site: ${root} has no site/public folder. Run this from the site's folder.`);
    process.exit(1);
  }
  return root;
}

export function defaultBranch() {
  const r = git('symbolic-ref', '--short', 'refs/remotes/origin/HEAD');
  return r.ok ? r.out.replace(/^origin\//, '') : 'main';
}

export function conflicts() {
  const r = git('diff', '--name-only', '--diff-filter=U');
  return r.ok && r.out ? r.out.split('\n') : [];
}

// Only a site's own copy (<site>/.nib) is kept read-only; a maintainer's clone of .nib is never touched.
// Without its own .git, git -C .nib would act on the site's repo instead.
export const isSiteCopy = (site) => resolve(nibRoot) === resolve(site, '.nib') && existsSync(join(nibRoot, '.git'));

export function undoNibChanges() {
  if (!git('-C', nibRoot, 'status', '--porcelain').out) return false;
  git('-C', nibRoot, 'reset', '--hard', '--quiet');
  git('-C', nibRoot, 'clean', '-fdq');
  return true;
}

export function starterHooks() {
  return JSON.parse(readFileSync(join(nibRoot, 'starter', '.claude', 'settings.json'), 'utf8')).hooks;
}
