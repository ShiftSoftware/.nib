# Set up a computer for .nib

For the agent. The person may not be technical: do every step yourself, keep each message to one short line, and
when a step needs them (a password, a browser sign-in, a click) say exactly what to do in one line and wait.
Running this again on a set-up computer only fixes what is missing.

`<repos>` is `C:\repos` on Windows and `~/repos` on macOS and Linux. `<nib>` is `<repos>/ShiftSoftware/.nib`.

1. **Git and Node.js first** (needed to get `.nib`). Check `git --version` and `node --version` (18 or newer).
   Install what is missing:

   | | Install |
   |---|---|
   | Windows | `winget install -e --id Git.Git` and `winget install -e --id OpenJS.NodeJS.LTS` |
   | macOS | `brew install git node`. If `brew` is missing, ask the person to paste the install command from https://brew.sh into the Terminal app, and wait |
   | Linux | `sudo apt install git nodejs` (or the system's package manager) |

   A tool installed just now may not be found until a new terminal is opened. If so, open one, or use the tool's
   full path, or ask the person to restart you.
2. **.nib.** Clone `https://github.com/ShiftSoftware/.nib` to `<nib>`, or `git -C <nib> pull` if it is there.
3. **Everything else.** Run `node <nib>/scripts/doctor.mjs`. It lists each missing or unusable tool (GitHub CLI and
   sign-in, Git name and email, ffmpeg with the encoders it needs, Ghostscript) with the command that fixes it.
   Run those commands (for the GitHub sign-in, tell the person the one-time code to enter in the browser), then run
   the doctor again. Repeat until it prints `OK`.
4. **The site** (when the person gave you a site's address). Clone it to `<repos>/<Org>/<Repo>` (named exactly as
   on GitHub), or pull it if it is there. If they have no access, tell them to ask the site's admin to add their
   GitHub account, and stop. Then, from the site's folder: `node <nib>/scripts/check.mjs` prints no errors, and
   `node <nib>/scripts/preview.mjs` in the background serves the site (check its address loads, then stop it).
5. **Done.** Tell the person in one line that it is ready, and (if there is a site) that from now on they open the
   folder `<repos>/<Org>/<Repo>` in their agent and ask for changes.
