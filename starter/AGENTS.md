# SITE NAME

ONE LINE: what this site is, who it is for, its languages.

## First, every session and every request

1. Find `.nib`: `C:\repos\ShiftSoftware\.nib` on Windows, `~/repos/ShiftSoftware/.nib` on macOS and Linux. If it
   is missing, `git clone https://github.com/ShiftSoftware/.nib` there.
2. Run `node <nib>/scripts/sync.mjs` from this folder (it returns at once; the update runs in the background).
3. Read `<nib>/AGENTS.md` and follow it. It holds the general rules; this file adds what is specific to this site.
4. Read `.knowledge/README.md` for this site's status, decisions and how it differs from `.nib`.

## This site

| | |
|---|---|
| Languages | English (`lang="en"`) |
| Preview | `node <nib>/scripts/preview.mjs` (port 8300, or the next free one) |
| Media storage | STORAGE: what it is and its public address (`MEDIA_URL` in `wrangler.jsonc`) |
| Allowed outside files | None |

## Pages

| Page | What it is |
|---|---|
| `site/public/index.html` | Home |
| `site/public/404.html` | Page not found |
| `site/templates/page.html` | Start of every new page |

## Media folders and sizes

| Folder | Use | Command options |
|---|---|---|
| `pages/<page>` | Photos in a page | (default: at most 1600 wide) |
| `site` | Logo, icons, share images | `--width 1200` |

## Components

List the site's blocks here as they are added: name, where to copy it from, notes.
