import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const nibRoot = join(dirname(fileURLToPath(import.meta.url)), '..');

export function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { encoding: 'utf8', ...opts });
  return { ok: r.status === 0, out: (r.stdout || '').trim(), err: (r.stderr || '').trim(), missing: r.error?.code === 'ENOENT' };
}

export const git = (...args) => run('git', args);

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
