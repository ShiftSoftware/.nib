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
   `<repos>/<Org>/<Repo>` (named exactly as on GitHub), or pull it if it is there. If they have no access, tell
   them to ask the site's admin to add their GitHub account, and stop.
4. **.nib.** From the site's folder: `git clone https://github.com/ShiftSoftware/.nib .nib`, or
   `git -C .nib pull` if it is there. Then `node .nib/scripts/sync.mjs`.
5. **Everything else.** From the site's folder, run `node .nib/scripts/doctor.mjs`. It lists each missing or
   unusable tool (Git name and email, ffmpeg with the encoders it needs, Ghostscript) with the command that fixes
   it. Run those commands, then run the doctor again. Repeat until it prints `OK`.
6. **Claude Code, opened anywhere.** A site's own hooks load only when Claude Code is opened in the site's folder.
   So a session opened elsewhere (a parent folder, a subfolder) still gets them, add these hooks to the
   `hooks` in `~/.claude/settings.json`, keeping what is there. Each event runs the same command, which downloads
   `hooks/claude-user.mjs` once and runs it; it clones a missing `.nib` and loads the rules for any site the
   session works in:

   | Event | Matcher |
   |---|---|
   | `SessionStart`, `UserPromptSubmit` | none |
   | `PreToolUse` | `Edit\|Write\|MultiEdit\|NotebookEdit` |
   | `PostToolUse` | `.*` |

   ```
   f="$HOME/.claude/nib-hook.mjs"; [ -s "$f" ] || curl -fsSL https://raw.githubusercontent.com/ShiftSoftware/.nib/main/hooks/claude-user.mjs -o "$f" || exit 0; node "$f"
   ```
7. **Test it.** From the site's folder: `node .nib/scripts/check.mjs` prints no errors, and
   `node .nib/scripts/preview.mjs` in the background serves the site (check its address loads, then stop it).
8. **Done.** Tell the person in one line that it is ready, and that from now on they open the folder
   `<repos>/<Org>/<Repo>` in their agent and ask for changes.
