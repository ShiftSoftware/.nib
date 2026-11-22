# .nib: nothing in between

A way to build websites as plain files that anyone edits by asking an AI agent. No CMS, no framework, no build:
the files in Git are the website, the agent is the editor, and Cloudflare serves the files as they are.

`.nib` holds the general rules ([AGENTS.md](AGENTS.md)), a few small scripts that need only Node.js, the setup
steps for a new computer ([setup.md](setup.md)), and a starter site ([starter/](starter/)). Each site keeps its own
rules in its `AGENTS.md` and its status and decisions in `.knowledge/`.

## Installation

Open your repo in your agent (Claude, Codex, Kimi, Cursor or any other) and give it this:

```text
Set up this repo with .nib by following https://raw.githubusercontent.com/ShiftSoftware/.nib/main/install.md
```

## How it works

<img src="guide/how-it-works.svg" alt="How .nib works: you ask, the agent edits the files, checks them and shows a preview on your computer; when you say done, the changes are sent for review, Cloudflare gives a preview link, an admin merges, and the site is live." width="100%">

| Part | What it is |
|---|---|
| Rules | [AGENTS.md](AGENTS.md), read by every agent at the start of every session |
| Scripts | `scripts/`: `sync` (background update), `check`, `preview`, `media` (optimize), `send` (pull request + preview link) |
| Hosting | A Cloudflare Worker connected to the repo: static files from `site/public`, `/media/` from storage |
| Media | Optimized by the agent, kept in `media/`, copied to the site's own storage by one small GitHub Action |
| Knowledge | `.knowledge/` in each site: status, decisions, and how the site differs from `.nib` |

Each computer needs Git, GitHub CLI, Node.js, ffmpeg and Ghostscript; the agent installs what is missing.

## Changing .nib

`.nib` is public and every agent that uses it follows it, so changes go through a pull request reviewed by a
maintainer. A rule that applies to one site belongs in that site's `AGENTS.md`, not here.
