import type { JsonValue } from 'type-fest';

import type {
  RichTextEditorComponentNodeData,
  RichTextEditorContentSnapshot,
  RichTextEditorContentItem,
} from '../rich-text-editor/types.js';
import type { SenderSlotData, SenderTextSlotConfig, SenderSubmitType } from './types.js';
export const toSenderJsonValue = (value: unknown): JsonValue => {
  if (value === undefined) return null;
  if (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return value;
  }
  try {
    return JSON.parse(JSON.stringify(value)) as JsonValue;
  } catch {
    return String(value);
  }
};
const getSlotDefaultValue = (config: SenderSlotData) => {
  if (config.type === 'text') return config.value ?? '';
  if (config.type === 'tag') return config.props?.value ?? config.props?.label ?? '';
  return config.props?.defaultValue ?? '';
};
export const createSenderSlotNode = (
  config: Exclude<SenderSlotData, { type: 'text' }>,
  prefixCls: string,
  previousValue?: unknown,
): RichTextEditorComponentNodeData => {
  const value = toSenderJsonValue(
    previousValue === undefined ? getSlotDefaultValue(config) : previousValue,
  );
  if (config.type === 'input' || config.type === 'content') {
    return {
      key: config.key,
      name: 'input',
      value,
      props: {
        placeholder: config.props?.placeholder ?? '',
        ...(config.type === 'content' ? { class: `${prefixCls}-slot-content` } : {}),
      },
      textValue: String(value ?? ''),
    };
  }
  if (config.type === 'select') {
    return {
      key: config.key,
      name: 'select',
      value,
      props: {
        placeholder: config.props?.placeholder ?? '',
        options:
          config.props?.options.map((option) => ({
            label: option,
            value: option,
          })) ?? [],
      },
      textValue: String(value ?? ''),
    };
  }
  if (config.type === 'tag') {
    const label = config.props?.label;
    return {
      key: config.key,
      name: 'tag',
      value,
      props: {
        label:
          typeof label === 'string' || typeof label === 'number'
            ? String(label)
            : String(config.props?.value ?? ''),
      },
      textValue: String(value ?? ''),
    };
  }
  return {
    key: config.key,
    name: 'senderCustom',
    value,
    textValue: String(value ?? ''),
  };
};
export const createSenderSkillNode = (
  skill: { value: string } | undefined,
): RichTextEditorComponentNodeData | undefined =>
  skill
    ? {
        key: '__sender_skill__',
        name: 'senderSkill',
        value: skill.value,
        textValue: '',
      }
    : undefined;
export const createSenderSlotContent = (
  configs: readonly SenderSlotData[],
  skill: { value: string } | undefined,
  prefixCls: string,
  previousContent: readonly RichTextEditorContentSnapshot[] = [],
): RichTextEditorContentItem[] => {
  const previousValues = new Map(
    previousContent.flatMap((item) =>
      typeof item === 'string' ? [] : [[item.key, item.value] as const],
    ),
  );
  const skillNode = createSenderSkillNode(skill);
  return [
    ...(skillNode ? [skillNode] : []),
    ...configs.map((config) =>
      config.type === 'text'
        ? (config.value ?? '')
        : createSenderSlotNode(config, prefixCls, previousValues.get(config.key)),
    ),
  ];
};
export function resolveSenderSlotValue<T extends SenderSlotData, Skill>(
  content: readonly RichTextEditorContentSnapshot[],
  state: { configByKey: ReadonlyMap<string, T>; skill: Skill },
) {
  const result: string[] = [];
  const resolvedConfig: (SenderTextSlotConfig | (T & { value?: unknown }))[] = [];

  for (const item of content) {
    if (typeof item === 'string') {
      result.push(item);
      if (item) resolvedConfig.push({ type: 'text', value: item });
      continue;
    }
    if (item.name === 'senderSkill') continue;
    const config = state.configByKey.get(item.key);
    if (!config) continue;
    const rawValue = item.value ?? '';
    result.push(config.formatResult?.(rawValue) ?? String(rawValue));
    resolvedConfig.push({ ...config, value: rawValue } as T & { value?: unknown });
  }

  return {
    value: result.join(''),
    slotConfig: resolvedConfig,
    skill: state.skill,
  };
}
export function formatSenderSlot(slot: SenderSlotData) {
  if (slot.type === 'text') return slot.value ?? '';
  if (slot.type === 'tag') return String(slot.props?.value ?? slot.props?.label ?? '');
  const value = slot.props?.defaultValue ?? '';
  return slot.formatResult?.(value) ?? String(value);
}
export function mergeSenderSlotConfig<T extends SenderSlotData>(
  props: readonly T[] | undefined,
  runtime: readonly T[],
) {
  const propKeys = new Set((props ?? []).flatMap((item) => (item.key ? [item.key] : [])));
  return [...(props ?? []), ...runtime.filter((item) => !item.key || !propKeys.has(item.key))];
}
export function indexSenderSlotConfig<T extends SenderSlotData>(configs: readonly T[]) {
  return new Map(configs.flatMap((item) => (item.key ? [[item.key, item] as const] : [])));
}
export const shouldSenderSubmit = (
  event: Pick<KeyboardEvent, 'isComposing' | 'key' | 'ctrlKey' | 'altKey' | 'metaKey' | 'shiftKey'>,
  submitType: SenderSubmitType,
) => {
  if (event.isComposing || event.key !== 'Enter') return false;
  const modifierPressed = event.ctrlKey || event.altKey || event.metaKey;
  return (
    (submitType === 'enter' && !event.shiftKey && !modifierPressed) ||
    (submitType === 'shiftEnter' && event.shiftKey && !modifierPressed)
  );
};
