# .nib: nothing in between

A way to build websites as plain files that anyone edits by asking an AI agent. No CMS, no framework, no build:
the files in Git are the website, the agent is the editor, and Cloudflare serves the files as they are.

`.nib` holds the general rules ([AGENTS.md](AGENTS.md)), a few small scripts that need only Node.js, the setup
steps for a new computer ([setup.md](setup.md)), and a starter site ([starter/](starter/)). Each site keeps its own
rules in its `AGENTS.md` and its status and decisions in `.knowledge/`.

## How it works

```
person asks ──> agent edits the files ──> check ──> local preview ──> "done" ──> pull request
                                                                                    │
                       Cloudflare preview link for the branch  <────────────────────┤
                       admin merges into main ──> Cloudflare publishes the files ───┘
```

| Part | What it is |
|---|---|
| Rules | [AGENTS.md](AGENTS.md), read by every agent at the start of every session |
| Scripts | `scripts/`: `sync` (background update), `check`, `preview`, `media` (optimize), `send` (pull request + preview link) |
| Hosting | A Cloudflare Worker connected to the repo: static files from `site/public`, `/media/` from storage |
| Media | Optimized by the agent, kept in `media/`, copied to the site's own storage by one small GitHub Action |
| Knowledge | `.knowledge/` in each site: status, decisions, and how the site differs from `.nib` |

Needs on each computer: Git, GitHub CLI, Node.js, ffmpeg and Ghostscript. [setup.md](setup.md) installs them.

## Use it

You don't do the steps; your agent does. Copy one of these into your agent (Claude, Codex, Kimi, Cursor or any
agent that works with files on your computer). It does everything it can itself and tells you in one line when it
needs you: a click in Cloudflare, a key to add on GitHub, or a name.

**A new site:**

```text
Start a new website on .nib for me.
Follow https://raw.githubusercontent.com/ShiftSoftware/.nib/main/install.md step by step.
I'm not technical: do every step yourself and keep each message to me to one short line.
```

**An existing repo:**

```text
Move https://github.com/ORG/REPO onto .nib.
Follow https://raw.githubusercontent.com/ShiftSoftware/.nib/main/install.md step by step.
I'm not technical: do every step yourself and keep each message to me to one short line.
```

**A new computer** for someone who edits a site: the prompt is in that site's README.

Keys never go in the chat. When the site's file upload needs one, the agent gives you the name and the GitHub
page to add it on, as a repository secret.

## Changing .nib

`.nib` is public and every agent that uses it follows it, so changes go through a pull request reviewed by a
maintainer. A rule that applies to one site belongs in that site's `AGENTS.md`, not here.
