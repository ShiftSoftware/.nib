import { readFileSync } from 'node:fs';
import { resolve, sep } from 'node:path';
import { siteRoot, isSiteCopy, undoNibChanges } from './lib.mjs';

// Claude Code hook: refuses edits inside a site's .nib before they happen, and undoes any change after each tool.
const site = siteRoot();
if (!isSiteCopy(site)) process.exit(0);
let event = {};
try { event = JSON.parse(readFileSync(0, 'utf8')); } catch {}
const nib = resolve(site, '.nib');

if (event.hook_event_name === 'PreToolUse') {
  const target = event.tool_input?.file_path || event.tool_input?.notebook_path;
  const full = target ? resolve(site, target) : '';
  if (full === nib || full.startsWith(nib + sep)) {
    console.error('Refused: .nib is read-only in a site and is reset to GitHub on every prompt. Change the site\'s own files instead; changes to .nib are proposed in its own repo.');
    process.exit(2);
  }
} else if (undoNibChanges()) {
  console.error('Undone: something changed files in .nib. It is read-only in a site; leave it as it is.');
  process.exit(2);
}
