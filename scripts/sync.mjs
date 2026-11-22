import { spawn } from 'node:child_process';
import { nibRoot, siteRoot } from './lib.mjs';

const pull = (dir) => spawn('git', ['-C', dir, 'pull', '--ff-only', '--quiet'], { detached: true, stdio: 'ignore', windowsHide: true }).unref();

pull(nibRoot);
pull(siteRoot());
console.log('OK syncing in the background.');
