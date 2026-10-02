/** vue-docgen-api language tags use different fields for props and events/slots. */
export function extractDescription(tags: unknown, field: 'description' | 'content') {
  const description = { zh: '', en: '' };
  const values = Array.isArray(tags)
    ? tags
    : Object.values(tags && typeof tags === 'object' ? tags : {}).flat();
  for (const tag of values as unknown[]) {
    if (!tag || typeof tag !== 'object' || !('title' in tag)) continue;
    if (tag.title !== 'zh' && tag.title !== 'en') continue;
    const value = field in tag ? (tag as Record<string, unknown>)[field] : undefined;
    if (typeof value === 'string') description[tag.title] = value;
  }
  return description;
}
