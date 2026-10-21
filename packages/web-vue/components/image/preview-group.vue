<template>
  <slot />
  <ImagePreview
    v-bind="{ ...$attrs, groupArrowProps }"
    in-group
    :src="currentUrl"
    :visible="mergedVisible"
    :mask-closable="maskClosable"
    :closable="closable"
    :actions-layout="actionsLayout"
    :popup-container="popupContainer"
    :render-to-body="renderToBody"
    @close="onClose"
  >
    <template v-if="$slots.actions" #actions>
      <slot name="actions" :url="currentUrl" />
    </template>
  </ImagePreview>
</template>
<script setup lang="ts">
  import type { PreviewImage } from '@sdata/web-core/image/types';

  import { PropType, reactive, toRefs, provide, computed, ref } from 'vue';

  import { createImagePreviewGroup, getPreviewSourceMap } from '@sdata/web-core/image/group';

  import useMergeState from '../_hooks/use-merge-state';
  import { isArray, isUndefined } from '../_utils/is';
  import { PreviewGroupContext, PreviewGroupInjectionKey } from './context';
  import ImagePreview from './preview.vue';

  defineOptions({ name: 'ImagePreviewGroup', inheritAttrs: false });

  const props = defineProps({
    /**
     * @zh 预览浮层是否挂载到 body
     * @en Whether the preview popup is mounted to body
     */
    renderToBody: {
      type: Boolean,
      default: true,
    },
    /**
     * @zh 图片列表（设置了本属性之后，将不再收集 a-image 子组件的图片信息）
     * @en Picture list (after setting this property, the picture information of a-image subcomponent will no longer be collected)
     */
    srcList: {
      type: Array as PropType<string[]>,
    },
    /**
     * @zh 当前展示的图片的下标
     * @en The index of the currently displayed image
     * @vModel
     */
    current: {
      type: Number,
    },
    /**
     * @zh 第一张展示的图片的下标
     * @en The index of the first image shown
     */
    defaultCurrent: {
      type: Number,
      default: 0,
    },
    /**
     * @zh 是否无限循环
     * @en Whether to loop infinitely
     */
    infinite: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 是否可见，受控属性
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
     * @zh 控制条的布局
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
      type: [String, Object] as PropType<string | HTMLElement>,
    },
  });

  const emit = defineEmits<{
    /**
     * @zh 切换图片
     * @en Image switch
     * @param {number} index
     */
    'change': [_index: number];
    'update:current': [_index: number];
    /**
     * @zh 预览的打开和关闭
     * @en Preview visibility change
     * @param {boolean} visible
     */
    'visible-change': [_visible: boolean];
    'update:visible': [_visible: boolean];
  }>();

  /**
   * @zh 自定义额外的操作项
   * @en Customize additional action items
   * @slot actions
   * @version 2.46.0
   */

  const { srcList, visible, defaultVisible, current, defaultCurrent, infinite } = toRefs(props);

  const [mergedVisible, setLocalVisible] = useMergeState(
    defaultVisible.value,
    reactive({
      value: visible,
    }),
  );
  const propImageUrlMap = computed(() => getPreviewSourceMap(srcList?.value));

  const registeredImages = ref(new Map<number, PreviewImage>());
  const imageUrlMap = computed(() =>
    isArray(srcList?.value) ? propImageUrlMap.value : registeredImages.value,
  );

  const imageIdList = computed(() => Array.from(imageUrlMap.value.keys()));

  const [currentIndex, setLocalCurrentIndex] = useMergeState(
    defaultCurrent.value,
    reactive({
      value: current,
    }),
  );
  const foundation = createImagePreviewGroup({
    get sources() {
      return srcList?.value;
    },
    get registered() {
      return registeredImages.value;
    },
    get images() {
      return imageUrlMap.value;
    },
    get ids() {
      return imageIdList.value;
    },
    get index() {
      return currentIndex.value;
    },
    get visible() {
      return mergedVisible.value;
    },
    get infinite() {
      return infinite.value;
    },
    setVisible: setLocalVisible,
    onVisibleChange(value) {
      emit('visible-change', value);
      emit('update:visible', value);
    },
    setIndex: setLocalCurrentIndex,
    onIndexChange(value) {
      emit('change', value);
      emit('update:current', value);
    },
  });
  const registerImageUrl = foundation.register;
  const setCurrentIndex = foundation.index;
  const currentId = computed(() => imageIdList.value[currentIndex.value]);
  const currentUrl = computed(() => imageUrlMap.value.get(currentId.value)?.url);

  provide<PreviewGroupContext>(
    PreviewGroupInjectionKey,
    reactive({
      registerImageUrl,
      preview: foundation.preview,
    }),
  );

  const nextIndex = computed(foundation.next);
  const prevIndex = computed(foundation.prev);

  const onPrev = computed(() =>
    !isUndefined(prevIndex.value)
      ? () => {
          !isUndefined(prevIndex.value) && setCurrentIndex(prevIndex.value);
        }
      : undefined,
  );

  const onNext = computed(() =>
    !isUndefined(nextIndex.value)
      ? () => {
          !isUndefined(nextIndex.value) && setCurrentIndex(nextIndex.value);
        }
      : undefined,
  );

  const onClose = foundation.close;

  const groupArrowProps = reactive({
    onPrev,
    onNext,
  });
</script>
