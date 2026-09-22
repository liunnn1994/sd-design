export function normalizeTokenKey(key: string): string {
  return key
    .trim()
    .replace(/([a-z\d])([A-Z])/g, '$1-$2')
    .replace(/([a-zA-Z])(\d+)/g, '$1-$2')
    .replace(/(\d+)([a-zA-Z])/g, '$1-$2')
    .replace(/[_\s]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}
