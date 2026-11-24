# .nib: nothing in between

The general rules for websites built as plain files and edited by asking an agent. Every site that uses `.nib`
follows this file. The site's own `AGENTS.md` adds what is specific to it, and its `.knowledge/` folder holds its
status and decisions. When the site's files and this file disagree, the site wins only where its `.knowledge/`
records the difference.

These instructions are for any agent (Claude, Codex, Kimi, Cursor, Gemini or another). `.nib` holds rules and the
way of working, no tools. Each site brings its own tools in its `scripts/` folder and lists them in its
`AGENTS.md` under Commands. This file names them by what they do: **sync**, **map**, **media**, **check**,
**preview** and **send**, usually `node scripts/<name>.mjs`. They belong to the site; a site's tool is changed in
that site. [install.md](install.md) says what each must do.

## Where things are

- **This folder (`.nib`):** every site has its own copy, in the `.nib` folder inside the site's folder: a clone of
  `https://github.com/ShiftSoftware/.nib`, ignored by the site's Git. It is read-only (rule 12): the site's sync
  resets it to GitHub's `main` on every prompt and clones it again if it is missing. Every command runs from the
  site's folder.
- **A site repo:**

  | Path | What it is |
  |---|---|
  | `.nib/` | This site's copy of `.nib`. Not in the site's Git; the sync keeps it up to date |
  | `.claude/settings.json` | The site's Claude Code hooks: load the rules at the start of a session, run the sync on every prompt, refuse and undo changes to `.nib`. Change them only when asked |
  | `AGENTS.md` | This site's own rules: commands, languages, page map, components, sizes, allowed outside files |
  | `.knowledge/` | Status, decisions, open questions, and anything this site does differently from `.nib` |
  | `site/public/` | The website, exactly as visitors get it. Only this folder is published. Pages sit flat in it |
  | `site/templates/` | This site's own templates, one per kind of page (`page.html`, `product.html`, `article.html`). You make and keep them. Never published |
  | `site/private/` | HTML in the repo that is never published (drafts, internal pages) |
  | `media/` | New images, video and PDFs, already optimized, until they are sent. Not in Git (see Media) |
  | `scripts/` | This site's tools: sync, map, media, check, preview, send, and anything else it needs |
  | `temp/` | Files people hand over, before they are optimized. Not in Git |
  | Hosting settings | Whatever the site's host needs; the site's `AGENTS.md` names the host |
  | `.github/workflows/` | At most one Action: the one that copies new media to the storage. Never builds or publishes |

## Who you work for

The person asking may have no technical knowledge at all: designers, marketing, writers.

- **Do what they ask.** Take the sensible default instead of asking. Ask only when you can't tell at all what they
  want.
- **Replies are one or two short lines,** in the person's language: what changed and the link to look at. Don't
  explain unless asked. No code, file names, commands, or words like branch, commit, merge, pull request, conflict
  or repo. Say "your changes", "preview link", "publish", "sent for review".
- **Fix problems yourself,** quietly. Tell the person only what they must do, in one line.
- **When a command you need is blocked or denied, ask the person to allow it.** Say in one line what it does and
  why. Don't work around the block with another tool, and don't hand them the step to do by hand.

## Every prompt

Run the site's sync at the start of every prompt the person sends. It returns at once. It clones `.nib` if it is
missing, undoes any change to it, and then, each in its own background task, resets `.nib` to GitHub's `main` and
pulls the site. Don't wait for it, and don't mention it. Anything it can't bring in safely is brought in when the
changes are sent.

In Claude Code the site's hooks do all of this by themselves, on every session start, prompt and tool use. When
"OK syncing .nib and the site" is already in your context for this prompt, don't run it again.

Then read this site's `AGENTS.md` and `.knowledge/README.md` if you haven't in this session.

## Each request

1. Find the place fast: the map, given words from the request, gives the file, line and section; read about 30
   lines around it. Don't read whole pages. Keep every page easy to find this way: follow
   [organize.md](organize.md) whenever you add or restructure pages, sections or repeated items.
2. Make the change, following the page rules below and the site's `AGENTS.md`. Then bring the page's search and
   share tags up to date (see Search engines and sharing): the person never asks for them, every page needs them.
3. Images, video or PDFs: the media command (see Media).
4. The check. Fix every error.
5. Make sure the preview runs, in the background. It prints the address, or says
   the preview is already running. Show the person the page in your browser if you have one.
6. Reply: what changed, the preview address, and "Anything else, or are you done?"

Don't commit or send anything until the person says they are done.

## When the person is done

When the person can publish (see Publishing), ask once, in one line: "Publish now, or see a preview link first?"
Most people want to publish now; skip the question when they already said "publish". Then run the site's send
with one line in English saying what changed. It checks, sends new media to the storage
(see Media), starts a branch if needed, commits, brings in the latest `main`, pushes (to the person's fork when
they can't push to the site), opens or updates the pull request, and prints the preview link the site's host
posts on it. Act on what it prints:

| It prints | Do |
|---|---|
| `SENT ... PREVIEW <link>` | They chose publish now: publish at once (below), without waiting for the preview. They chose a preview: "Preview: <link>. Say publish when it looks right." They can't publish: "Sent for review. Preview: <link>" |
| `SENT ...` with no preview | The same reply without the link. A host may not preview changes sent from a fork |
| `CHECK FAILED ...` | Fix what the check lists, run it again |
| `CONFLICT <files>` | Resolve them quietly (below), `git add` them, `git commit --no-edit`, run it again |
| `MEDIA FAILED no push access` | Tell the person in one line that pictures and files can only be added by someone with access to the site |
| `MEDIA FAILED ...` | Nothing was sent and the files are still in `media/`. A name already used: add the file again under a new name, change the page, run it again. Anything else: tell the person in one line their images couldn't be uploaded yet and an admin must look at the site's media storage |
| `OFFLINE ...` | Tell the person in one line their changes are saved and will be sent when they are online |

More changes before publishing go to the same branch and are sent the same way.

## Publishing

Merging into `main` publishes. Whoever's GitHub account has push access to the site may publish; GitHub decides,
not you. `gh api repos/<org>/<repo> --jq .permissions.push` prints `true` for them. The same holds for private and
public repos:

| The person's account | Their changes |
|---|---|
| Can push | They publish themselves |
| Can read, not push | Go from their fork as a pull request, and someone with push access publishes. A public repo lets anyone do this; a private one only people an admin gave read access, when the organization allows forking private repos |
| Can't read (a private repo) | Can't be made. Tell them in one line to ask the site's admin to add their GitHub account |

- **"Publish"** from someone who can push: send first if anything is unsent, then
  `gh pr merge <number> --merge --delete-branch` (`--squash` when the repo allows only that). It deletes the
  merged branch on GitHub and on the computer; then `git switch main` and `git pull --ff-only`, so the next change
  starts on a new branch. A merged branch is never reused. Reply in one line: "Published. Live in a few minutes:
  <site address>".
- **Straight to `main`,** only when someone who can push asks for it and there is no new media: run the check,
  commit on `main`, `git pull --ff-only`, `git push`. Never force.
- **GitHub refuses** a merge or a push: reply "Sent for review; the site's team will publish it." Don't try another
  way.

Someone working from a fork follows every other rule the same way: the sync on every prompt (it pulls the site,
not the fork), the check, the preview.

## Conflicts, quietly

Two people changed the same lines. Never discard anyone's work.

1. Open each file and find the conflict markers.
2. Keep both changes when they don't contradict (two new sections, two edited sentences in different places).
3. When they do contradict, keep what is already on `main` (another person's published work) and apply this
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
4. **No libraries or files from other websites** in the pages, except the site's media storage and what the site's
   `AGENTS.md` allows. Write the small piece of code you need.
5. **No build or deploy pipelines.** The site's host is connected to the repo: a branch gets a preview link,
   and merging into `main` publishes the files as they are. The site's one GitHub Action only copies new media to
   the storage. Add no other.
6. **Media is optimized and never replaced.** Everything a person gives you goes through the site's media
   command. With a media storage, it waits in `media/`, which Git ignores, and goes to the storage when the
   changes are sent, before anything is committed; the pages link the storage's address. A site without a
   storage yet keeps the optimized files in the repo, in `site/public/media/`, linked as `media/...`, and says so
   in its `AGENTS.md` and `.knowledge/`; they move to the storage when it is ready. A published file is never
   replaced: a new version gets a new name. The site's `AGENTS.md` names its media storage, or says it has none.
7. **Keys live only in the repo's GitHub secrets.** Never in a file, a page, a chat or on the person's computer. A
   site that needs a key somewhere else records where and why in its `.knowledge/`.
8. **When you get something wrong twice, add a rule or a check:** in the site's `AGENTS.md` or its check. If it applies to every site, propose it to `.nib`.
9. **Non-technical people never need to leave their agent.** Show changes in the preview and give preview links,
   not GitHub, dashboards or editors.
10. **Data that lives in another system stays there.** A live list or a form comes from that system's API or web
    component, not from a copy in the pages.
11. **Publishing follows GitHub access.** Only someone whose account can push publishes: by merging their pull
    request, or by pushing to `main` when they ask (see Publishing). Everyone else sends from their fork. Never
    force-push to `main` or delete it, and never work around GitHub refusing a push or a merge.
12. **`.nib` is read-only in a site.** Never edit, add, delete, commit or switch branches in a site's `.nib`, and
    never change or remove what ties the site to it: the hooks in `.claude/settings.json`, the `.nib` lines in
    `AGENTS.md`, `.nib/` in `.gitignore`. The hooks refuse such edits and undo them, the sync resets `.nib` to
    GitHub on every prompt, and the check refuses to send a site without them. When `.nib` itself needs to change,
    write the proposal in the site's `.knowledge/` (rule 8); its maintainers change it in `.nib`'s own repo.

## Page rules

- **Templates are yours to keep.** Each site has one template in `site/templates/` per kind of page: a plain
  page, a product, an article, a branch. Every new page starts from the template of its kind: copy it into
  `site/public/` or the page's folder, keep its `<head>`, header and footer, fill in the main part. When a new kind of page is needed,
  make its template first, from the site's existing pages and components, then the page from it. When a shared
  block (header, footer, a component) changes, change the templates in the same change. List the templates in
  the site's `AGENTS.md`. The person never needs to know templates exist.
- Page names are lower-case English words with hyphens (`after-sales.html`).
- **Folders by topic.** A small site keeps its pages directly in `site/public/`. When a topic has more than one
  page (about, news, products, branches) give it a folder named after it, with `index.html` as its main page:
  `about/index.html`, `about/history.html`, `about/team.html`. Do it when a topic gets its second page, or when the
  site passes about ten pages: move the pages in their own change, with redirects from the old addresses (see
  Search engines and sharing). The site's `AGENTS.md` says whether it uses folders.
- **Links.** Without folders, links are relative file names (`about.html`, `index.html#contact`), never a path
  starting with `/`, except in `404.html`, which has `<base href="/">`. With folders, every link and file path
  starts with `/` and leaves out `.html` and `index.html` (`/about/history`, `/#contact`, `/site.css`), so the
  header and footer stay identical at every depth. Switch the whole site at once.
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

## Search engines and sharing

Every public page carries these in its `<head>`, kept true to what the page says. Add them to a new page, fix
them on every change that alters a page's subject, title or address, and keep them in every template. The
site's `AGENTS.md` gives its address (`<site>` below) and its share image.

- `<title>`: the page's own name, then the site's name; unique, about 60 characters at most.
- `<meta name="description">`: one sentence, at most about 155 characters, saying what is on this page.
- `<link rel="canonical" href="<site>/<path>">`: the page's one full address, as the host serves it.
- Sharing: `og:type` (`website`; `article` for news), `og:site_name`, `og:title`, `og:description`, `og:url` (the
  canonical address), `og:locale` (`ru_RU`, `en_US`), `og:image` (a full address; the page's own picture, or the
  site's share image, 1200 × 630, in `media/site/`, a JPEG: not every app that shows link previews reads AVIF
  or WebP) with `og:image:width` and `og:image:height`, and
  `<meta name="twitter:card" content="summary_large_image">`.
- `<link rel="icon">` and `<meta name="theme-color">`, the same on every page.
- Structured data where it fits, one `<script type="application/ld+json">` in the `<head>`: `Organization` or
  `WebSite` on the home page, `Event`, `Article`, `FAQPage`, `Product`, `LocalBusiness`. It is data, not
  behaviour, so it is the one script allowed outside `site.js`. Only what the page itself shows.
- A multilingual site: `<link rel="alternate" hreflang="...">` to each language's version of the page.
- `site/public/sitemap.xml` lists every public page by its canonical address; `robots.txt` allows all and names
  the sitemap. A new, moved or removed page changes the sitemap in the same change. A moved or removed page gets
  a redirect from its old address in the host's redirect file (`_redirects` on Cloudflare and Netlify).
- `404.html`, `site/private/` and a site not yet open to search engines carry
  `<meta name="robots" content="noindex">`; the site's `AGENTS.md` says when a whole site is kept out.

## Media

The site's media command takes the file, a folder and a name, and a width or crop when the site's `AGENTS.md`
asks for one.

- `<folder>` is under `media/` (`pages/about`, `news/2026`); `<name>` is lower-case English words with hyphens.
  The site's `AGENTS.md` lists its folders and sizes; without them, photos are at most 1600 wide.
- It optimizes whatever it is given: photos become AVIF (WebP if they have transparency), video becomes MP4 at
  most 1920 wide, PDFs are compressed, SVG and ICO are kept. The original stays in `temp/`.
- It refuses a name already used, on the computer or in the storage, and prints the `<img>` or `<video>` tag (with the real size) to put in the
  page; add the `alt`.
- No file over 25 MB, so pages stay fast. Longer video goes on YouTube.
- A site without a storage: the media command writes to `site/public/media/` and the files are committed with
  the pages (rule 6). Everything below applies once it has one.
- The preview shows `media/` straight from the computer. When the changes are sent, the send hands the new files
  to GitHub without committing them, GitHub copies them to the storage with the repo's secrets (keys never come to
  the computer, rule 7), the pages' `media/...` links become the storage's address, and the local copies are
  deleted. Only then is anything committed.
- Never change a link to the storage by hand. A new version goes through the media command under a new name.

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
