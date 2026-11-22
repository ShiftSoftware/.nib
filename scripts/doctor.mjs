import { run, nibRoot, ghostscript } from './lib.mjs';

const os = process.platform === 'win32' ? 'windows' : process.platform === 'darwin' ? 'macos' : 'linux';
const install = {
  git: { windows: 'winget install -e --id Git.Git', macos: 'brew install git', linux: 'sudo apt install git' },
  gh: { windows: 'winget install -e --id GitHub.cli', macos: 'brew install gh', linux: 'sudo apt install gh' },
  node: { windows: 'winget install -e --id OpenJS.NodeJS.LTS', macos: 'brew install node', linux: 'sudo apt install nodejs' },
  ffmpeg: { windows: 'winget install -e --id Gyan.FFmpeg', macos: 'brew install ffmpeg', linux: 'sudo apt install ffmpeg' },
  ghostscript: { windows: 'winget install -e --id ArtifexSoftware.GhostScript', macos: 'brew install ghostscript', linux: 'sudo apt install ghostscript' },
};

const problems = [];
const need = (ok, what, fix) => { if (!ok) problems.push(`${what}  ->  ${fix}`); };

need(Number(process.versions.node.split('.')[0]) >= 18, `Node.js 18 or newer (this is ${process.versions.node})`, install.node[os]);

need(run('git', ['--version']).ok, 'Git', install.git[os]);

const gh = run('gh', ['--version']);
need(gh.ok, 'GitHub CLI', install.gh[os]);
if (gh.ok) need(run('gh', ['auth', 'status']).ok, 'GitHub sign-in', 'gh auth login --hostname github.com --git-protocol https --web, then gh auth setup-git');

const name = run('git', ['config', '--global', 'user.name']).out;
const email = run('git', ['config', '--global', 'user.email']).out;
need(name && email, 'Git name and email', 'set them from gh api user: the name (or login) and <id>+<login>@users.noreply.github.com');

const encoders = run('ffmpeg', ['-hide_banner', '-encoders']);
need(encoders.ok, 'ffmpeg', install.ffmpeg[os]);
if (encoders.ok) {
  need(/libsvtav1|libaom-av1/.test(encoders.out), 'ffmpeg with an AV1 encoder (photos)', `a full ffmpeg build: ${install.ffmpeg[os]}`);
  need(/libwebp\b/.test(encoders.out), 'ffmpeg with WebP (transparent images)', `a full ffmpeg build: ${install.ffmpeg[os]}`);
  need(/libx264\b/.test(encoders.out), 'ffmpeg with H.264 (video)', `a full ffmpeg build: ${install.ffmpeg[os]}`);
}
need(run('ffprobe', ['-version']).ok, 'ffprobe (comes with ffmpeg)', install.ffmpeg[os]);

need(ghostscript(), 'Ghostscript (PDFs)', install.ghostscript[os]);

const nib = run('git', ['-C', nibRoot, 'remote', 'get-url', 'origin']);
need(nib.ok && /ShiftSoftware\/\.nib/i.test(nib.out), `.nib cloned with Git at ${nibRoot}`, 'git clone https://github.com/ShiftSoftware/.nib');

if (problems.length) {
  console.log(`MISSING ${problems.length}:`);
  for (const p of problems) console.log(`- ${p}`);
  console.log('After installing, open a new terminal (or restart the agent) so new tools are found, and run this again.');
  process.exit(1);
}
console.log('OK everything .nib needs is installed and working.');
