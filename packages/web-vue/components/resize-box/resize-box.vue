<template>
  <component :is="component" ref="wrapperRef" :class="classNames" v-bind="$attrs" :style="styles">
    <slot />
    <ResizeTrigger
      v-for="direction in allowDirections"
      :key="direction"
      :prefix-cls="`${prefixCls}-trigger`"
      :class="`${prefixCls}-direction-${direction}`"
      :direction="isHorizontal(direction) ? 'horizontal' : 'vertical'"
      @mousedown="
        (e: MouseEvent) => {
          onMoveStart(direction, e);
        }
      "
      @resize="
        (entry) => {
          onTiggerResize(direction, entry);
        }
      "
      @keydown="
        (e: KeyboardEvent) => {
          onTriggerKeydown(direction, e);
        }
      "
    >
      <slot v-if="$slots['resize-trigger']" name="resize-trigger" :direction="direction" />
      <template v-if="$slots['resize-trigger-icon']" #icon>
        <slot name="resize-trigger-icon" :direction="direction" />
      </template>
    </ResizeTrigger>
  </component>
</template>
<script setup lang="ts">
  import { computed, PropType, toRefs, ref, reactive } from 'vue';

  import ResizeTrigger from '../_components/resize-trigger.vue';
  import useMergeState from '../_hooks/use-merge-state';
  import { off, on } from '../_utils/dom';
  import { getPrefixCls } from '../_utils/global-config';
  import { isNumber } from '../_utils/is';
  import { KEYBOARD_KEY } from '../_utils/keyboard';

  export type DirectionType = 'left' | 'right' | 'top' | 'bottom';

  type PaddingCSSProperties = 'padding-left' | 'padding-right' | 'padding-top' | 'padding-bottom';

  const DIRECTION_LEFT = 'left';
  const DIRECTION_RIGHT = 'right';
  const DIRECTION_TOP = 'top';
  const DIRECTION_BOTTOM = 'bottom';

  const allDirections: DirectionType[] = [
    DIRECTION_LEFT,
    DIRECTION_RIGHT,
    DIRECTION_TOP,
    DIRECTION_BOTTOM,
  ];

  function getRealSize(pageSize: number, padding: number) {
    if (pageSize === 0) return 0;

    const res = pageSize - padding;
    return res <= 0 ? 0 : res;
  }

  function isHorizontal(direction: DirectionType) {
    return [DIRECTION_TOP, DIRECTION_BOTTOM].indexOf(direction) > -1;
  }

  defineOptions({ name: 'ResizeBox' });

  const props = defineProps({
    /**
     * @zh 宽度
     * @en Width
     * @vModel
     */
    width: {
      type: Number,
    },
    /**
     * @zh 高度
     * @en Height
     * @vModel
     */
    height: {
      type: Number,
    },
    /**
     * @zh 伸缩框的 html 标签
     * @en The html tag of the telescopic box
     */
    component: {
      type: String,
      default: 'div',
    },
    /**
     * @zh 可以进行伸缩的边，有上、下、左、右可以使用
     * @en Can be stretched side, there are up, down, left and right can be used
     * */
    directions: {
      type: Array as PropType<('left' | 'right' | 'top' | 'bottom')[]>,
      default: () => ['right'],
    },
  });

  const emit = defineEmits<{
    'update:width': [_width: number];
    'update:height': [_height: number];
    /**
     * @zh 拖拽开始时触发
     * @en Triggered when dragging starts
     * @param {MouseEvent} ev
     */
    'movingStart': [_ev: MouseEvent];
    /**
     * @zh 拖拽时触发
     * @en Triggered when dragging
     * @param {{ width: number; height: number; }} size
     * @param {MouseEvent} ev
     */
    'moving': [_size: { width: number; height: number }, _ev: MouseEvent];
    /**
     * @zh 拖拽结束时触发
     * @en Triggered when the drag ends
     * @param {MouseEvent} ev
     */
    'movingEnd': [_ev: MouseEvent];
  }>();

  /**
   * @zh 伸缩杆的内容
   * @en The contents of the resize pole
   * @slot resize-trigger
   * @binding {'left' | 'right' | 'top' | 'bottom'} direction
   */
  /**
   * @zh 伸缩杆的图标
   * @en Resize pole icon
   * @slot resize-trigger-icon
   * @binding {'left' | 'right' | 'top' | 'bottom'} direction
   */

  const { height: propHeight, width: propWidth, directions } = toRefs(props);

  const [resWidth, setResWidth] = useMergeState<number | null>(
    null,
    reactive({
      value: propWidth,
    }),
  );

  const [resHeight, setResHeight] = useMergeState<number | null>(
    null,
    reactive({
      value: propHeight,
    }),
  );

  const wrapperRef = ref<HTMLDivElement>();

  const paddingStyles = reactive<Partial<Record<PaddingCSSProperties, string>>>({});

  const prefixCls = getPrefixCls('resizebox');
  const classNames = computed(() => [prefixCls]);
  const styles = computed(() => {
    return {
      ...(isNumber(resWidth.value) ? { width: `${resWidth.value}px` } : {}),
      ...(isNumber(resHeight.value) ? { height: `${resHeight.value}px` } : {}),
      ...paddingStyles,
    };
  });
  const allowDirections = computed(() =>
    directions.value.filter((direction) => allDirections.includes(direction)),
  );

  const record = {
    direction: '',
    startPageX: 0,
    startPageY: 0,
    startWidth: 0,
    startHeight: 0,
    moving: false,
    padding: {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
    },
  };

  function onMoving(e: MouseEvent) {
    if (!record.moving) return;

    const { startPageX, startPageY, startWidth, startHeight, direction } = record;
    let newWidth = startWidth;
    let newHeight = startHeight;

    // 往右移动的距离
    const offsetX = e.pageX - startPageX;
    // 往下移动的距离
    const offsetY = e.pageY - startPageY;

    switch (direction) {
      case DIRECTION_LEFT:
        newWidth = startWidth - offsetX;
        setResWidth(newWidth);
        emit('update:width', newWidth);
        break;
      case DIRECTION_RIGHT:
        newWidth = startWidth + offsetX;
        setResWidth(newWidth);
        emit('update:width', newWidth);
        break;
      case DIRECTION_TOP:
        newHeight = startHeight - offsetY;
        setResHeight(newHeight);
        emit('update:height', newHeight);
        break;
      case DIRECTION_BOTTOM:
        newHeight = startHeight + offsetY;
        setResHeight(newHeight);
        emit('update:height', newHeight);
        break;
      default:
        break;
    }

    emit(
      'moving',
      {
        width: newWidth,
        height: newHeight,
      },
      e,
    );
  }

  function onMoveEnd(e: MouseEvent) {
    record.moving = false;

    off(window, 'mousemove', onMoving);
    off(window, 'mouseup', onMoveEnd);
    off(window, 'contextmenu', onMoveEnd);

    document.body.style.cursor = 'default';

    emit('movingEnd', e);
  }

  function onMoveStart(direction: DirectionType, e: MouseEvent) {
    emit('movingStart', e);

    record.moving = true;
    record.startPageX = e.pageX;
    record.startPageY = e.pageY;
    record.direction = direction;

    const { top, left, right, bottom } = record.padding;
    record.startWidth = getRealSize(wrapperRef.value?.clientWidth || 0, left + right);
    record.startHeight = getRealSize(wrapperRef.value?.clientHeight || 0, top + bottom);

    on(window, 'mousemove', onMoving);
    on(window, 'mouseup', onMoveEnd);
    on(window, 'contextmenu', onMoveEnd);

    document.body.style.cursor = isHorizontal(direction) ? 'row-resize' : 'col-resize';
  }

  function onTiggerResize(direction: DirectionType, entry: ResizeObserverEntry) {
    const { width, height } = entry.contentRect;
    const size = isHorizontal(direction) ? height : width;
    record.padding[direction] = size;
    paddingStyles[`padding-${direction}` as PaddingCSSProperties] = `${size}px`;
  }

  // 键盘调整大小（role=separator 的伸缩杆）：水平边(left/right)用 ←/→，垂直边(top/bottom)用 ↑/↓，
  // Shift 加大步长。方向语义与鼠标拖拽 onMoving 保持一致（left/top 边的轴向取反）。
  function onTriggerKeydown(direction: DirectionType, e: KeyboardEvent) {
    const horiz = direction === DIRECTION_LEFT || direction === DIRECTION_RIGHT;
    const key = e.key;
    const posKey = horiz ? KEYBOARD_KEY.ARROW_RIGHT : KEYBOARD_KEY.ARROW_DOWN;
    const negKey = horiz ? KEYBOARD_KEY.ARROW_LEFT : KEYBOARD_KEY.ARROW_UP;
    if (key !== posKey && key !== negKey) return;
    e.preventDefault();
    const step = e.shiftKey ? 20 : 10;
    // left/top 边：向远端拖拽才增大，轴向取反（与 onMoving 的 startWidth - offsetX 一致）
    const dirSign = direction === DIRECTION_LEFT || direction === DIRECTION_TOP ? -1 : 1;
    const sign = key === posKey ? 1 : -1;
    const delta = step * sign * dirSign;
    if (horiz) {
      const base = isNumber(resWidth.value) ? resWidth.value : (wrapperRef.value?.clientWidth ?? 0);
      const newWidth = Math.max(0, base + delta);
      setResWidth(newWidth);
      emit('update:width', newWidth);
    } else {
      const base = isNumber(resHeight.value)
        ? resHeight.value
        : (wrapperRef.value?.clientHeight ?? 0);
      const newHeight = Math.max(0, base + delta);
      setResHeight(newHeight);
      emit('update:height', newHeight);
    }
  }
</script>
