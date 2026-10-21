import { nextTick, ref, toRefs, watch, watchEffect } from 'vue';

import { createImageDrag } from '@sdata/web-core/image/drag';

interface ImageDragProps {
  wrapperEl: HTMLElement;
  imageEl: HTMLElement;
  scale: number;
}

export default function useImageDrag(props: ImageDragProps) {
  const { wrapperEl, imageEl, scale } = toRefs(props);

  const translate = ref([0, 0]);

  const moving = ref(false);

  const drag = createImageDrag({
    get wrapper() {
      return wrapperEl.value;
    },
    get image() {
      return imageEl.value;
    },
    get scale() {
      return scale.value;
    },
    get translate() {
      return translate.value;
    },
    setTranslate(value) {
      translate.value = value;
    },
    setMoving(value) {
      moving.value = value;
    },
  });
  watchEffect((onInvalidate) => onInvalidate(drag.connect(imageEl.value)));
  watch([scale], () => {
    void nextTick(drag.fix);
  });
  return { translate, moving, resetTranslate: drag.resetTranslate };
}
