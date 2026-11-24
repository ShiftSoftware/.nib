# .nib: nothing in between

A way to build websites as plain files that anyone edits by asking an AI agent. No CMS, no framework, no
pipeline of our own: each page is a plain HTML file, the agent is the editor, and when the host publishes it runs
one command, Hugo, which only joins each page to what every page shares (the head, the navigation, the footer).

`.nib` holds the rules and the way of working, for agents to follow: the general rules ([AGENTS.md](AGENTS.md)),
how to keep content easy to find ([organize.md](organize.md)), how to set up a repo ([install.md](install.md)) and
a computer ([setup.md](setup.md)), and templates for a site's own instructions ([starter/](starter/)). It holds
no tools. Each site keeps its own tools in its `scripts/` folder (sync, map, media, check, preview, send, doctor), its own
rules in its `AGENTS.md`, and its status and decisions in `.knowledge/`.

Every site has its own copy of `.nib`: a clone in a `.nib` folder inside the site's folder, ignored by the site's
Git, and read-only. On every prompt the site's sync undoes any change to that copy and resets it to GitHub's
`main`; a deleted copy is cloned again. The same sync notices when the site started needing a tool this computer
doesn't have, and the agent installs it before going on. In Claude Code the site's hooks run the sync, load the rules at the start
of every session, and refuse edits to `.nib`; other agents follow `AGENTS.md`. So the rules work like a skill:
every agent in every site reads the same, current version.

## Installation

Open your repo in your agent (Claude, Codex, Kimi, Cursor or any other) and give it this:

```text
Set up this repo with .nib by following https://raw.githubusercontent.com/ShiftSoftware/.nib/main/install.md
```

## How it works

**[Watch the 70-second video](guide/nib-explainer.mp4)** · [Read the explainer](https://htmlpreview.github.io/?https://github.com/ShiftSoftware/.nib/blob/main/guide/index.html)

<img src="guide/how-it-works.svg" alt="How .nib works: you ask, the agent edits the files, checks them and shows a preview on your computer; when you say done, the changes are sent, the host gives a preview link, anyone whose GitHub account can push publishes, and the site is live." width="100%">

## Changing .nib

Anyone, person or agent, can propose a change with a pull request; nothing is pushed to `main` directly. A rule
that applies to one site belongs in that site's `AGENTS.md`, not here.

Work in your own clone of this repo, never in a site's `.nib` folder: that copy is reset to `main` on every prompt
and its changes are undone.

## License

[Apache License 2.0](LICENSE). Copyright 2026 Shift Software.
