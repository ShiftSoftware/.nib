# SITE NAME

ONE LINE: what this site is, who it is for, its languages.

## First, every session and every request

1. `.nib` is the `.nib` folder inside this one: the general rules. It is read-only: never change anything in it
   (`.nib/AGENTS.md`, rule 12). `scripts/sync.mjs` clones it if it is missing.
2. Run `node scripts/sync.mjs` from this folder at the start of every prompt (it returns at once; the
   updates run in the background). Claude Code does this by itself through `.claude/settings.json`.
3. Read `.nib/AGENTS.md` and follow it. It holds the general rules; this file adds what is specific to this site.
4. Read `.knowledge/README.md` for this site's status, decisions and how it differs from `.nib`.

## This site

| | |
|---|---|
| Languages | English (`lang="en"`) |
| Hosting | HOST: what serves the site and how branches get preview links |
| Media storage | STORAGE: what it is and its public address; or "none yet: optimized media in `site/static/media/`" |
| Address | https://ADDRESS: `baseURL` in `site/hugo.toml`, the canonical address every page's search and share tags are built from |
| Share image | `media/site/share.jpg` (1200 × 630, JPEG), for pages without their own picture |
| Folders | No: every page directly in `site/content/`, relative links. (Yes: pages by topic in folders, links from `/`) |
| Search engines | Open. (Or: kept out until launch, `noindex` on every page, set once in `site/layouts/_partials/head.html`) |
| Allowed outside files | None |

## Commands

This site's own tools, in `scripts/`. They belong to this repo; change them here.

| Command | What it does |
|---|---|
| `node scripts/sync.mjs` | Every prompt: keeps `.nib` current and read-only, brings in the site's latest `main`, and prints `SETUP` when this computer is missing something the site needs |
| `node scripts/map.mjs "<words>"` | Finds the file, line and section for words from a request |
| `node scripts/media.mjs <file> <folder> <name>` | Optimizes an image, video or PDF into `media/<folder>/` |
| `node scripts/check.mjs` | Builds the pages into `site/public/`, then checks them and the media |
| `node scripts/preview.mjs` | Starts the local preview; it rebuilds on every change and shows drafts |
| `node scripts/send.mjs "<what changed>"` | Builds and checks, sends media to the storage, then the changes for review; prints the preview link |
| `node scripts/doctor.mjs` | Lists any tool missing on this computer, with the command that installs it |

## Pages

Built by Hugo into `site/public/`, which is never changed by hand (see `.nib/AGENTS.md`, rule 1).

| Page | What it is |
|---|---|
| `site/content/_index.html` | Home |
| `site/content/404.html` | Page not found |
| `site/layouts/_partials/head.html`, `header.html`, `footer.html` | On every page: the `<head>`, the header with the navigation, the footer |

## Templates

Starters, one per kind of page, made and kept by the agent (see `.nib/AGENTS.md`, Page rules). A new page is a copy in `site/content/`.

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
