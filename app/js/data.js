// Data loading for the Leonida Trophy Guide: the trophy list and the roadmap
// are plain JSON files under app/data/, fetched once at boot. Nothing here
// reaches the network — both files are served from app/ itself.
export const KIND_LABELS = {
  story: 'Story',
  side: 'Side characters',
  activities: 'Activities',
  collectibles: 'Collectibles',
  crime: 'Crime & robberies',
  exploration: 'Exploration',
  money: 'Money',
  completion: '100% completion',
  misc: 'One-offs',
  platinum: 'Platinum',
};

export const GRADE_ORDER = ['platinum', 'gold', 'silver', 'bronze'];

export const DEMO_EARNED_IDS = [2, 3, 4, 8, 16, 20, 21, 28, 31, 35, 42, 46, 53];

export async function loadTrophyData() {
  const response = await fetch('data/trophies.json');
  if (!response.ok) throw new Error('Could not load data/trophies.json');
  return response.json();
}

export async function loadRoadmapData() {
  const response = await fetch('data/roadmap.json');
  if (!response.ok) throw new Error('Could not load data/roadmap.json');
  return response.json();
}

export function trophyById(trophies, id) {
  return trophies.find((trophy) => trophy.id === id);
}

export function sortForRoadmap(trophies) {
  return [...trophies].sort((a, b) => (a.stage - b.stage) || (a.id - b.id));
}
