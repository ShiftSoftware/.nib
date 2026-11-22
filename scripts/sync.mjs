import { spawn } from 'node:child_process';
import { join } from 'node:path';
import { git, nibRoot, siteRoot } from './lib.mjs';

const pull = (dir) => spawn('git', ['-C', dir, 'pull', '--ff-only', '--quiet'], { detached: true, stdio: 'ignore', windowsHide: true }).unref();

const site = siteRoot();
const hooks = join(nibRoot, 'hooks').replaceAll('\\', '/');
const current = git('-C', site, 'config', '--local', 'core.hooksPath').out;
if (!current) git('-C', site, 'config', '--local', 'core.hooksPath', hooks);
else if (current !== hooks) console.log(`NOTE this repo already uses its own Git hooks (${current}); the .nib hook that refuses pushes to main is not active.`);

pull(nibRoot);
pull(site);
console.log('OK syncing in the background.');
