const SHORTCUT_MODIFIER_KEYS = new Set(['alt', 'control', 'meta', 'shift']);

// 常见命名键别名（vueuse useMagicKeys 原生支持之外的常用写法）
const NAMED_KEY_ALIASES: Record<string, string> = {
  cmd: 'meta',
  command: 'meta',
  ctrl: 'control',
  option: 'alt',
  esc: 'escape',
  del: 'delete',
  ins: 'insert',
  return: 'enter',
  spacebar: 'space',
};

// 仅按 “+” 切分：键名本身可能包含 “-”/“_”（如 “-”、“page_up”），
// 旧实现按 [+_-] 切分会把这类键名切碎而无法表达。
export function getShortcutKeys(shortcut: string, aliases: Readonly<Record<string, string>>) {
  return shortcut
    .toLocaleLowerCase()
    .split('+')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((key) => {
      const namedKey = NAMED_KEY_ALIASES[key] ?? key;
      const normalizedKey = /^\d$/.test(key) ? `digit${key}` : namedKey;
      return aliases[normalizedKey] ?? normalizedKey;
    });
}

export function isShortcutPressed(
  shortcut: string,
  event: KeyboardEvent,
  currentKeys: ReadonlySet<string>,
  aliases: Readonly<Record<string, string>>,
) {
  const eventCode = event.code.toLocaleLowerCase();
  const eventKey = event.key.toLocaleLowerCase();
  const shortcutKeys = getShortcutKeys(shortcut, aliases);
  const isTriggerEvent = shortcutKeys.some(
    (key) => !SHORTCUT_MODIFIER_KEYS.has(key) && (key === eventCode || key === eventKey),
  );

  return (
    isTriggerEvent &&
    shortcutKeys.every((key) => {
      if (key === 'alt') {
        return event.altKey;
      }
      if (key === 'control') {
        return event.ctrlKey;
      }
      if (key === 'meta') {
        return event.metaKey;
      }
      if (key === 'shift') {
        return event.shiftKey;
      }

      return key === eventCode || key === eventKey || currentKeys.has(key);
    })
  );
}
