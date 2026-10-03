/**
 * vue-docgen-api 各描述符的文案字段并不一致：prop 用 `description`，event 用
 * `content`，而 slot 又回到 `description`。这里按优先级取值，避免因为字段名
 * 不匹配而把已经写好的双语注释整个丢掉（slot 曾因此全部提取为空）。
 */
export function extractDescription(tags: unknown, field: 'description' | 'content') {
  const description = { zh: '', en: '' };
  const values = Array.isArray(tags)
    ? tags
    : Object.values(tags && typeof tags === 'object' ? tags : {}).flat();
  for (const tag of values as unknown[]) {
    if (!tag || typeof tag !== 'object' || !('title' in tag)) continue;
    if (tag.title !== 'zh' && tag.title !== 'en') continue;
    const record = tag as Record<string, unknown>;
    const value = record[field] ?? record.description;
    if (typeof value === 'string') description[tag.title] = value;
  }
  return description;
}
