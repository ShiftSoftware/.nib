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
| Hosting | HOST: what serves the site, how branches get preview links, and how `/media/` reaches the storage |
| Media storage | STORAGE: what it is and its public address |
| Allowed outside files | None |

## Pages

| Page | What it is |
|---|---|
| `site/public/index.html` | Home |
| `site/public/404.html` | Page not found |

## Templates

One per kind of page, made and kept by the agent (see `.nib/AGENTS.md`, Page rules).

| Template | For |
|---|---|
| `site/templates/page.html` | A plain page |

## Media folders and sizes

| Folder | Use | Command options |
|---|---|---|
| `pages/<page>` | Photos in a page | (default: at most 1600 wide) |
| `site` | Logo, icons, share images | `--width 1200` |

## Components

| Component (class) | Copy it from | Notes |
|---|---|---|

## Words people use

Words people say that don't appear on the site, and where they point (see `.nib/organize.md`).

| They say | It is |
|---|---|
