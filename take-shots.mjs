// Takes the entry's 4 screenshots with headless Chrome and converts them to
// JPEG (quality 82) with Python PIL, so each stays under the 256 KiB cap.
// Run from the repo root while `node serve.ts --port 8091` is serving app/:
//   node take-shots.mjs
// Views: the checklist (cover), a trophy guide open, the roadmap, missables.
// ?demo=1 seeds 13 earned trophies so the tracker shows real progress.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, renameSync, rmSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const CHROME = join(homedir(), '.cache/ms-playwright/chromium-1255/chrome-linux64/chrome');
const BASE = 'http://localhost:8091';
const SHOTS = [
  { file: '1-checklist.jpg', url: `${BASE}/?demo=1` },
  { file: '2-guide.jpg', url: `${BASE}/?demo=1&q=Positive%20Mental%20Attitude#/trophy-28` },
  { file: '3-roadmap.jpg', url: `${BASE}/?demo=1#roadmap` },
  { file: '4-missables.jpg', url: `${BASE}/?demo=1#missables` },
];

mkdirSync('screenshots', { recursive: true });
for (const shot of SHOTS) {
  const png = `/tmp/shot-${shot.file}.png`;
  execFileSync(CHROME, ['--headless=new', '--disable-gpu', '--no-sandbox', '--window-size=1280,800', '--hide-scrollbars', '--virtual-time-budget=5000', `--screenshot=${png}`, shot.url], { stdio: 'inherit' });
  const out = join('screenshots', shot.file);
  execFileSync('python3', ['-c', `from PIL import Image; im = Image.open(${JSON.stringify(png)}).convert('RGB'); im.save(${JSON.stringify(out)}, 'JPEG', quality=82)`], { stdio: 'inherit' });
  rmSync(png, { force: true });
  const bytes = statSync(out).size;
  console.log(`${shot.file}: ${bytes} bytes${bytes > 262144 ? ' — OVER THE 256 KiB CAP' : ''}`);
}
console.log('Done. First file by name is the cover.');
