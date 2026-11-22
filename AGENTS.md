# .nib: nothing in between

The general rules for websites built as plain files and edited by asking an agent. Every site that uses `.nib`
follows this file. The site's own `AGENTS.md` adds what is specific to it, and its `.knowledge/` folder holds its
status and decisions. When the site's files and this file disagree, the site wins only where its `.knowledge/`
records the difference.

These instructions are for any agent (Claude, Codex, Kimi, Cursor, Gemini or another). Commands are plain
`git`, `gh` and `node`; run them in whatever shell you have.

## Where things are

- **This folder (`.nib`):** every site has its own copy, in the `.nib` folder inside the site's folder: a clone of
  `https://github.com/ShiftSoftware/.nib`, ignored by the site's Git. Every command below runs from the site's
  folder. If it is missing: `git clone https://github.com/ShiftSoftware/.nib .nib`. It is read-only (rule 12):
  every prompt resets it to GitHub's `main`, so deleting it is safe and the next prompt clones it again.
- **A site repo:**

  | Path | What it is |
  |---|---|
  | `.nib/` | This site's copy of `.nib`. Not in the site's Git; `sync.mjs` keeps it up to date |
  | `.claude/settings.json` | The Claude Code hooks from `.nib/starter/`: load the rules at the start of a session, sync on every prompt, clone `.nib` if it is missing, refuse and undo changes to `.nib`. Never change them; `sync.mjs` restores them and the check compares them |
  | `AGENTS.md` | This site's own rules: languages, page map, components, sizes, preview port, allowed outside files |
  | `.knowledge/` | Status, decisions, open questions, and anything this site does differently from `.nib` |
  | `site/public/` | The website, exactly as visitors get it. Only this folder is published. Pages sit flat in it |
  | `site/templates/` | This site's own templates, one per kind of page (`page.html`, `product.html`, `article.html`). You make and keep them. Never published |
  | `site/private/` | HTML in the repo that is never published (drafts, internal pages) |
  | `media/` | Images, video and PDFs, already optimized. Pages link them as `media/...`; on the live site they come from the media storage |
  | `scripts/` | Only this site's extra scripts. `scripts/check.mjs`, if present, runs with the general check |
  | `temp/` | Files people hand over, before they are optimized. Not in Git |
  | Hosting settings | Whatever the site's host needs; the site's `AGENTS.md` names the host |
  | `.github/workflows/media.yml` | The only GitHub Action: copies new media to the storage. Never builds or publishes |

## Who you work for

The person asking may have no technical knowledge at all: designers, marketing, writers.

- **Do what they ask.** Take the sensible default instead of asking. Ask only when you can't tell at all what they
  want.
- **Replies are one or two short lines,** in the person's language: what changed and the link to look at. Don't
  explain unless asked. No code, file names, commands, or words like branch, commit, merge, pull request, conflict
  or repo. Say "your changes", "sent for review", "preview link".
- **Fix problems yourself,** quietly. Tell the person only what they must do, in one line.
- **When a command you need is blocked or denied, ask the person to allow it.** Say in one line what it does and
  why. Don't work around the block with another tool, and don't hand them the step to do by hand.

## Every prompt

Run, from the site's folder, at the start of every prompt the person sends:

```
node .nib/scripts/sync.mjs
```

If `.nib` is missing, clone it first (above). `sync.mjs` returns at once. It undoes any change to `.nib`, restores
the site's Claude Code hooks, and then, each in its own background task, resets `.nib` to GitHub's `main` and pulls
the site. Don't wait for it, and don't mention it. Anything it can't bring in safely is brought in when the changes
are sent.

In Claude Code the site's hooks do all of this by themselves, on every session start, prompt and tool use. When
"OK syncing .nib and the site" is already in your context for this prompt, don't run it again.

Then read this site's `AGENTS.md` and `.knowledge/README.md` if you haven't in this session.

## Each request

1. Find the place fast: `node .nib/scripts/map.mjs "<words from the request>"` gives the file, line and section;
   read about 30 lines around it. Don't read whole pages. Keep every page easy to find this way: follow
   [organize.md](organize.md) whenever you add or restructure pages, sections or repeated items.
2. Make the change, following the page rules below and the site's `AGENTS.md`.
3. Images, video or PDFs: `node .nib/scripts/media.mjs <file> <folder> <name>` (see Media).
4. `node .nib/scripts/check.mjs`. Fix every error.
5. Make sure the preview runs: `node .nib/scripts/preview.mjs` in the background. It prints the address, or says
   the preview is already running. Show the person the page in your browser if you have one.
6. Reply: what changed, the preview address, and "Anything else, or are you done?"

Don't commit or send anything until the person says they are done.

## When the person is done

```
node .nib/scripts/send.mjs "<one line in English: what changed>"
```

It checks, starts a branch if needed (never `main`), commits, brings in the latest `main`, opens or updates the
pull request, and prints the preview link the site's host posts on it (it waits up to five minutes). Act on what it
prints:

| It prints | Do |
|---|---|
| `SENT ... PREVIEW <link>` | Reply in one line: "Sent for review. Preview: <link>" |
| `CHECK FAILED ...` | Fix what the check lists, run it again |
| `CONFLICT <files>` | Resolve them quietly (below), `git add` them, `git commit --no-edit`, run it again |
| `OFFLINE ...` | Tell the person in one line their changes are saved and will be sent when they are online |

More changes later go to the same branch and are sent the same way. An admin merges; merging publishes.

## Conflicts, quietly

Two people changed the same lines. Never discard anyone's work.

1. Open each file and find the conflict markers.
2. Keep both changes when they don't contradict (two new sections, two edited sentences in different places).
3. When they do contradict, keep what is already on `main` (another person's reviewed work) and apply this
   person's request again on top of it.
4. Remove every marker, run the check, and commit.
5. Tell the person nothing unless their change could not be kept as asked; then one line, such as "Someone else
   changed this section too; I kept both."

Never rebase, force-push, reset, stash or delete a branch to make a conflict go away.

## Rules (ENFORCED)

When a request seems to need something these rules forbid, say in one line which rule stops it and offer the
plain-files way. If the person still wants it, write it in the site's `.knowledge/` as a proposal and don't add
anything until it is decided there.

1. **No build step.** Nothing that compiles, bundles, transpiles, minifies or generates the served files: no
   framework, no CSS framework that needs a build, no templating or includes. Repetition across pages is fine:
   you keep it consistent and the check confirms it.
2. **Nothing to install in the project.** No `package.json`, `node_modules`, package manager or Python
   environment. The computer has Git, GitHub CLI, Node.js, ffmpeg and Ghostscript, installed once by the setup;
   nothing else.
3. **No CMS, page builder, plugin, admin panel or database for content.** The content is in the pages. A person
   who wants to change it asks their agent.
4. **No libraries or files from other websites** in the pages, except what the site's `AGENTS.md` allows. Write
   the small piece of code you need.
5. **No build or deploy pipelines.** The site's host is connected to the repo: a branch gets a preview link,
   and merging into `main` publishes the files as they are. The one GitHub Action, `media.yml` from `.nib`, only copies
   new media to the storage. Add no other.
6. **Media is optimized, kept in `media/`, and never replaced.** Everything a person gives you goes through
   `media.mjs`. A published file is never replaced: a new version gets a new name. The site's `AGENTS.md` names
   its media storage.
7. **Keys live only in the repo's GitHub secrets.** Never in a file, a page, a chat or on the person's computer. A
   site that needs a key somewhere else records where and why in its `.knowledge/`.
8. **When you get something wrong twice, add a rule or a check:** in the site's `AGENTS.md` or
   `scripts/check.mjs`. If it applies to every site, propose it to `.nib`.
9. **Non-technical people never need to leave their agent.** Show changes in the preview and give preview links,
   not GitHub, dashboards or editors.
10. **Data that lives in another system stays there.** A live list or a form comes from that system's API or web
    component, not from a copy in the pages.
11. **Never push to `main`.** Every change goes to a branch, then a pull request; an admin merges. `sync.mjs`
    installs a Git hook that refuses a push to `main`; never bypass it.
12. **`.nib` is read-only in a site.** Never edit, add, delete, commit or switch branches in a site's `.nib`, and
    never change or remove what ties the site to it: the hooks in `.claude/settings.json`, the `.nib` lines in
    `AGENTS.md`, `.nib/` in `.gitignore`. The hooks refuse such edits and undo them, `sync.mjs` resets `.nib` to
    GitHub on every prompt, and the check refuses to send a site without them. When `.nib` itself needs to change,
    write the proposal in the site's `.knowledge/` (rule 8); its maintainers change it in `.nib`'s own repo.

## Page rules

- **Templates are yours to keep.** Each site has one template in `site/templates/` per kind of page: a plain
  page, a product, an article, a branch. Every new page starts from the template of its kind: copy it into
  `site/public/`, keep its `<head>`, header and footer, fill in the main part. When a new kind of page is needed,
  make its template first, from the site's existing pages and components, then the page from it. When a shared
  block (header, footer, a component) changes, change the templates in the same change. List the templates in
  the site's `AGENTS.md`. The person never needs to know templates exist.
- Page names are lower-case English words with hyphens (`after-sales.html`).
- All pages sit directly in `site/public/`. Links are relative file names (`about.html`, `index.html#contact`).
  Never a path starting with `/`, except in `404.html`, which has `<base href="/">`.
- The blocks between `<!-- HEADER -->` and `<!-- /HEADER -->`, and `<!-- FOOTER -->` and `<!-- /FOOTER -->`, are
  identical on every page of the same language. Change one, copy it to all; the check compares them.
- Every page has `<html lang="...">`, `<meta charset="utf-8">`, the viewport meta tag, a `<title>`, and exactly
  one `<h1>`, then `<h2>`, `<h3>` in order.
- Styles only in `site/public/site.css`, from its `:root` tokens: no `style="..."`, no `<style>`. Behaviour only
  in `site/public/site.js`. Reuse what is there before adding.
- Use logical CSS properties (`margin-inline-start`, `text-align: start`), so right-to-left languages work.
- Every `<img>` has `alt` (in the page's language, says what it shows; `alt=""` if purely decorative), `width`,
  `height`, and `loading="lazy"` unless it is at the top of the page.
- Link text says where it goes. Keep the visible focus outline. Pages work with a keyboard and at 320 pixels wide.
- A picture given as a design reference is never added to the site. Take its layout, not its colours or fonts.
- Never write personal data the site doesn't already show publicly.

## Media

```
node .nib/scripts/media.mjs <file> <folder> <name> [--width 1600] [--crop 560x420]
```

- `<folder>` is under `media/` (`pages/about`, `news/2026`); `<name>` is lower-case English words with hyphens.
  The site's `AGENTS.md` lists its folders and sizes; without them, photos are at most 1600 wide.
- It optimizes whatever it is given: photos become AVIF (WebP if they have transparency), video becomes MP4 at
  most 1920 wide, PDFs are compressed, SVG and ICO are kept. The original stays in `temp/`.
- It refuses a name that is taken, and prints the `<img>` or `<video>` tag (with the real size) to put in the
  page; add the `alt`.
- No file over 25 MB, so pages stay fast. Longer video goes on YouTube.
- The preview shows `media/` straight from the computer. When the changes are sent, GitHub copies the new files to
  the storage.

## Knowledge (`.knowledge/`)

What this site's people and agents need beyond the code: status, decisions with dates, open questions, how
requirements map onto the site, and every way the site differs from `.nib`.

- **New work, decision or question:** write it in the same change as the work, and add or update its row in
  `.knowledge/README.md` with a state and a date. States: `active`, `waiting`, `done`, `proposed`, `reference`,
  `superseded`.
- If the site's organization keeps a higher-level place for decisions, record decisions that matter beyond this
  site there too.
- Everyone who can open the repo reads it. Plain words. No passwords, keys or tokens. No prices, quotes or other
  money amounts. No personal data.
- Documents, not code: Markdown, and self-contained HTML pages written for people to read.
