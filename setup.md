# Set up a computer for a .nib site

For the agent. The person may not be technical: do every step yourself, keep each message to one short line, and
when a step needs them (a password, a browser sign-in, a click) say exactly what to do in one line and wait.
Running this again on a set-up computer only fixes what is missing.

`<repos>` is `C:\repos` on Windows and `~/repos` on macOS and Linux, unless the person keeps their projects
somewhere else. Each site keeps its own copy of `.nib` in a `.nib` folder inside the site's folder.

1. **Git, Node.js and GitHub CLI.** Check `git --version`, `node --version` (18 or newer) and `gh --version`.
   Install what is missing:

   | | Install |
   |---|---|
   | Windows | `winget install -e --id Git.Git`, `winget install -e --id OpenJS.NodeJS.LTS` and `winget install -e --id GitHub.cli` |
   | macOS | `brew install git node gh`. If `brew` is missing, ask the person to paste the install command from https://brew.sh into the Terminal app, and wait |
   | Linux | `sudo apt install git nodejs gh` (or the system's package manager) |

   A tool installed just now may not be found until a new terminal is opened. If so, open one, or use the tool's
   full path, or ask the person to restart you.
2. **GitHub sign-in.** If `gh auth status` says they are not signed in, run
   `gh auth login --hostname github.com --git-protocol https --web` and tell the person the one-time code to enter
   in the browser. Then `gh auth setup-git`.
3. **The site.** Ask for the site's address if they didn't give it. Clone it with `gh repo clone <Org>/<Repo>` to
   `<repos>/<Org>/<Repo>` (named exactly as on GitHub), or pull it if it is there. If it can't be cloned (a
   private repo they have no access to), tell them to ask the site's admin to add their GitHub account, and stop.
   If `gh api repos/<Org>/<Repo> --jq .permissions.push` isn't `true`, run `gh repo fork --remote --remote-name fork`
   in the site's folder: their changes go from their own copy, and `origin` stays the site. If GitHub refuses the
   fork (a private repo whose organization doesn't allow it), tell them to ask the site's admin, and stop.
4. **.nib and the site's tools.** The site lists its commands in its `AGENTS.md`, under Commands. From the site's
   folder, run its sync (`node scripts/sync.mjs` in most sites): it clones `.nib` into the `.nib` folder.
5. **Everything else.** Run the site's doctor if it has one (`node scripts/doctor.mjs`). It lists each missing or
   unusable tool (Git name and email, ffmpeg with the encoders it needs, Ghostscript) with the command that fixes
   it. Run those commands, then run the doctor again. Repeat until it prints `OK`.
6. **Claude Code, opened anywhere.** A site's own hooks load only when Claude Code is opened in the site's folder.
   So that a session opened elsewhere (a parent folder, a subfolder) still gets them, if the site has a user-level
   hook (`scripts/claude-user.mjs`): copy it to `~/.claude/nib-hook.mjs`, add the site's full folder path as a
   line in `~/.claude/nib-sites.txt` (the hook runs a site's scripts only for the folders listed there), and add
   these hooks to the `hooks` in `~/.claude/settings.json`, keeping what is there. Each event runs the same
   command:

   | Event | Matcher |
   |---|---|
   | `SessionStart`, `UserPromptSubmit` | none |
   | `PreToolUse` | `Edit\|Write\|MultiEdit\|NotebookEdit` |
   | `PostToolUse` | `.*` |

   ```
   f="$HOME/.claude/nib-hook.mjs"; [ -s "$f" ] || exit 0; node "$f"
   ```
7. **Test it.** From the site's folder: the site's check prints no errors, and its preview, started in the
   background, serves the site (check its address loads, then stop it).
8. **Done.** Tell the person in one line that it is ready, and that from now on they open the folder
   `<repos>/<Org>/<Repo>` in their agent and ask for changes.
