export function normalizeTag(tag) {
  if (typeof tag !== 'string') return '';
  return tag.replace(/^#+/, '').trim().toLowerCase();
}

export function normalizeTags(tags) {
  if (!Array.isArray(tags)) return [];
  return Array.from(new Set(tags.map(normalizeTag).filter(Boolean))).slice(0, 10);
}
