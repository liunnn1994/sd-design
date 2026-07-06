import { ref } from 'vue';

import { throttleByRaf } from '../../_utils/throttle-by-raf';

interface ControlBlockParams {
  value: [number, number];
  onChange: (value: [number, number]) => void;
}

export const useControlBlock = ({ value, onChange }: ControlBlockParams) => {
  const active = ref(false);
  const blockRef = ref<HTMLDivElement>();
  const handlerRef = ref<HTMLDivElement>();

  // 快速拖拽时按帧合并颜色更新，避免每次 mousemove 都触发完整的颜色重算与重渲染
  const throttledChange = throttleByRaf(onChange);

  const getPercentNumber = (value: number, max: number) => {
    if (value < 0) return 0;
    if (value > max) return 1;
    return value / max;
  };

  const setCurrentPosition = (ev: MouseEvent) => {
    if (!blockRef.value) return;
    const { clientX, clientY } = ev;
    const rect = blockRef.value.getBoundingClientRect();
    const newValue: [number, number] = [
      getPercentNumber(clientX - rect.x, rect.width),
      getPercentNumber(clientY - rect.y, rect.height),
    ];
    if (newValue[0] !== value[0] || newValue[1] !== value[1]) {
      throttledChange(newValue);
    }
  };

  const removeListener = () => {
    active.value = false;
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', removeListener);
    window.removeEventListener('contextmenu', removeListener);
  };

  const onMouseDown = (ev: MouseEvent) => {
    // 阻止默认行为，避免快速拖拽时浏览器触发页面文字选中
    ev.preventDefault();
    active.value = true;
    setCurrentPosition(ev);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', removeListener);
    window.addEventListener('contextmenu', removeListener);
  };

  function onMouseMove(ev: MouseEvent) {
    ev.preventDefault();
    if (ev.buttons > 0) {
      setCurrentPosition(ev);
    } else {
      removeListener();
    }
  }

  return {
    active,
    blockRef,
    handlerRef,
    onMouseDown,
  };
};
