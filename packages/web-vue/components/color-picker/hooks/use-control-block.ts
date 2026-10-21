import { onBeforeUnmount, ref } from 'vue';

import { createColorControl } from '@sdata/web-core/color-picker/control';

interface ControlBlockParams {
  value: () => [number, number];
  onChange: (value: [number, number]) => void;
}

export const useControlBlock = ({ value, onChange }: ControlBlockParams) => {
  const active = ref(false);
  const blockRef = ref<HTMLDivElement>();
  const handlerRef = ref<HTMLDivElement>();

  const control = createColorControl({
    get block() {
      return blockRef.value;
    },
    value,
    onChange,
    setActive(value) {
      active.value = value;
    },
  });
  onBeforeUnmount(control.dispose);
  return { active, blockRef, handlerRef, onMouseDown: control.down };
};
