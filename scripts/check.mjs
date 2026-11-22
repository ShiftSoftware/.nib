import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, dirname, extname, join, relative } from 'node:path';
import { run, siteRoot, defaultBranch } from './lib.mjs';

const root = siteRoot();
const site = join(root, 'site');
const pub = join(site, 'public');
const MAX_BYTES = 25 * 1024 * 1024;
let errors = 0;
let warnings = 0;
const err = (where, msg) => { errors++; console.log(`ERROR  ${where}: ${msg}`); };
const warn = (where, msg) => { warnings++; console.log(`WARN   ${where}: ${msg}`); };
const rel = (p) => relative(root, p).replaceAll('\\', '/');

function walk(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter((e) => !e.name.startsWith('.'))
    .flatMap((e) => (e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]));
}

for (const entry of readdirSync(site)) {
  if (!['public', 'private', 'templates'].includes(entry)) err(`site/${entry}`, 'site/ holds only public/, private/ and templates/');
}
if (!existsSync(join(site, 'templates'))) err('site/templates', 'missing; new pages start from a template');
if (!existsSync(join(pub, 'index.html'))) err('site/public/index.html', 'missing home page');
if (!existsSync(join(pub, '404.html'))) err('site/public/404.html', 'missing "page not found" page');
const ignored = run('git', ['-C', root, 'check-ignore', '-q', 'temp/x']);
if (!ignored.ok) err('.gitignore', 'temp/ must be ignored by Git');

const pages = ['public', 'templates', 'private'].flatMap((d) => walk(join(site, d)).filter((f) => f.endsWith('.html')));
const texts = new Map(pages.map((p) => [p, readFileSync(p, 'utf8').replaceAll('\r\n', '\n')]));
const block = (html, tag) => html.match(new RegExp(`<!-- ${tag} -->[\\s\\S]*?<!-- /${tag} -->`))?.[0] ?? null;
const langOf = (html) => html.match(/<html\b[^>]*\slang="([^"]+)"/)?.[1];

const reference = new Map();
for (const p of [...pages].sort((a, b) => Number(!a.includes('templates')) - Number(!b.includes('templates')))) {
  if (rel(p).startsWith('site/private/') || basename(p) === '404.html') continue;
  const lang = langOf(texts.get(p));
  if (lang && !reference.has(lang)) reference.set(lang, p);
}

for (const p of pages) {
  const name = rel(p);
  const html = texts.get(p);
  const isPrivate = rel(p).startsWith('site/private/');
  const isTemplate = rel(p).startsWith('site/templates/');
  const is404 = rel(p) === 'site/public/404.html';
  if (!isPrivate && dirname(p) !== pub && !isTemplate) err(name, 'pages sit directly in site/public/, not in subfolders');
  if (!/^[a-z0-9]+(-[a-z0-9]+)*(\.[a-z]+)?\.html$/.test(basename(p)) && !is404) err(name, 'page names are lower-case English words with hyphens');

  const lang = langOf(html);
  if (!lang) err(name, 'missing <html lang="...">');
  if (!/<meta charset="utf-8">/i.test(html)) err(name, 'missing <meta charset="utf-8">');
  if (!/<meta name="viewport"/.test(html)) err(name, 'missing the viewport meta tag');
  if (!/<title>[^<]+<\/title>/.test(html)) err(name, 'missing <title>');
  const h1 = (html.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1 && !isTemplate) (is404 ? warn : err)(name, `has ${h1} <h1>; a page has exactly one`);
  if (/\sstyle="/.test(html)) err(name, 'style="..." attribute; put it in site.css');
  if (/<style[\s>]/.test(html)) err(name, '<style> block; put it in site.css');
  if (/<base[\s>]/.test(html) && !is404) err(name, 'only 404.html has a <base> tag');

  for (const tag of html.match(/<img\b[^>]*>/gi) || []) {
    for (const a of ['alt', 'width', 'height']) if (!new RegExp(`\\s${a}="`).test(tag)) err(name, `<img> without ${a}: ${tag}`);
  }

  if (!isPrivate && lang && reference.has(lang) && reference.get(lang) !== p && !is404) {
    for (const tag of ['HEADER', 'FOOTER']) {
      const mine = block(html, tag);
      const ref = block(texts.get(reference.get(lang)), tag);
      if (ref && mine !== ref) err(name, `the ${tag} block differs from ${rel(reference.get(lang))}; copy it from there`);
    }
  }

  const base = is404 || isTemplate ? pub : dirname(p);
  const code = html.replace(/<!--[\s\S]*?-->/g, '');
  for (const [, url] of code.matchAll(/\s(?:href|src)="([^"]*)"/g)) {
    if (!url || /^(https?:|mailto:|tel:|data:|#|javascript:)/.test(url)) continue;
    if (url.startsWith('/') && !is404) { err(name, `link starts with /: ${url} (use a relative file name)`); continue; }
    const [path, hash] = url.split('#');
    const clean = decodeURIComponent(path.split('?')[0].replace(/^\//, ''));
    if (!clean) continue;
    const from = clean.startsWith('media/') && !isPrivate ? root : base;
    const candidates = [join(from, clean), join(from, `${clean}.html`)];
    const target = candidates.find((c) => existsSync(c) && statSync(c).isFile());
    if (!target) { err(name, `broken link: ${url}`); continue; }
    if (hash && target.endsWith('.html') && !new RegExp(`\\sid="${hash.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`).test(readFileSync(target, 'utf8'))) {
      err(name, `link to a missing section: ${url}`);
    }
  }
}

const mediaTypes = new Set(['.avif', '.webp', '.mp4', '.pdf', '.svg', '.ico', '.png']);
for (const f of walk(pub)) {
  if (statSync(f).size > MAX_BYTES) err(rel(f), 'larger than 25 MB, the host limit');
  if (['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif', '.mp4', '.mov', '.pdf'].includes(extname(f).toLowerCase())) warn(rel(f), 'images, video and PDFs go in media/ with media.mjs');
}
for (const f of walk(join(root, 'media'))) {
  const name = rel(f);
  if (!/^[a-z0-9]+(-[a-z0-9]+)*\.[a-z0-9]+$/.test(basename(f))) err(name, 'media names are lower-case English words with hyphens');
  if (!mediaTypes.has(extname(f).toLowerCase())) err(name, 'not optimized; add it with media.mjs');
  if (statSync(f).size > MAX_BYTES) err(name, 'larger than 25 MB; put it on YouTube');
}
const base = run('git', ['-C', root, 'merge-base', 'HEAD', `origin/${defaultBranch()}`]);
if (base.ok) {
  const replaced = run('git', ['-C', root, 'diff', '--name-only', '--diff-filter=MDR', base.out, '--', 'media']);
  for (const f of replaced.out ? replaced.out.split('\n') : []) err(f, 'a published media file was changed or removed; add the new version under a new name and restore this one');
}

const extra = join(root, 'scripts', 'check.mjs');
if (existsSync(extra)) {
  const r = run(process.execPath, [extra], { cwd: root });
  if (r.out) console.log(r.out);
  if (r.err) console.log(r.err);
  if (!r.ok) errors++;
}

console.log(`${pages.length} pages checked: ${errors} errors, ${warnings} warnings.`);
if (errors) process.exit(1);
