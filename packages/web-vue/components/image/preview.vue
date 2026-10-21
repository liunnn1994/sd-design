<template>
  <teleport :to="container || 'body'" :disabled="!renderToBody">
    <div :class="classNames" :style="wrapperStyles">
      <transition
        name="image-fade"
        @before-enter="(el) => el.parentElement && (el.parentElement.style.display = 'block')"
        @after-leave="(el) => el.parentElement && (el.parentElement.style.display = '')"
      >
        <div v-show="mergedVisible" :class="`${prefixCls}-mask`" />
      </transition>
      <div
        v-if="mergedVisible"
        ref="refWrapper"
        tabindex="0"
        :class="`${prefixCls}-wrapper`"
        @click="onMaskClick"
        @wheel.prevent.stop="onWheel"
      >
        <!-- img -->
        <div
          :class="`${prefixCls}-img-container`"
          :style="{ transform: `scale(${scale}, ${scale})` }"
          @click="onMaskClick"
        >
          <img
            ref="refImage"
            :key="src"
            :src="src"
            :class="[
              `${prefixCls}-img`,
              {
                [`${prefixCls}-img-moving`]: moving,
              },
            ]"
            :style="{
              transform: `translate(${translate[0]}px, ${translate[1]}px) rotate(${rotate}deg)`,
            }"
            @load="onImgLoad"
            @error="onImgError"
          />
        </div>

        <!-- loading -->
        <div v-if="isLoading" :class="`${prefixCls}-loading`">
          <IconLoading />
        </div>

        <!-- scale value -->
        <transition name="image-fade">
          <div v-if="scaleValueVisible" :class="`${prefixCls}-scale-value`">
            {{ (scale * 100).toFixed(0) }}%
          </div>
        </transition>

        <!-- toolbar -->
        <PreviewToolbar
          v-if="isLoaded && actionsLayout.length"
          :actions="actions"
          :actions-layout="actionsLayout"
        >
          <slot name="actions" />
        </PreviewToolbar>

        <!-- close btn -->
        <div v-if="closable" :class="`${prefixCls}-close-btn`" @click="onCloseClick">
          <IconClose />
        </div>

        <!-- group arrow -->
        <PreviewArrow v-if="inGroup" v-bind="groupArrowProps" />
      </div>
    </div>
  </teleport>
</template>
<script setup lang="ts">
  import {
    computed,
    PropType,
    reactive,
    watch,
    toRefs,
    ref,
    CSSProperties,
    onBeforeUnmount,
    nextTick,
  } from 'vue';

  import { createImagePreview } from '@sdata/web-core/image/preview';

  import useMergeState from '../_hooks/use-merge-state';
  import usePopupContainer from '../_hooks/use-popup-container';
  import usePopupManager from '../_hooks/use-popup-manager';
  import usePopupOverHidden from '../_hooks/use-popup-overflow-hidden';
  import { isServerRendering, off, on } from '../_utils/dom';
  import { getPrefixCls } from '../_utils/global-config';
  import { throttleByRaf } from '../_utils/throttle-by-raf';
  import IconClose from '../icon/icon-close';
  import IconFullscreen from '../icon/icon-fullscreen';
  import IconLoading from '../icon/icon-loading';
  import IconOriginalSize from '../icon/icon-original-size';
  import IconRotateLeft from '../icon/icon-rotate-left';
  import IconRotateRight from '../icon/icon-rotate-right';
  import IconZoomIn from '../icon/icon-zoom-in';
  import IconZoomOut from '../icon/icon-zoom-out';
  import { useI18n } from '../locale';
  import useImageDrag from './hooks/use-image-drag';
  import useImageLoadStatus from './hooks/use-image-load-status';
  import PreviewArrow from './preview-arrow.vue';
  import PreviewToolbar from './preview-toolbar.vue';
  import { minScale, maxScale } from './utils/get-scale';

  defineOptions({ name: 'ImagePreview' });

  const props = defineProps({
    renderToBody: {
      type: Boolean,
      default: true,
    },
    /**
     * @zh 图片获取地址
     * @en Image src
     */
    src: {
      type: String,
    },
    /**
     * @zh 是否可见
     * @en Whether is visible
     * @vModel
     */
    visible: {
      type: Boolean,
      default: undefined,
    },
    /**
     * @zh 默认是否可见，非受控
     * @en Default visibility
     */
    defaultVisible: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 点击 mask 是否触发关闭
     * @en Whether to close the modal when mask is clicked
     */
    maskClosable: {
      type: Boolean,
      default: true,
    },
    /**
     * @zh 是否显示关闭按钮
     * @en Whether to show close button
     */
    closable: {
      type: Boolean,
      default: true,
    },
    /**
     * @zh 操作项的布局
     * @en Layout of action list
     */
    actionsLayout: {
      type: Array as PropType<string[]>,
      default: () => [
        'fullScreen',
        'rotateRight',
        'rotateLeft',
        'zoomIn',
        'zoomOut',
        'originalSize',
      ],
    },
    /**
     * @zh 设置弹出框的挂载点，同 `teleport` 的 `to`，缺省值是 document.body
     * @en Set the mount point of the pop-up box, the same as the `to` of `teleport`, the default value is document.body
     */
    popupContainer: {
      type: [Object, String] as PropType<HTMLElement | string>,
    },
    inGroup: {
      type: Boolean,
      default: false,
    },
    groupArrowProps: {
      type: Object,
      default: () => ({}),
    },
    /**
     * @zh 是否支持 ESC 键关闭预览
     * @en Whether to support the ESC key to close the preview
     */
    escToClose: {
      type: Boolean,
      default: true,
    },
    /**
     * @zh 是否开启滚轮缩放
     * @en Whether to enable wheel zoom
     */
    wheelZoom: {
      type: Boolean,
      default: true,
    },
    /**
     * @zh 是否开启键盘控制
     * @en Whether to enable keyboard shortcuts
     */
    keyboard: {
      type: Boolean,
      default: true,
    },
    /**
     * @zh 默认缩放比
     * @en Default scale
     */
    defaultScale: {
      type: Number,
      default: 1,
    },
    /**
     * @zh 缩放速率，仅对滚动缩放生效
     * @en Zoom rate, only for scroll zoom
     */
    zoomRate: {
      type: Number,
      default: 1.1,
    },
  });

  const emit = defineEmits<{
    /**
     * @zh 关闭事件
     * @en Close event
     */
    'close': [];
    'update:visible': [_visible: boolean];
  }>();

  /**
   * @zh 自定义额外的操作项
   * @en Customize additional action items
   * @slot actions
   * @version 2.17.0
   */

  const { t } = useI18n();
  const {
    src,
    popupContainer,
    visible,
    defaultVisible,
    maskClosable,
    actionsLayout,
    defaultScale,
    zoomRate,
  } = toRefs(props);
  const refWrapper = ref();
  const refImage = ref();
  const prefixCls = getPrefixCls('image-preview');
  const [mergedVisible, setVisible] = useMergeState(
    defaultVisible.value,
    reactive({ value: visible }),
  );
  const classNames = computed(() => [
    prefixCls,
    {
      [`${prefixCls}-hide`]: !mergedVisible.value,
    },
  ]);

  const container = usePopupContainer(
    isServerRendering ? undefined : document.body,
    reactive({ popupContainer }),
  );

  const isFixed = computed(() => !isServerRendering && container.value === document.body);
  const {
    zIndex,
    close: releasePopup,
    isLastDialog,
  } = usePopupManager('dialog', {
    visible: mergedVisible,
  });

  const wrapperStyles = computed<CSSProperties>(() => {
    const positionStyles: CSSProperties = isFixed.value
      ? { zIndex: zIndex.value, position: 'fixed' }
      : { zIndex: 'inherit', position: 'absolute' };

    return { ...positionStyles };
  });

  const { isLoading, isLoaded, setLoadStatus } = useImageLoadStatus();

  const rotate = ref(0);
  const scale = ref(defaultScale.value);

  const { translate, moving, resetTranslate } = useImageDrag(
    reactive({
      wrapperEl: refWrapper,
      imageEl: refImage,
      visible: mergedVisible,
      scale,
    }),
  );

  const scaleValueVisible = ref(false);
  const foundation = createImagePreview({
    get visible() {
      return mergedVisible.value;
    },
    get scale() {
      return scale.value;
    },
    get rotate() {
      return rotate.value;
    },
    get defaultScale() {
      return defaultScale.value;
    },
    get zoomRate() {
      return zoomRate.value;
    },
    get escToClose() {
      return props.escToClose;
    },
    get wheelZoom() {
      return props.wheelZoom;
    },
    get maskClosable() {
      return maskClosable.value;
    },
    get actions() {
      return actionsLayout.value;
    },
    get scaleValueVisible() {
      return scaleValueVisible.value;
    },
    get arrows() {
      return props.groupArrowProps;
    },
    isLastDialog,
    isEditableTarget(event) {
      const target = event.target;
      return (
        target instanceof HTMLElement &&
        Boolean(target.isContentEditable || target.closest('input, textarea, select'))
      );
    },
    setScale(value) {
      scale.value = value;
    },
    setRotate(value) {
      rotate.value = value;
    },
    setVisible,
    setScaleValueVisible(value) {
      scaleValueVisible.value = value;
    },
    setLoadStatus,
    onClose() {
      emit('close');
    },
    onVisibleChange(value) {
      emit('update:visible', value);
    },
    resetTranslate,
    focusAfterRender() {
      void nextTick(() => refWrapper.value?.focus());
    },
    focusOnMaskClick() {
      if (!refWrapper.value?.contains(document.activeElement)) refWrapper.value?.focus();
    },
    measure() {
      return {
        wrapper: refWrapper.value.getBoundingClientRect(),
        image: refImage.value.getBoundingClientRect(),
      };
    },
    schedule: (callback, delay) => setTimeout(callback, delay),
    cancel: (handle) => clearTimeout(handle),
    releasePopup,
  });
  const handleKeyDown = foundation.keydown;
  const onWheel = throttleByRaf(foundation.wheel);
  const changeScale = foundation.changeScale;
  const fullScreen = foundation.fullScreen;
  const handleRotate = foundation.rotate;
  const handleScale = foundation.scale;
  const onMaskClick = foundation.maskClick;
  const onCloseClick = foundation.close;
  const onImgLoad = foundation.loaded;
  const onImgError = foundation.error;
  usePopupOverHidden(reactive({ container, hidden: mergedVisible }));

  watch(
    [mergedVisible, () => props.keyboard, container],
    ([visible, keyboard, target], _, onCleanup) => {
      if (!visible || !keyboard || !target) return;
      on(target, 'keydown', handleKeyDown);
      onCleanup(() => off(target, 'keydown', handleKeyDown));
    },
    { immediate: true },
  );

  watch([src, mergedVisible], foundation.syncSource, { immediate: true });
  onBeforeUnmount(foundation.dispose);

  const actions = computed(() => [
    /** 满屏 */
    {
      key: 'fullScreen',
      name: t('imagePreview.fullScreen'),
      content: IconFullscreen,
      onClick: () => fullScreen(),
    },
    /** 顺时针旋转 */
    {
      key: 'rotateRight',
      name: t('imagePreview.rotateRight'),
      content: IconRotateRight,
      onClick: () => handleRotate('clockwise'),
    },
    /** 逆时针旋转 */
    {
      key: 'rotateLeft',
      name: t('imagePreview.rotateLeft'),
      content: IconRotateLeft,
      onClick: () => handleRotate('counterclockwise'),
    },
    /** 放大 */
    {
      key: 'zoomIn',
      name: t('imagePreview.zoomIn'),
      content: IconZoomIn,
      onClick: () => handleScale('zoomIn'),
      disabled: scale.value === maxScale,
    },
    /** 缩小 */
    {
      key: 'zoomOut',
      name: t('imagePreview.zoomOut'),
      content: IconZoomOut,
      onClick: () => handleScale('zoomOut'),
      disabled: scale.value === minScale,
    },
    /** 缩放到100% */
    {
      key: 'originalSize',
      name: t('imagePreview.originalSize'),
      content: IconOriginalSize,
      onClick: () => changeScale(1),
    },
  ]);

  defineExpose({ onImgLoad, onImgError });
</script>
