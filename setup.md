# Set up a computer for a .nib site

For the agent. The person gave you a site repo's address and this file. They may not be technical: do every step
yourself, keep each message to one short line, and when a step needs them (a password, a browser sign-in, a
click) say exactly what to do in one line and wait. Running this again on a set-up computer only fixes what is
missing.

`<repos>` is `C:\repos` on Windows and `~/repos` on macOS and Linux.

1. **Tools.** Check `git --version`, `gh --version`, `node --version` (18 or newer), `ffmpeg -version`, and
   Ghostscript (`gs --version`, or `gswin64c --version` on Windows). Install only what is missing:

   | | Install |
   |---|---|
   | Windows | `winget install -e --id Git.Git`, `GitHub.cli`, `OpenJS.NodeJS.LTS`, `Gyan.FFmpeg`, `ArtifexSoftware.GhostScript` (one `winget install -e --id <id>` each), then open a new terminal so they are found |
   | macOS | `brew install git gh node ffmpeg ghostscript`. If `brew` is missing, ask the person to paste the install command from https://brew.sh into the Terminal app, and wait |
   | Linux | `sudo apt install git gh nodejs ffmpeg ghostscript` (or the system's package manager) |

2. **GitHub.** If `gh auth status` says signed out: `gh auth login --hostname github.com --git-protocol https --web`,
   and tell the person the one-time code to enter in the browser. Then `gh auth setup-git`. If
   `git config --global user.name` or `user.email` is empty, set them from `gh api user` (the name, or the login,
   and `<id>+<login>@users.noreply.github.com`).
3. **.nib.** Clone `https://github.com/ShiftSoftware/.nib` to `<repos>/ShiftSoftware/.nib`, or `git pull` it if it
   is there.
4. **The site.** Clone the site repo to `<repos>/<Org>/<Repo>` (named exactly as on GitHub), or `git pull` it if
   it is there. If the person has no access, tell them to ask the site's admin to add their GitHub account, and
   stop.
5. **Test,** from the site's folder: `node <nib>/scripts/check.mjs` prints no errors; start
   `node <nib>/scripts/preview.mjs` in the background and check that its address loads, then stop it. Fix
   anything that fails.
6. **Done.** Tell the person in one line that it is ready, and that from now on they open the folder
   `<repos>/<Org>/<Repo>` in their agent and ask for changes.
