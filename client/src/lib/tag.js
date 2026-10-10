export function normalizeTag(tag) {
  if (typeof tag !== 'string') return '';
  return tag.replace(/^#+/, '').trim().toLowerCase();
}
