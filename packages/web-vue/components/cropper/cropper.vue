<template>
  <div :class="rootClass" :style="rootStyle" v-bind="attrs">
    <img ref="imgRef" :src="props.src" alt="" :class="`${prefixCls}-source-image`" />
  </div>
</template>

<script setup lang="ts">
  import type { CSSProperties } from 'vue';
  import { computed, nextTick, onBeforeUnmount, onMounted, ref, useAttrs, watch } from 'vue';

  import { createCropper, getCropperRootStyle } from '@sdata/web-core/cropper/foundation';

  import type { CropperExpose, CropperProps, CropperSelectionChangeDetail } from './interface';

  import { getPrefixCls } from '../_utils/global-config';

  defineOptions({
    name: 'Cropper',
    inheritAttrs: false,
  });

  const props = withDefaults(defineProps<CropperProps>(), {
    src: '',
    canvasProps: () => ({}),
    imageProps: () => ({}),
    selectionProps: () => ({}),
    template: undefined,
    selectionX: undefined,
    selectionY: undefined,
    selectionWidth: undefined,
    selectionHeight: undefined,
    width: '100%',
    height: '100%',
    fitSelectionToImage: true,
  });

  const emit = defineEmits<{
    /**
     * @zh 选区变化时触发
     * @en Emitted when the selection changes
     */
    'selection:change': [detail: CropperSelectionChangeDetail];
    /**
     * @zh 选区 x 坐标变化时触发
     * @en Emitted when the selection x changes
     */
    'update:selectionX': [value: number];
    /**
     * @zh 选区 y 坐标变化时触发
     * @en Emitted when the selection y changes
     */
    'update:selectionY': [value: number];
    /**
     * @zh 选区宽度变化时触发
     * @en Emitted when the selection width changes
     */
    'update:selectionWidth': [value: number];
    /**
     * @zh 选区高度变化时触发
     * @en Emitted when the selection height changes
     */
    'update:selectionHeight': [value: number];
    /**
     * @zh 画布 action 事件
     * @en Cropper canvas action event
     */
    'canvas:action': [detail: unknown];
    /**
     * @zh 画布 actionstart 事件
     * @en Cropper canvas actionstart event
     */
    'canvas:actionstart': [detail: unknown];
    /**
     * @zh 画布 actionmove 事件
     * @en Cropper canvas actionmove event
     */
    'canvas:actionmove': [detail: unknown];
    /**
     * @zh 画布 actionend 事件
     * @en Cropper canvas actionend event
     */
    'canvas:actionend': [detail: unknown];
    /**
     * @zh 图片变换时触发
     * @en Emitted when the cropper image transforms
     */
    'image:transform': [detail: { matrix: number[]; oldMatrix: number[] }];
  }>();

  const attrs = useAttrs();
  const prefixCls = getPrefixCls('cropper');
  const imgRef = ref<HTMLImageElement>();
  const rootClass = computed(() => [prefixCls]);
  const rootStyle = computed<CSSProperties>(() => getCropperRootStyle(props.width, props.height));
  const foundation = createCropper({
    props,
    get imageElement() {
      return imgRef.value;
    },
    afterRender: (callback) => nextTick(callback),
    selectionChange: (detail) => emit('selection:change', detail),
    updateSelectionX: (value) => emit('update:selectionX', value),
    updateSelectionY: (value) => emit('update:selectionY', value),
    updateSelectionWidth: (value) => emit('update:selectionWidth', value),
    updateSelectionHeight: (value) => emit('update:selectionHeight', value),
    imageTransform: (detail) => emit('image:transform', detail),
    canvasEvents: {
      action: (detail) => emit('canvas:action', detail),
      actionstart: (detail) => emit('canvas:actionstart', detail),
      actionmove: (detail) => emit('canvas:actionmove', detail),
      actionend: (detail) => emit('canvas:actionend', detail),
    },
  });
  onMounted(foundation.mount);
  onBeforeUnmount(foundation.destroy);
  watch(() => props.fitSelectionToImage, foundation.scheduleAlignOnLoad, { flush: 'post' });
  watch(() => props.src, foundation.syncSource);
  watch(
    () => props.canvasProps,
    () => nextTick(foundation.syncCanvasProps),
    { deep: true },
  );
  watch(
    () => props.imageProps,
    () => nextTick(foundation.syncImageProps),
    { deep: true },
  );
  watch(
    () => props.selectionProps,
    () => nextTick(foundation.syncSelectionProps),
    { deep: true },
  );
  watch(
    [
      () => props.selectionX,
      () => props.selectionY,
      () => props.selectionWidth,
      () => props.selectionHeight,
    ],
    ([x, y, width, height]) => {
      if (x === undefined && y === undefined && width === undefined && height === undefined) return;
      nextTick(foundation.syncSelectionGeometry);
    },
  );
  defineExpose<CropperExpose>({
    getInstance: foundation.getInstance,
    getCropperCanvas: foundation.getCropperCanvas,
    getCropperImage: foundation.getCropperImage,
    getCropperSelection: foundation.getCropperSelection,
    getCropperSelections: foundation.getCropperSelections,
    destroy: foundation.destroy,
  });
</script>
