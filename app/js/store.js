// Progress store for the Leonida Trophy Guide: earned trophies and per-trophy
// notes live in localStorage only, so progress survives reloads and never
// leaves the browser. Export writes a JSON file; import reads one back.
export const STORAGE_KEY = 'leonida-trophy-guide-progress-v1';

function blankState() {
  return { earned: [], notes: {} };
}

function readStoredState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.earned)) return null;
    return { earned: parsed.earned.filter((name) => typeof name === 'string'), notes: parsed.notes && typeof parsed.notes === 'object' ? parsed.notes : {} };
  } catch {
    return null;
  }
}

export function createProgressStore(demoEarnedIds, trophies) {
  let state = readStoredState();
  const seededDemo = !state && new URLSearchParams(window.location.search).has('demo');
  if (!state) {
    state = blankState();
    if (seededDemo) {
      state.earned = trophies.filter((trophy) => demoEarnedIds.includes(trophy.id)).map((trophy) => trophy.name);
      persistState(state);
    }
  }
  const earned = new Set(state.earned);
  const notes = { ...state.notes };
  let listeners = [];

  function persistState(next) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Private browsing or a full store: progress still works in memory.
    }
  }

  function persist() {
    persistState({ earned: [...earned], notes });
  }

  function notify() {
    for (const listener of listeners) listener();
  }

  return {
    get demoSeeded() {
      return seededDemo;
    },
    isEarned(trophy) {
      return earned.has(trophy.name);
    },
    earnedCount() {
      return earned.size;
    },
    earnedNames() {
      return [...earned];
    },
    toggleEarned(trophy) {
      if (earned.has(trophy.name)) earned.delete(trophy.name);
      else earned.add(trophy.name);
      persist();
      notify();
    },
    getNote(trophy) {
      return notes[trophy.name] ?? '';
    },
    setNote(trophy, text) {
      if (text.trim()) notes[trophy.name] = text;
      else delete notes[trophy.name];
      persist();
    },
    onChange(listener) {
      listeners.push(listener);
    },
    exportProgress() {
      const blob = new Blob([JSON.stringify({ game: 'Grand Theft Auto VI', exportedAt: new Date().toISOString(), earned: [...earned], notes }, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'gta6-trophy-progress.json';
      anchor.click();
      URL.revokeObjectURL(url);
    },
    async importProgress(file, validNames) {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const names = Array.isArray(parsed) ? parsed : parsed.earned;
      if (!Array.isArray(names)) throw new Error('That file does not look like exported progress.');
      const known = new Set(validNames);
      const imported = names.filter((name) => typeof name === 'string' && known.has(name));
      if (imported.length === 0) throw new Error('No trophy names in that file matched this guide.');
      earned.clear();
      for (const name of imported) earned.add(name);
      if (parsed.notes && typeof parsed.notes === 'object') {
        for (const [name, note] of Object.entries(parsed.notes)) {
          if (known.has(name) && typeof note === 'string') notes[name] = note;
        }
      }
      persist();
      notify();
      return imported.length;
    },
    resetProgress() {
      earned.clear();
      for (const key of Object.keys(notes)) delete notes[key];
      persist();
      notify();
    },
  };
}
