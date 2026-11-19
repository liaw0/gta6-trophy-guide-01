// Views for the Leonida Trophy Guide: the progress header, the checklist with
// its per-trophy guides, the roadmap, the missables page and the about page.
// All rendering is plain DOM code; nothing here fetches the network.
import { GRADE_ORDER, KIND_LABELS, sortForRoadmap, trophyById } from './data.js';

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function gradeBadge(trophy) {
  const badge = el('span', `badge grade-${trophy.grade}`, trophy.grade);
  badge.title = `${trophy.grade} trophy`;
  return badge;
}

function kindBadge(trophy) {
  return el('span', 'badge', KIND_LABELS[trophy.kind] ?? trophy.kind);
}

function targetBadge(trophy) {
  if (trophy.target === null || trophy.target === undefined) return null;
  const label = trophy.target >= 1000 ? trophy.target.toLocaleString('en-US') : String(trophy.target);
  const badge = el('span', 'badge target', `PSN target: ${label}`);
  badge.title = 'The count PlayStation tracks for this trophy (PSNProfiles)';
  return badge;
}

export function renderProgress(trophies, store) {
  const earned = store.earnedCount();
  document.getElementById('earnedCount').textContent = String(earned);
  const fill = document.getElementById('progressFill');
  fill.style.width = `${Math.round((earned / trophies.length) * 100)}%`;
  const bar = document.getElementById('progressBar');
  bar.setAttribute('aria-valuenow', String(earned));
  const counts = GRADE_ORDER.map((grade) => {
    const total = trophies.filter((trophy) => trophy.grade === grade).length;
    const got = trophies.filter((trophy) => trophy.grade === grade && store.isEarned(trophy)).length;
    return `${grade} ${got}/${total}`;
  }).join(' · ');
  document.getElementById('gradeCounts').textContent = counts;
  const next = sortForRoadmap(trophies).find((trophy) => !store.isEarned(trophy));
  document.getElementById('nextUp').textContent = next
    ? `Next up: ${next.name} — ${next.description}`
    : 'Platinum earned — Vice Got a Price! is yours.';
}

function buildGuideBlock(trophy, sourceIndex, store) {
  const block = el('div', 'trophy-guide');
  const heading = el('p', null, '');
  const strong = el('strong', null, 'How to get it');
  heading.append(strong, document.createTextNode(` — ${trophy.guide}`));
  block.append(heading);
  const sources = el('p', 'sources');
  sources.append(el('b', null, 'Sources: '));
  for (const key of trophy.sources) {
    const source = sourceIndex[key];
    if (!source) continue;
    const link = document.createElement('a');
    link.href = source.url;
    link.target = '_blank';
    link.rel = 'noopener';
    link.textContent = source.name;
    sources.append(link);
  }
  block.append(sources);
  const noteLabel = el('label', 'note-label', 'Your note (saved in this browser)');
  const note = document.createElement('textarea');
  note.className = 'trophy-note';
  note.rows = 2;
  note.placeholder = 'e.g. meditation spot 3 done, 2 to go…';
  note.value = store.getNote(trophy);
  note.addEventListener('change', () => store.setNote(trophy, note.value));
  noteLabel.append(note);
  block.append(noteLabel);
  return block;
}

export function renderChecklist(listEl, trophies, state, store, sourceIndex, expanded, onToggleGuide) {
  listEl.replaceChildren();
  for (const trophy of trophies) {
    const earned = store.isEarned(trophy);
    const hidden = state.spoilersOn && trophy.hidden && !earned;
    const card = el('li', `trophy-card${earned ? ' earned' : ''}${hidden ? ' spoiler-hidden' : ''}`);
    card.id = `trophy-${trophy.id}`;
    const head = el('div', 'trophy-head');
    const check = document.createElement('input');
    check.type = 'checkbox';
    check.className = 'trophy-check';
    check.checked = earned;
    check.setAttribute('aria-label', `Mark ${hidden ? 'this hidden trophy' : trophy.name} as earned`);
    check.addEventListener('change', () => store.toggleEarned(trophy));
    const title = el('div', 'trophy-title');
    title.append(el('h3', 'trophy-name', hidden ? 'Hidden trophy' : trophy.name));
    title.append(el('p', 'trophy-desc', hidden ? 'Hidden on PlayStation until earned.' : trophy.description));
    const meta = el('div', 'trophy-meta');
    meta.append(gradeBadge(trophy), kindBadge(trophy));
    const target = targetBadge(trophy);
    if (target) meta.append(target);
    if (trophy.hidden) meta.append(el('span', 'badge hidden', 'Hidden on PSN'));
    if (trophy.missable) meta.append(el('span', 'badge missable', 'Potentially missable'));
    title.append(meta);
    head.append(check, title);
    if (hidden) {
      head.append(el('span', 'badge hidden', 'Earn it to reveal'));
    } else {
      const toggle = el('button', 'guide-toggle', expanded.has(trophy.id) ? 'Hide guide' : 'Guide');
      toggle.type = 'button';
      toggle.setAttribute('aria-expanded', String(expanded.has(trophy.id)));
      toggle.addEventListener('click', () => onToggleGuide(trophy.id));
      head.append(toggle);
    }
    card.append(head);
    if (!hidden && expanded.has(trophy.id)) {
      card.append(buildGuideBlock(trophy, sourceIndex, store));
    }
    listEl.append(card);
  }
}

export function renderRoadmap(roadmap, trophies, store, onJumpToTrophy) {
  document.getElementById('roadmapLede').textContent = roadmap.hours;
  const stepsEl = document.getElementById('roadmapSteps');
  stepsEl.replaceChildren();
  for (const step of roadmap.steps) {
    const item = el('li', 'roadmap-step');
    item.append(el('h3', null, step.title));
    item.append(el('p', 'step-hours', step.hours));
    item.append(el('p', null, step.text));
    const stepTrophies = step.trophies.map((id) => trophyById(trophies, id)).filter(Boolean);
    const done = stepTrophies.filter((trophy) => store.isEarned(trophy)).length;
    item.append(el('p', 'step-progress', `${done} of ${stepTrophies.length} earned in this step`));
    const chips = el('div', 'step-trophies');
    for (const trophy of stepTrophies) {
      const chip = el('button', `badge${store.isEarned(trophy) ? ' done' : ''}`, `${store.isEarned(trophy) ? '✓ ' : ''}${trophy.name}`);
      chip.type = 'button';
      chip.title = trophy.description;
      chip.addEventListener('click', () => onJumpToTrophy(trophy.id));
      chips.append(chip);
    }
    item.append(chips);
    stepsEl.append(item);
  }
  const warningsEl = document.getElementById('roadmapWarnings');
  warningsEl.replaceChildren();
  for (const warning of roadmap.warnings) {
    const li = el('li', null, '');
    li.append(el('b', null, `${warning.title}: `), document.createTextNode(warning.text));
    warningsEl.append(li);
  }
}

export function renderMissables(trophies, store, sourceIndex, expanded, onToggleGuide) {
  const listEl = document.getElementById('missableList');
  listEl.replaceChildren();
  const missable = trophies.filter((trophy) => trophy.missable);
  for (const trophy of missable) {
    const card = el('div', 'missable-card');
    card.append(el('h3', null, `${trophy.name} — ${trophy.description}`));
    const guide = el('p', null, trophy.guide);
    card.append(guide);
    const sources = el('p', 'sources');
    sources.append(el('b', null, 'Sources: '));
    for (const key of trophy.sources) {
      const source = sourceIndex[key];
      if (!source) continue;
      const link = document.createElement('a');
      link.href = source.url;
      link.target = '_blank';
      link.rel = 'noopener';
      link.textContent = source.name;
      sources.append(link);
    }
    card.append(sources);
    listEl.append(card);
  }
  const safe = el('div', 'safe-note');
  safe.append(el('p', null, 'Everything else is safe: every story trophy pops as you play, every side-character questline stays open after the story, and nothing on the 100% checklist is missable. The only other thing to keep in mind is the save advice on the Roadmap page — there is no mission replay, so keep a save at the start of each chapter.'));
  listEl.append(safe);
  const whyEl = document.getElementById('missableWhy');
  whyEl.replaceChildren();
  const reasons = [
    'Story trophies are unmissable by design — they pop when the mission or chapter ends.',
    'All six side-character questlines (Andy, Kenton, Billy, Randy, Tyrone, Bret) stay available in free roam after the story.',
    'Strangers & Freaks, collectibles, activities and robberies are all repeatable or still open after the credits.',
    'The 100% checklist only asks for part of each category (for example 200 of 277 vehicles, 70 of 80 challenges), so nothing on it can lock you out.',
  ];
  for (const reason of reasons) {
    whyEl.append(el('li', null, reason));
  }
  void expanded;
  void onToggleGuide;
  void store;
}

export function renderAbout(trophyData, sourceIndex) {
  const body = document.getElementById('aboutBody');
  body.replaceChildren();
  const intro = el('p', null, 'This guide covers all 55 PlayStation 5 trophies of Grand Theft Auto VI. It is a static web app: open index.html in a desktop browser and it works with the network off. Your checklist progress is stored in this browser only (localStorage) and can be exported to a file and imported back.');
  body.append(intro);
  body.append(el('h3', null, 'How the list was verified'));
  const verified = el('p', null, 'Every name, description and grade was checked on 2026-11-19 against the live lists on Exophase and PSNProfiles, which agree on all 55. The PSN progress targets (for example 250 stunts, 42 shooting-range golds) come from PSNProfiles, and the hidden set — 28 trophies, 27 bronze and 1 gold — comes from GTA Zone. No name, description or grade needed correcting.');
  body.append(verified);
  body.append(el('h3', null, 'What is still unconfirmed'));
  const unconfirmed = el('p', null, 'Five trophies have no verified trigger yet, and this guide says so on each one instead of guessing: In The Beginning…, Capital Offense, Bad Luck, I Guess, The Truth Is Out There and Ten Pin. PowerPyx and GTA Zone list them as unknown as of launch; each guide in this app gives the current best lead and links the source so you can check for updates.');
  body.append(unconfirmed);
  body.append(el('h3', null, 'Sources'));
  const table = el('table', 'source-table');
  const headRow = document.createElement('tr');
  headRow.append(el('th', null, 'Source'), el('th', null, 'What it was used for'));
  table.append(headRow);
  const rows = [
    ['exophase', 'Official trophy names, descriptions and grades'],
    ['psnprofiles', 'Names, descriptions and the PSN progress target of each counted trophy'],
    ['powerpyx', 'Roadmap, per-trophy how-to, missable warning and the 100% checklist thresholds'],
    ['gtazone', 'The hidden / visible split of the list and the roadmap order'],
  ];
  for (const [key, use] of rows) {
    const source = sourceIndex[key];
    const row = document.createElement('tr');
    const nameCell = document.createElement('td');
    const link = document.createElement('a');
    link.href = source.url;
    link.target = '_blank';
    link.rel = 'noopener';
    link.textContent = source.name;
    nameCell.append(link);
    row.append(nameCell, el('td', null, use));
    table.append(row);
  }
  body.append(table);
  body.append(el('h3', null, 'How to use it'));
  const useList = el('ul', null, '');
  const tips = [
    'Tick a trophy when it pops — it stays ticked in this browser.',
    'Use the spoiler switch to keep hidden story trophies covered until you earn them.',
    'Filter by grade or kind, or search for a mission, character or keyword.',
    'Open a trophy’s Guide for the steps and its sources; add your own note if you want.',
    'Export your progress before clearing browser data — import brings it back.',
    'Add ?demo=1 to the address to preview the guide with 13 trophies already ticked.',
  ];
  for (const tip of tips) useList.append(el('li', null, tip));
  body.append(useList);
  const credit = el('p', null, `List data: ${trophyData.list ?? 'the official 55 trophies'}. Guide text is original to this app, written from the cited sources, never copied.`);
  body.append(credit);
}
