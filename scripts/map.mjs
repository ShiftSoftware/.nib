import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { siteRoot } from './lib.mjs';

const root = siteRoot();
const dirs = ['site/public', 'site/templates', 'site/private'];
const files = dirs.flatMap((d) => (existsSync(join(root, d)) ? readdirSync(join(root, d)).filter((f) => /\.(html|css|js)$/.test(f)).map((f) => join(root, d, f)) : []));
const rel = (p) => relative(root, p).replaceAll('\\', '/');
const text = (html) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const query = process.argv.slice(2).join(' ').trim().toLowerCase();

function sections(lines) {
  let current = '';
  return lines.map((line) => {
    const id = line.match(/<(?:section|header|footer|main|nav|article|aside|div)\b[^>]*\sid="([^"]+)"/);
    if (id) current = `#${id[1]}`;
    if (/<!-- (HEADER|FOOTER) -->/.test(line)) current = line.match(/<!-- (\w+) -->/)[1];
    return current;
  });
}

if (query) {
  let hits = 0;
  for (const file of files) {
    const lines = readFileSync(file, 'utf8').split(/\r?\n/);
    const where = file.endsWith('.html') ? sections(lines) : [];
    lines.forEach((line, i) => {
      if (!line.toLowerCase().includes(query) && !text(line).toLowerCase().includes(query)) return;
      hits++;
      console.log(`${rel(file)}:${i + 1}  ${where[i] || ''}  ${line.trim().slice(0, 120)}`);
    });
  }
  if (!hits) console.log(`No match for "${query}". Try another word, or run without words to see the map.`);
  process.exit(0);
}

for (const file of files.filter((f) => f.endsWith('.html'))) {
  const html = readFileSync(file, 'utf8');
  const title = html.match(/<title>([^<]*)<\/title>/)?.[1] ?? '';
  console.log(`${rel(file)}  "${title}"`);
  const lines = html.split(/\r?\n/);
  lines.forEach((line, i) => {
    const m = line.match(/<(section|header|footer|main|nav|article|aside)\b[^>]*\sid="([^"]+)"/);
    if (!m) return;
    const heading = lines.slice(i, i + 15).join(' ').match(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/);
    console.log(`  #${m[2].padEnd(22)} line ${String(i + 1).padEnd(5)} ${heading ? text(heading[1]).slice(0, 60) : ''}`);
  });
}
