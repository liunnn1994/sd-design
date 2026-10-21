import { onBeforeUnmount, Ref, ref } from 'vue';

import { createDialogDrag } from '@sdata/web-core/dialog/drag';

export const useDraggable = ({
  modalRef,
  wrapperRef,
  draggable,
  alignCenter,
}: {
  modalRef: Ref<HTMLElement | undefined>;
  wrapperRef: Ref<HTMLElement | undefined>;
  draggable: Ref<boolean>;
  alignCenter: Ref<boolean>;
}) => {
  const position = ref<[number, number]>();
  const drag = createDialogDrag({
    get modal() {
      return modalRef.value;
    },
    get wrapper() {
      return wrapperRef.value;
    },
    get draggable() {
      return draggable.value;
    },
    get alignCenter() {
      return alignCenter.value;
    },
    setPosition(value) {
      position.value = value;
    },
  });
  onBeforeUnmount(drag.up);
  return { position, handleMoveDown: drag.down };
};
