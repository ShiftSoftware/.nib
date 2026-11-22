# Set up a repo with .nib

For the agent. The person opened their repo in you and asked you to set it up with `.nib`. The repo may be empty
or already hold a website. Do every step yourself. Keep each message to one short line. When a step needs the
person (a click in a dashboard, a key, a choice), say exactly what to do in one line and wait. Never ask them to
paste a key into the chat.

The repo is the folder you are in. It gets its own copy of `.nib`, in a `.nib` folder inside it, ignored by its
Git, so the site works on any computer without anything else in a fixed place. Every command runs from the repo's
folder.

## 0. This computer

Follow [setup.md](setup.md) steps 1 and 2, then step 4 (clone `.nib` into this folder) and step 5. Don't go on
until `node .nib/scripts/doctor.mjs` prints `OK`: every later step uses those tools.

## 1. The repo

The repo is the folder you are in (its GitHub address: `git remote get-url origin`). Pull it, then:

- **Empty repo:** copy everything in `.nib/starter/` into it, hidden files included. Ask for the site's name,
  what it is for, and how it should look (a website or picture they like helps). Then build the first version
  yourself, following the page rules in `.nib/AGENTS.md`: `site/public/index.html`, `404.html`, `site.css` (with
  its `:root` tokens), `site.js`, and a template in `site/templates/` for each kind of page the site needs
  (a plain page, a product, an article). List the pages and templates in `AGENTS.md`.
- **Repo with a site:** `git switch -c nib/setup`. Copy from `.nib/starter/` only what is missing (add
  its `.gitignore` lines and `.claude/settings.json` to the existing ones), and move the site into this layout:

  | Path | What goes there |
  |---|---|
  | `site/public/` | The pages, `site.css`, `site.js`, fonts, `404.html`. Pages flat, no subfolders |
  | `site/templates/` | One template per kind of page, made from the existing pages (a plain page, a product, an article) |
  | `site/private/` | HTML that is kept but never published |
  | `media/` | Images, video and PDFs: run each through `node .nib/scripts/media.mjs`, and change the pages' links |
  | `scripts/` | Only the site's own extra scripts. Remove scripts that `.nib` replaces (check, preview, upload) |
  | `temp/` | Not in Git (`temp/` in `.gitignore`) |
  | `.nib/` | This site's copy of `.nib`. Not in Git (`.nib/` in `.gitignore`) |
  | `.claude/settings.json` | The starter's: runs `sync.mjs` on every prompt in Claude Code |

  Remove build tools, package files and GitHub Actions other than `.github/workflows/media.yml`.

## 2. The rules and knowledge

- `AGENTS.md`: start from the starter's. Fill in the site's name, languages, pages, media folders and sizes,
  components and allowed outside files, from the existing rules and pages. Leave out what `.nib/AGENTS.md`
  already says.
- `CLAUDE.md`: the one line `@AGENTS.md`. Remove any other `CLAUDE.md` content after moving it into `AGENTS.md`.
- `.knowledge/`: start from the starter's. Move the repo's plans, status, decisions and open questions there, and
  write down every way the site differs from `.nib`.
- `README.md`: the starter's, with the repo's address in the setup prompt. Keep the existing README's useful text
  below it.
- Replace every placeholder: `SITE-NAME`, `SITE NAME`, `ORG/REPO`, `STORAGE`, `MEDIA-STORAGE-ADDRESS`,
  `YYYY-MM-DD`.

Structure every page as [organize.md](organize.md) says (a `section` with an `id` per block, consistent repeated
items) and fill its four tables in `AGENTS.md`, so editing agents find content in one search.

## 3. Check and preview

`node .nib/scripts/check.mjs` until it prints no errors. Start `node .nib/scripts/preview.mjs` and show the
person the site. Ask if it looks right.

## 4. Publish the first version

- **Empty repo:** commit, then `git push --no-verify origin main` (the only direct push to `main`, before the
  lock in step 5; `--no-verify` skips the hook that otherwise refuses it).
- **Repo with a site:** `node .nib/scripts/send.mjs "Set up the site with .nib"` and give the person the link to
  review.

## 5. Connect it

Do what you can with `gh`; give the person one line for each step only they can do.

1. **Lock `main`.** Create a ruleset that requires a pull request and blocks force pushes on the default branch:
   `gh api repos/<org>/<repo>/rulesets --method POST --input -` with
   `{"name":"main","target":"branch","enforcement":"active","conditions":{"ref_name":{"include":["~DEFAULT_BRANCH"],"exclude":[]}},"rules":[{"type":"pull_request","parameters":{"required_approving_review_count":0,"dismiss_stale_reviews_on_push":false,"require_code_owner_review":false,"require_last_push_approval":false,"required_review_thread_resolution":false}},{"type":"non_fast_forward"}]}`.
   If GitHub refuses because of the plan (private repos on the free plan), carry on: the Git hook from `sync.mjs`
   and rule 11 keep agents off `main`. Record it in `.knowledge/`.
2. **Hosting.** Ask which host serves the site, or suggest one the organization already uses. It must serve
   `site/public/` exactly as it is (no build command), give every branch a preview link that it posts on the pull
   request, publish when `main` changes, and serve `/media/...` from the media storage. Set it up with the
   person, adding only the small settings files that host needs. Name the host in `AGENTS.md`, record the choice
   in `.knowledge/`, and put the site's address in `.knowledge/status.md`.
3. **Media storage.** Ask which storage the site uses, or suggest one the organization already has. It needs a
   public address. Point the host's `/media/` at it, and set `upload` in `.github/workflows/media.yml` to the
   command that uploads one file (it gets `FILE`, `KEY` and `TYPE`; it runs on GitHub's Ubuntu runner). Name the
   storage in `AGENTS.md` and record the choice in `.knowledge/`.
4. **Secrets.** List the keys the upload command needs. The person adds each one at
   `https://github.com/<org>/<repo>/settings/secrets/actions/new`, with the name you give. Confirm with
   `gh secret list`.
5. **Editors.** Ask who edits the site, and add them: `gh api repos/<org>/<repo>/collaborators/<login> --method PUT -f permission=push`.
   Give the person the README's setup prompt to send them.

Finish with one line: the site is ready, with its address.
