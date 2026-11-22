import { git, run, nibRoot, siteRoot, defaultBranch, conflicts } from './lib.mjs';
import { join } from 'node:path';

const message = process.argv.slice(2).join(' ').trim();
if (!message) { console.log('ERROR usage: send.mjs "<one line: what changed>"'); process.exit(1); }

const root = siteRoot();
process.chdir(root);
const main = defaultBranch();

const stop = (line) => { console.log(line); process.exit(1); };
const stopOnConflict = () => { const files = conflicts(); if (files.length) stop(`CONFLICT ${files.join(' ')}`); };

stopOnConflict();
const check = run(process.execPath, [join(nibRoot, 'scripts', 'check.mjs')], { cwd: root });
if (!check.ok) stop(`CHECK FAILED\n${check.out}`);

let branch = git('branch', '--show-current').out;
if (branch === main) {
  const slug = message.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').split('-').slice(0, 4).join('-') || 'changes';
  branch = `edit/${new Date().toISOString().slice(0, 10)}-${slug}`;
  if (!git('switch', '-c', branch).ok) stop(`ERROR could not start ${branch}`);
}

git('add', '-A');
if (git('diff', '--cached', '--quiet').ok === false) {
  const commit = git('commit', '--quiet', '-m', message);
  if (!commit.ok) stop(`ERROR commit failed: ${commit.err}`);
}

if (!git('fetch', '--quiet', 'origin').ok) stop('OFFLINE could not reach GitHub; your changes are saved on this computer. Try again when online.');
for (const ref of [`origin/${branch}`, `origin/${main}`]) {
  if (!git('rev-parse', '--verify', '--quiet', ref).ok) continue;
  git('merge', '--no-edit', '--quiet', ref);
  stopOnConflict();
}

const push = git('push', '--quiet', '-u', 'origin', 'HEAD');
if (!push.ok) stop(`ERROR push failed: ${push.err}`);

let pr = run('gh', ['pr', 'view', '--json', 'url,state', '-q', 'select(.state=="OPEN") | .url']);
if (pr.missing) stop('ERROR GitHub CLI (gh) is not installed; run the setup again.');
let url = pr.ok ? pr.out : '';
if (!url) {
  const created = run('gh', ['pr', 'create', '--base', main, '--title', message, '--body', message]);
  if (!created.ok) stop(`ERROR could not open the review: ${created.err}`);
  url = created.out.split('\n').pop();
}

const deadline = Date.now() + 5 * 60 * 1000;
while (Date.now() < deadline) {
  const comments = run('gh', ['pr', 'view', url, '--json', 'comments', '-q', '.comments[].body']).out;
  const preview = [...comments.matchAll(/https:\/\/[^\s)|"'<>\]]+/g)].map((m) => m[0]).filter((u) => !/^https:\/\/([a-z0-9-]+\.)*github(usercontent)?\.com\//i.test(u)).pop();
  if (preview) { console.log(`SENT ${url}\nPREVIEW ${preview}`); process.exit(0); }
  await new Promise((r) => setTimeout(r, 15000));
}
console.log(`SENT ${url}\nPREVIEW not posted yet; it appears on the review page in a few minutes.`);
