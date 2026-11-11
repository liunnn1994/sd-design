import type { ReactNode } from 'react';

const scopedSlots: Record<string, readonly string[]> = {
  autoComplete: ['option'],
  cascader: ['trigger', 'option', 'label', 'tag'],
  checkbox: ['checkbox'],
  checkboxGroup: ['checkbox', 'label'],
  datePicker: ['trigger', 'cell', 'panel'],
  inputTag: ['tag'],
  mention: ['option'],
  radio: ['radio'],
  radioGroup: ['radio', 'label'],
  rangePicker: ['trigger', 'cell', 'panel'],
  rate: ['character'],
  select: ['trigger', 'option', 'label', 'tag'],
  timePicker: ['trigger'],
  transfer: ['item', 'source', 'target', 'sourceTitle', 'targetTitle'],
  treeSelect: ['trigger', 'label', 'tag'],
};

export function getJsonFormSlotProp(
  type: string | undefined,
  name: string,
  renderer: ReactNode | ((...args: never[]) => ReactNode),
): [string, unknown] {
  if (name.startsWith('render')) return [name, renderer];
  const camel = name.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());
  const slot = camel === 'panelRender' ? 'panel' : camel;
  if (type && Object.hasOwn(scopedSlots, type) && scopedSlots[type]!.includes(slot)) {
    const render = renderer as (scope: unknown) => ReactNode;
    return [
      `render${slot.charAt(0).toUpperCase()}${slot.slice(1)}`,
      (...args: unknown[]) => {
        if (typeof renderer !== 'function') return renderer;
        const [value, side] = args;
        if (slot === 'character') return render({ index: value });
        if (slot === 'cell') return render({ date: value, ...(side ? { type: side } : {}) });
        if (
          ['option', 'tag'].includes(slot) ||
          (slot === 'label' && ['select', 'checkboxGroup', 'radioGroup'].includes(type))
        )
          return render({ data: value });
        return render(value);
      },
    ];
  }
  return [
    name === 'default' ? 'children' : camel,
    typeof renderer === 'function' ? renderer() : renderer,
  ];
}
