import { copyFileSync, existsSync, mkdirSync, readdirSync, renameSync, rmSync, statSync } from 'node:fs';
import { basename, extname, join } from 'node:path';
import { run, siteRoot, ghostscript } from './lib.mjs';

const args = process.argv.slice(2);
const option = (name) => { const i = args.indexOf(name); return i < 0 ? null : args.splice(i, 2)[1]; };
const maxWidth = Number(option('--width') || 1600);
const crop = option('--crop')?.match(/^(\d+)x(\d+)$/);
const [file, folderArg, nameArg] = args;
const fail = (msg) => { console.log(`ERROR ${msg}`); process.exit(1); };
if (!file || !folderArg) fail('usage: media.mjs <file> <folder> [name] [--width 1600] [--crop 560x420]');
if (!existsSync(file)) fail(`file not found: ${file}`);

const root = siteRoot();
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const folder = folderArg.split(/[\\/]/).map(slug).filter(Boolean).join('/');
const name = slug(nameArg || basename(file, extname(file)));
if (!folder || !name) fail('give a folder and a name in English words');
const dir = join(root, 'media', folder);
if (existsSync(dir) && readdirSync(dir).some((f) => f.startsWith(`${name}.`))) fail(`media/${folder}/${name} is already used; a published file is never replaced. Pick another name`);

const ext = extname(file).toLowerCase().slice(1);
const images = ['jpg', 'jpeg', 'png', 'webp', 'avif', 'heic', 'heif', 'tif', 'tiff', 'bmp'];
const videos = ['mp4', 'mov', 'm4v', 'webm', 'mkv', 'avi', 'gif'];
const keep = ['svg', 'ico'];
if (![...images, ...videos, ...keep, 'pdf'].includes(ext)) fail(`can't use a .${ext} file on the site`);

mkdirSync(join(root, 'temp'), { recursive: true });
mkdirSync(dir, { recursive: true });
const original = join(root, 'temp', basename(file));
if (file !== original) copyFileSync(file, original);

const ffmpeg = (a) => { const r = run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...a]); if (r.missing) fail('ffmpeg is not installed; run the setup again'); return r; };
function probe(path) {
  const r = run('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height,pix_fmt', '-of', 'csv=p=0', path]);
  const m = r.out.match(/^(\d+),(\d+),(\w+)/);
  if (!m) fail(`can't read ${basename(path)}; ask for a JPG, PNG or MP4`);
  return { w: +m[1], h: +m[2], alpha: /^(rgba|bgra|argb|abgr|ya|yuva|gbrap)/.test(m[3]) };
}
const even = (n) => Math.max(2, Math.floor(n / 2) * 2);

let out;
let size = '';
if (keep.includes(ext)) {
  out = join(dir, `${name}.${ext}`);
  copyFileSync(original, out);
} else if (ext === 'pdf') {
  out = join(dir, `${name}.pdf`);
  const tmp = `${out}.tmp`;
  const gs = ghostscript();
  if (gs && run(gs, ['-sDEVICE=pdfwrite', '-dCompatibilityLevel=1.5', '-dPDFSETTINGS=/ebook', '-dNOPAUSE', '-dQUIET', '-dBATCH', `-sOutputFile=${tmp}`, original]).ok && statSync(tmp).size < statSync(original).size) {
    renameSync(tmp, out);
  } else {
    rmSync(tmp, { force: true });
    copyFileSync(original, out);
    if (!gs) console.log('WARN Ghostscript is not installed; the PDF is kept as it is');
  }
} else if (images.includes(ext)) {
  const p = probe(original);
  let w, h, filter;
  if (crop) {
    [w, h] = [+crop[1], +crop[2]];
    filter = `scale=${w}:${h}:force_original_aspect_ratio=increase:flags=lanczos,crop=${w}:${h}`;
  } else {
    w = even(Math.min(p.w, maxWidth));
    h = even(p.h * w / p.w);
    filter = `scale=${w}:${h}:flags=lanczos`;
  }
  out = join(dir, `${name}.${p.alpha ? 'webp' : 'avif'}`);
  const codec = p.alpha
    ? ['-vf', `${filter},format=yuva420p`, '-c:v', 'libwebp', '-quality', '82']
    : ['-vf', `${filter},format=yuv420p`, '-c:v', 'libsvtav1', '-crf', '35', '-preset', '6'];
  let r = ffmpeg(['-i', original, '-frames:v', '1', ...codec, out]);
  if (!r.ok && !p.alpha) r = ffmpeg(['-i', original, '-frames:v', '1', '-vf', `${filter},format=yuv420p`, '-c:v', 'libaom-av1', '-still-picture', '1', '-crf', '32', '-cpu-used', '6', out]);
  if (!r.ok) fail(`could not convert ${basename(file)}: ${r.err}`);
  size = ` width="${w}" height="${h}"`;
} else {
  out = join(dir, `${name}.mp4`);
  const r = ffmpeg(['-i', original, '-vf', "scale='min(1920,iw)':-2", '-c:v', 'libx264', '-crf', '26', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', out]);
  if (!r.ok) fail(`could not convert ${basename(file)}: ${r.err}`);
  const p = probe(out);
  size = ` width="${p.w}" height="${p.h}"`;
}

const url = `media/${folder}/${basename(out)}`;
const kb = Math.round(statSync(out).size / 1024);
if (statSync(out).size > 25 * 1024 * 1024) { rmSync(out); fail(`${basename(file)} is still over 25 MB after optimizing; put it on YouTube`); }
if (images.includes(ext)) console.log(`<img src="${url}" alt=""${size} loading="lazy">  (${kb} KB)`);
else if (videos.includes(ext)) console.log(`<video src="${url}"${size} controls preload="metadata"></video>  (${kb} KB)`);
else console.log(`${url}  (${kb} KB)`);
