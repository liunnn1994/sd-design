import { getMarkdown } from 'markstream-vue';

// 只缓存无状态的实体工具，避免为每段 HTML 文本创建一个 Markdown 解析器。
let unescapeEntity: ((entity: string) => string) | undefined;

export function decodeHtmlEntities(value: string): string {
  if (!value.includes('&')) return value;
  // 上游的 utils 类型为 Record<string, unknown>，收窄其公开工具的签名。
  unescapeEntity ??= getMarkdown().utils.unescapeAll as (entity: string) => string;
  const decode = (text: string) =>
    text.replace(/&(?:#(?:x[\da-f]+|\d+)|[a-z][\da-z]*);/gi, (entity) => unescapeEntity!(entity));
  // 撤销 sanitizer 的转义，再还原源 HTML 实体；保留反斜杠，不重新解析成标签。
  return decode(decode(value));
}
