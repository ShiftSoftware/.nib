# Set up a repo with .nib

For the agent. The person opened their repo in you and asked you to set it up with `.nib`. The repo may be empty
or already hold a website. Do every step yourself. Keep each message to one short line. When a step needs the
person (a click in a dashboard, a key, a choice), say exactly what to do in one line and wait. Never ask them to
paste a key into the chat.

The repo is the folder you are in. It gets its own copy of `.nib`, in a `.nib` folder inside it, ignored by its
Git, and its own tools in `scripts/`, so the site works on any computer without anything else in a fixed place.
Every command runs from the repo's folder.

## 0. This computer

Follow [setup.md](setup.md) steps 1 and 2, then `git clone https://github.com/ShiftSoftware/.nib .nib` in this
folder. The tools the site's scripts use (Git, GitHub CLI, Node.js, Hugo, ffmpeg, Ghostscript) must work before step 3.

## 1. The repo

The repo is the folder you are in (its GitHub address: `git remote get-url origin`). Pull it, then:

- **Empty repo:** copy everything in `.nib/starter/` into it, hidden files included. Ask for the site's name,
  what it is for, and how it should look (a website or picture they like helps). Then build the first version
  yourself, following the page rules in `.nib/AGENTS.md` and the layout below: `site/hugo.toml`, the frame and
  the three shared parts in `site/layouts/`, `site/content/_index.html` and `404.html`, `site/static/site.css`
  (with its `:root` tokens) and `site.js`, and a template in `site/templates/` for each kind of page the site
  needs (a plain page, a product, an article). List the pages and templates in `AGENTS.md`.
- **Repo with a site:** `git switch -c nib/setup`. Copy from `.nib/starter/` only what is missing, and move the
  site into this layout:

  | Path | What goes there |
  |---|---|
  | `site/content/` | One file per page: `title` and `description` between `---` lines, then only what the page has inside `<main>`. The home page is `_index.html`; `404.html` is a page too. Pages flat, no subfolders. A page that is kept but not published has `draft: true` |
  | `site/layouts/` | `all.html`, the frame of every page (`<html>`, `<head>`, `<body>`, `<main>`), and in `_partials/` one plain HTML file each for what the pages share: `head.html` (builds the search and share tags from the page's title and description), `header.html` with the navigation, `footer.html`. `sitemap.xml` builds the sitemap from the pages. Nothing else unless the site needs it (rule 1) |
  | `site/static/` | Copied as it is: `site.css`, `site.js`, fonts, `robots.txt`, the host's own files |
  | `site/hugo.toml` | `baseURL` (the site's address), `title`, the language, `uglyURLs = true` so `about.html` is built as `about.html`, the kinds of page Hugo makes by itself turned off (`taxonomy`, `term`, `rss`, `section`, `404`), `disableHugoGeneratorInject = true`, and the lowest Hugo version the site needs |
  | `site/public/` | Not in the repo: the host builds it from the four above when it publishes |
  | `site/templates/` | One starter per kind of page, made from the existing pages (a plain page, a product, an article) |
  | `media/` | Not in Git. Media already at a public address keeps its links. Media that is only in the repo stays where it is for this first change and goes through the media command in a second change, after step 5 (the upload needs the storage) |
  | `scripts/` | The site's tools (step 2) |
  | `temp/` | Not in Git |
  | `.nib/` | This site's copy of `.nib`. Not in Git |

  Remove build tools, package files (other than a `package.json` for the host's deploy tool, rule 2) and GitHub
  Actions other than the media one.

  Moving a site whose pages were written whole, by hand: take the head, the header and the footer out of one page
  into the three shared files, and leave in each page's file only its title, its description and what was inside
  `<main>`. Then build, and compare every built page with the page it replaces: they must be the same, apart
  from what you chose to drop. Do it as its own change, with no content changes in it.

`.gitignore` lists `.nib/`, `temp/`, `node_modules/`, `site/public/`, `site/.hugo_build.lock`, and `media/` in a site with a storage.

## 2. The site's tools

Every site has its own tools in `scripts/`, small Node.js scripts with nothing to install (rule 2). Copy them
from another `.nib` site the organization has (ask the person which), or write them. They belong to this site:
change them here, and list them in `AGENTS.md` under Commands. Each must do this:

| Tool | What it must do |
|---|---|
| sync | Every prompt, returning at once: print `SETUP ...` when the doctor has not passed on this computer since the doctor itself last changed (below); clone `.nib` into `.nib/` if it is missing, undo any change to it, then in the background reset it to GitHub's `main`, and fetch `origin` (never a fork) and bring its default branch into the current branch: fast-forward when possible, otherwise a merge; skip it while a merge is in progress, leave it when Git refuses because of unsaved edits, and `git merge --abort` a merge that conflicts. With `--rules`, print `.nib/AGENTS.md`, the site's `AGENTS.md` and `.knowledge/README.md`. Print `OK syncing .nib and the site` |
| guard | Claude Code hook: refuse an edit inside `.nib/` before it happens, and undo any change to `.nib/` after each tool (exit code 2 with a one-line reason) |
| map | Reads the sources (`site/content/`, `site/layouts/`, `site/static/`, `site/templates/`). Given words: every file, line and section where they appear, saying when a line is in a part every page shares. Without words: every page, in every folder, with its title and sections ([organize.md](organize.md)) |
| media | Optimize a file into `media/<folder>/<name>` (`site/static/media/<folder>/<name>` in a site without a storage): photos to AVIF (WebP with transparency), video to MP4 at most 1920 wide, PDFs compressed, SVG and ICO kept. Keep the original in `temp/`. Refuse a name already used, on the computer or at the storage's address. Refuse anything over 25 MB. Print the tag with the real size |
| check | Build the pages first, the way the host will, into a folder under `temp/`, and stop with Hugo's own message when it fails or is not installed. Then, on the built pages: the page rules in `.nib/AGENTS.md` (names, one `h1`, `lang`, charset, viewport, title, no inline styles, a `section` id per block, unique ids, `img` with `alt`, `width` and `height`, links that resolve (relative ones, or from `/` in a site with folders), pages in folders, the search and share tags of every public page (title, description, canonical, `og:` tags) and `sitemap.xml` listing every public page and no page with `noindex`, templates, the home page, `404.html`), no script or stylesheet from another website that the site's `AGENTS.md` doesn't allow, media names, types and sizes, `.nib/`, `temp/`, `site/public/` and `media/` ignored by Git, no media in Git when the site has a storage, the hooks and the `.nib` lines in `AGENTS.md` present, `.nib` unchanged |
| preview | Build the pages, drafts included, into a folder of its own under `temp/`, keep building on every change, and serve that folder on this computer (port 8300 or the next free one) the way the host does: `about` and `about.html` both open the page, a missing page gets `404.html`. Say so when it is already running |
| send | Check. Then, when the site has a storage, send new media to it before anything is committed: hand the files to GitHub without committing them (for example as one file on a draft release, picked up by the media Action, which the send starts and waits for), switch the pages' `media/...` links to the storage's address, delete the local copies. Then start a branch if needed (never `main`), commit, bring in the latest `main`, check again when that brought anything in, push, open or update the pull request, and wait for the preview link. When the person can't push (`gh api repos/<org>/<repo> --jq .permissions.push` isn't `true`): push the branch to their fork instead (the `fork` remote, made with `gh repo fork --remote --remote-name fork` when missing, so `origin` stays the site), open the pull request against the site, don't wait for a preview, and with new media print `MEDIA FAILED no push access` before committing anything. Print what `.nib/AGENTS.md` expects: `SENT <pull request> PREVIEW <link>` (or `SENT <pull request>` with no preview), `CHECK FAILED`, `CONFLICT <files>`, `MEDIA FAILED`, `OFFLINE` |
| doctor | List every missing or unusable tool with the command that fixes it (Git name and email, GitHub sign-in, Hugo at the version the site needs, ffmpeg with its encoders, Ghostscript), or print `OK` and record, in this clone's `.git` folder, that it passed for this version of the doctor. That record is what the sync compares, so a doctor that gains a requirement is run again on every computer (rule 13) |

Also part of the site:

- `.claude/settings.json` hooks: `SessionStart` runs the sync with `--rules`; `UserPromptSubmit` runs the sync;
  `PreToolUse` (`Edit|Write|MultiEdit|NotebookEdit`) and `PostToolUse` (`.*`) run the guard.
- With a media storage, `.github/workflows/media.yml`: the one Action. Started by the send, it copies the new
  files to the storage with the repo's secrets, refuses to replace a file that is already there, and removes what
  the send handed it.

## 3. The rules and knowledge

- `AGENTS.md`: start from the starter's. Fill in the site's name, commands, languages, pages, media folders and
  sizes, components and allowed outside files, from the existing rules and pages. Leave out what
  `.nib/AGENTS.md` already says.
- `CLAUDE.md`: the one line `@AGENTS.md`. Remove any other `CLAUDE.md` content after moving it into `AGENTS.md`.
- `.knowledge/`: start from the starter's. Move the repo's plans, status, decisions and open questions there, and
  write down every way the site differs from `.nib`.
- `README.md`: the starter's, with the repo's address in the setup prompt. Keep the existing README's useful text
  below it.
- Replace every placeholder: `SITE NAME`, `ORG/REPO`, `HOST`, `STORAGE`, `YYYY-MM-DD`.

Structure every page as [organize.md](organize.md) says (a `section` with an `id` per block, consistent repeated
items) and fill its four tables in `AGENTS.md`, so editing agents find content in one search.

## 4. Check, preview and publish the first version

Run the check until it prints no errors. Start the preview and show the person the site. Ask if it looks right.

- **Empty repo:** commit, then `git push origin main`.
- **Repo with a site:** run the send with "Set up the site with .nib" and give the person the link to review.

## 5. Connect it

Do what you can with `gh`; give the person one line for each step only they can do.

1. **Protect `main`.** Create a ruleset that blocks force pushes and deleting the default branch:
   `gh api repos/<org>/<repo>/rulesets --method POST --input -` with
   `{"name":"main","target":"branch","enforcement":"active","conditions":{"ref_name":{"include":["~DEFAULT_BRANCH"],"exclude":[]}},"rules":[{"type":"deletion"},{"type":"non_fast_forward"}]}`.
   If GitHub refuses because of the plan (private repos on the free plan), carry on: rule 11 keeps agents from
   forcing. Record it in `.knowledge/`. Who publishes is set by GitHub access (step 5).
   Allow squash merging, the one way changes are published:
   `gh api repos/<org>/<repo> --method PATCH -F allow_squash_merge=true -F delete_branch_on_merge=true`.
2. **Hosting.** Ask which host serves the site, or suggest one the organization already uses. It must run Hugo as
   its one build command (`hugo --source site`), at a version the site's `hugo.toml` allows, and serve what that
   builds (`site/public/`); give every branch a preview link that it posts on the pull request; and publish when
   `main` changes. A build that fails shows as a failed check on the pull request, and the live site stays as it
   was. Set it up with the person, adding only the small settings files that
   host needs. Name the host in `AGENTS.md`, record the choice in `.knowledge/`, and put the site's address in
   `.knowledge/status.md`.
3. **Media storage.** Ask which storage the site uses, or suggest one the organization already has. It needs a
   public address that serves a file at `<address>/<path under media/>` without a key; pages link media there, so
   the host needs no setting for it. Set up the media Action's upload for it. Name the storage and its address in
   `AGENTS.md` and record the choice in `.knowledge/`.
4. **Secrets.** List the keys the upload needs. The person adds each one at
   `https://github.com/<org>/<repo>/settings/secrets/actions/new`, with the name you give. Confirm with
   `gh secret list`.
5. **Who edits and who publishes.** Push access publishes (rule 11), so give it only to people who may publish:
   `gh api repos/<org>/<repo>/collaborators/<login> --method PUT -f permission=push`. Everyone else sends changes
   from a fork for them to publish:

   | Repo | People who only send changes |
   |---|---|
   | Public | Need nothing: anyone can fork |
   | Private | Need read access (`-f permission=pull`), and the organization must allow forking private repos |

   Check the organization's base permission (`gh api orgs/<org> --jq .default_repository_permission`): `write`
   lets every member publish every repo. Give the person the README's setup prompt to send them.

Finish with one line: the site is ready, with its address.
