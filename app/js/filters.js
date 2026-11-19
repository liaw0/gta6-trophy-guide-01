// Checklist filtering for the Leonida Trophy Guide: grade, kind, text search,
// hide-earned and missable-only. The spoiler setting never filters — it only
// masks hidden trophies (see views.js), so the count stays honest.
export function filterTrophies(trophies, state) {
  const query = state.search.trim().toLowerCase();
  return trophies.filter((trophy) => {
    if (state.grade !== 'all' && trophy.grade !== state.grade) return false;
    if (state.kind !== 'all' && trophy.kind !== state.kind) return false;
    if (state.hideEarned && state.isEarned(trophy)) return false;
    if (state.missableOnly && !trophy.missable) return false;
    if (query) {
      const haystack = `${trophy.name} ${trophy.description} ${trophy.guide}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });
}

export function defaultFilterState() {
  return { search: '', grade: 'all', kind: 'all', hideEarned: false, missableOnly: false };
}
