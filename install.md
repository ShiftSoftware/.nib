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
folder. The tools the site's scripts use (Git, GitHub CLI, Node.js, ffmpeg, Ghostscript) must work before step 3.

## 1. The repo

The repo is the folder you are in (its GitHub address: `git remote get-url origin`). Pull it, then:

- **Empty repo:** copy everything in `.nib/starter/` into it, hidden files included. Ask for the site's name,
  what it is for, and how it should look (a website or picture they like helps). Then build the first version
  yourself, following the page rules in `.nib/AGENTS.md`: `site/public/index.html`, `404.html`, `site.css` (with
  its `:root` tokens), `site.js`, and a template in `site/templates/` for each kind of page the site needs
  (a plain page, a product, an article). List the pages and templates in `AGENTS.md`.
- **Repo with a site:** `git switch -c nib/setup`. Copy from `.nib/starter/` only what is missing, and move the
  site into this layout:

  | Path | What goes there |
  |---|---|
  | `site/public/` | The pages, `site.css`, `site.js`, fonts, `404.html`. Pages flat, no subfolders |
  | `site/templates/` | One template per kind of page, made from the existing pages (a plain page, a product, an article) |
  | `site/private/` | HTML that is kept but never published |
  | `media/` | Not in Git. Media already at a public address keeps its links. Media that is only in the repo stays where it is for this first change and goes through the media command in a second change, after step 5 (the upload needs the storage) |
  | `scripts/` | The site's tools (step 2) |
  | `temp/` | Not in Git |
  | `.nib/` | This site's copy of `.nib`. Not in Git |

  Remove build tools, package files and GitHub Actions other than the media one.

`.gitignore` lists `.nib/`, `temp/` and `media/`.

## 2. The site's tools

Every site has its own tools in `scripts/`, small Node.js scripts with nothing to install (rule 2). Copy them
from another `.nib` site the organization has (ask the person which), or write them. They belong to this site:
change them here, and list them in `AGENTS.md` under Commands. Each must do this:

| Tool | What it must do |
|---|---|
| sync | Every prompt, returning at once: clone `.nib` into `.nib/` if it is missing, undo any change to it, then in the background reset it to GitHub's `main` and pull the site (`--ff-only`). Set the Git hook that refuses a push to `main`. With `--rules`, print `.nib/AGENTS.md`, the site's `AGENTS.md` and `.knowledge/README.md`. Print `OK syncing .nib and the site` |
| guard | Claude Code hook: refuse an edit inside `.nib/` before it happens, and undo any change to `.nib/` after each tool (exit code 2 with a one-line reason) |
| map | Given words: every file, line and section where they appear. Without words: every page with its title and sections ([organize.md](organize.md)) |
| media | Optimize a file into `media/<folder>/<name>`: photos to AVIF (WebP with transparency), video to MP4 at most 1920 wide, PDFs compressed, SVG and ICO kept. Keep the original in `temp/`. Refuse a name already used, on the computer or at the storage's address. Refuse anything over 25 MB. Print the tag with the real size |
| check | The page rules in `.nib/AGENTS.md` (names, one `h1`, `lang`, charset, viewport, title, no inline styles, a `section` id per block, unique ids, `img` with `alt`, `width` and `height`, relative links that resolve, identical HEADER and FOOTER per language, templates, `index.html`, `404.html`), media names, types and sizes, `.nib/`, `temp/` and `media/` ignored by Git, no media in Git, the hooks and the `.nib` lines in `AGENTS.md` present, `.nib` unchanged |
| preview | Serve `site/public/` on this computer (port 8300 or the next free one), `media/` at `/media/`, `site/private/` at `/_private/` and `site/templates/` at `/_templates/`. Say so when it is already running |
| send | Check. Then send new media to the storage before anything is committed: hand the files to GitHub without committing them (for example as one file on a draft release, picked up by the media Action, which the send starts and waits for), switch the pages' `media/...` links to the storage's address, delete the local copies. Then start a branch if needed (never `main`), commit, bring in the latest `main`, push, open or update the pull request, and wait for the preview link. Print what `.nib/AGENTS.md` expects: `SENT ... PREVIEW <link>`, `CHECK FAILED`, `CONFLICT <files>`, `MEDIA FAILED`, `OFFLINE` |
| doctor | Optional: list every missing or unusable tool with the command that fixes it, or print `OK` |

Also part of the site:

- `.claude/settings.json` hooks: `SessionStart` runs the sync with `--rules`; `UserPromptSubmit` runs the sync;
  `PreToolUse` (`Edit|Write|MultiEdit|NotebookEdit`) and `PostToolUse` (`.*`) run the guard.
- A Git `pre-push` hook, set by the sync, that refuses a push to `main`.
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

- **Empty repo:** commit, then `git push --no-verify origin main` (the only direct push to `main`, before the
  lock in step 5; `--no-verify` skips the hook that otherwise refuses it).
- **Repo with a site:** run the send with "Set up the site with .nib" and give the person the link to review.

## 5. Connect it

Do what you can with `gh`; give the person one line for each step only they can do.

1. **Lock `main`.** Create a ruleset that requires a pull request and blocks force pushes on the default branch:
   `gh api repos/<org>/<repo>/rulesets --method POST --input -` with
   `{"name":"main","target":"branch","enforcement":"active","conditions":{"ref_name":{"include":["~DEFAULT_BRANCH"],"exclude":[]}},"rules":[{"type":"pull_request","parameters":{"required_approving_review_count":0,"dismiss_stale_reviews_on_push":false,"require_code_owner_review":false,"require_last_push_approval":false,"required_review_thread_resolution":false}},{"type":"non_fast_forward"}]}`.
   If GitHub refuses because of the plan (private repos on the free plan), carry on: the sync's Git hook and
   rule 11 keep agents off `main`. Record it in `.knowledge/`.
2. **Hosting.** Ask which host serves the site, or suggest one the organization already uses. It must serve
   `site/public/` exactly as it is (no build command), give every branch a preview link that it posts on the pull
   request, and publish when `main` changes. Set it up with the person, adding only the small settings files that
   host needs. Name the host in `AGENTS.md`, record the choice in `.knowledge/`, and put the site's address in
   `.knowledge/status.md`.
3. **Media storage.** Ask which storage the site uses, or suggest one the organization already has. It needs a
   public address that serves a file at `<address>/<path under media/>` without a key; pages link media there, so
   the host needs no setting for it. Set up the media Action's upload for it. Name the storage and its address in
   `AGENTS.md` and record the choice in `.knowledge/`.
4. **Secrets.** List the keys the upload needs. The person adds each one at
   `https://github.com/<org>/<repo>/settings/secrets/actions/new`, with the name you give. Confirm with
   `gh secret list`.
5. **Editors.** Ask who edits the site, and add them: `gh api repos/<org>/<repo>/collaborators/<login> --method PUT -f permission=push`.
   Give the person the README's setup prompt to send them.

Finish with one line: the site is ready, with its address.
