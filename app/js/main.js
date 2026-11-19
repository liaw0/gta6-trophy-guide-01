// Boot for the Leonida Trophy Guide: loads the trophy list and roadmap,
// wires the toolbar, tabs and hash routing, and keeps every view in sync
// with the progress store. The app works offline — both data files are
// served from app/ and nothing else is fetched.
import { DEMO_EARNED_IDS, loadRoadmapData, loadTrophyData } from './data.js';
import { defaultFilterState, filterTrophies } from './filters.js';
import { createProgressStore } from './store.js';
import { renderAbout, renderChecklist, renderMissables, renderProgress, renderRoadmap } from './views.js';

const TABS = ['checklist', 'roadmap', 'missables', 'about'];

function showTab(tab) {
  const name = TABS.includes(tab) ? tab : 'checklist';
  for (const candidate of TABS) {
    document.getElementById(`view-${candidate}`).classList.toggle('active', candidate === name);
    document.getElementById(`tab-${candidate}`).classList.toggle('active', candidate === name);
  }
  return name;
}

async function bootLeonidaGuide() {
  const [trophyData, roadmapData] = await Promise.all([loadTrophyData(), loadRoadmapData()]);
  const trophies = trophyData.trophies;
  const sourceIndex = trophyData.sources;
  const store = createProgressStore(DEMO_EARNED_IDS, trophies);
  const filters = defaultFilterState();
  const expanded = new Set();
  let spoilersOn = true;
  let activeTab = 'checklist';

  const listEl = document.getElementById('trophyList');
  const resultCount = document.getElementById('resultCount');
  const emptyState = document.getElementById('emptyState');
  const spoilerNote = document.getElementById('spoilerNote');

  function renderAll() {
    renderProgress(trophies, store);
    const filtered = filterTrophies(trophies, { ...filters, isEarned: (trophy) => store.isEarned(trophy) });
    renderChecklist(listEl, filtered, { spoilersOn }, store, sourceIndex, expanded, toggleGuide);
    resultCount.textContent = `Showing ${filtered.length} of ${trophies.length} trophies · ${store.earnedCount()} earned`;
    emptyState.hidden = filtered.length > 0;
    spoilerNote.hidden = !spoilersOn;
    renderRoadmap(roadmapData, trophies, store, jumpToTrophy);
  }

  function toggleGuide(id) {
    if (expanded.has(id)) expanded.delete(id);
    else expanded.add(id);
    renderAll();
  }

  function jumpToTrophy(id) {
    expanded.add(id);
    showTab('checklist');
    activeTab = 'checklist';
    renderAll();
    const card = document.getElementById(`trophy-${id}`);
    if (card) {
      const rect = card.getBoundingClientRect();
      // Only scroll when the card's top is off-screen; a tall open guide may
      // run past the fold, and centring it would hide the masthead.
      if (rect.top < 80 || rect.top > window.innerHeight) {
        card.scrollIntoView({ behavior: 'auto', block: 'start' });
      }
    }
  }

  function applyHash() {
    const hash = window.location.hash.replace(/^#\/?/, '');
    if (hash.startsWith('trophy-')) {
      const id = Number(hash.slice('trophy-'.length));
      if (Number.isInteger(id) && trophies.some((trophy) => trophy.id === id)) {
        jumpToTrophy(id);
        return;
      }
    }
    if (TABS.includes(hash)) {
      activeTab = showTab(hash);
    }
  }

  // Tabs.
  for (const tab of TABS) {
    document.getElementById(`tab-${tab}`).addEventListener('click', () => {
      activeTab = showTab(tab);
      window.location.hash = tab;
    });
  }
  document.querySelector('footer a[data-goto]').addEventListener('click', (event) => {
    event.preventDefault();
    activeTab = showTab('about');
    window.location.hash = 'about';
  });

  // Toolbar.
  document.getElementById('search').addEventListener('input', (event) => {
    filters.search = event.target.value;
    renderAll();
  });
  document.getElementById('gradeFilter').addEventListener('change', (event) => {
    filters.grade = event.target.value;
    renderAll();
  });
  document.getElementById('kindFilter').addEventListener('change', (event) => {
    filters.kind = event.target.value;
    renderAll();
  });
  document.getElementById('hideEarned').addEventListener('change', (event) => {
    filters.hideEarned = event.target.checked;
    renderAll();
  });
  document.getElementById('missableOnly').addEventListener('change', (event) => {
    filters.missableOnly = event.target.checked;
    renderAll();
  });
  document.getElementById('spoilerToggle').addEventListener('change', (event) => {
    spoilersOn = event.target.checked;
    renderAll();
  });

  // Export, import and reset.
  document.getElementById('exportBtn').addEventListener('click', () => store.exportProgress());
  document.getElementById('importFile').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      const count = await store.importProgress(file, trophies.map((trophy) => trophy.name));
      resultCount.textContent = `Imported progress for ${count} trophies.`;
    } catch (error) {
      resultCount.textContent = `Import failed: ${error.message}`;
    }
    event.target.value = '';
  });
  document.getElementById('resetBtn').addEventListener('click', () => {
    if (window.confirm('Clear all earned ticks and notes in this browser?')) store.resetProgress();
  });

  // A ?q= search in the address presets the checklist filter, so a link can
  // point straight at one trophy (handy for screenshots and sharing).
  const addressParams = new URLSearchParams(window.location.search);
  const presetQuery = addressParams.get('q');
  if (presetQuery) {
    filters.search = presetQuery;
    document.getElementById('search').value = presetQuery;
  }

  store.onChange(renderAll);
  window.addEventListener('hashchange', applyHash);

  renderMissables(trophies, store, sourceIndex, expanded, toggleGuide);
  renderAbout(trophyData, sourceIndex);
  renderAll();
  applyHash();
  if (store.demoSeeded) {
    document.getElementById('nextUp').textContent += ' (Demo progress: 13 trophies ticked — use Reset to start clean.)';
  }
}

bootLeonidaGuide().catch((error) => {
  document.getElementById('trophyList').replaceChildren();
  const message = document.createElement('p');
  message.className = 'empty';
  message.textContent = `The guide could not load its trophy data: ${error.message}`;
  document.getElementById('trophyList').append(message);
});
