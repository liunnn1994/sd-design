<template>
  <teleport :to="container" :disabled="!fullscreen || !renderToBody">
    <div
      v-if="shouldRender"
      ref="wrapperRef"
      :class="classNames"
      :style="wrapperStyles"
      :tabindex="fullscreen ? -1 : undefined"
      @keydown="onKeyDown"
    >
      <div v-if="fullscreen" :class="`${prefixCls}-mask`" @click="onMaskClick" />
      <section
        :class="contentClassNames"
        :role="fullscreen ? 'dialog' : 'region'"
        :aria-modal="fullscreen ? 'true' : undefined"
        :aria-label="title || 'File preview'"
      >
        <header v-if="title || $slots.title" :class="`${prefixCls}-header`">
          <slot name="title">
            <span :class="`${prefixCls}-title`">{{ title }}</span>
          </slot>
        </header>
        <div :class="`${prefixCls}-body`">
          <slot name="content" v-bind="contentSlotProps">
            <img
              v-if="type === 'image'"
              :key="currentSrc"
              :class="`${prefixCls}-image`"
              :src="currentSrc"
              :alt="title || ''"
              @load="onPreviewLoad"
              @error="onLoadError"
            />
            <component
              :is="'video-player'"
              v-else-if="type === 'video'"
              :class="`${prefixCls}-video-player`"
            >
              <component :is="'video-skin'">
                <video
                  :key="currentSrc"
                  :class="`${prefixCls}-video`"
                  :src="currentSrc"
                  controls
                  playsinline
                />
              </component>
            </component>
            <div v-else-if="type === 'audio'" :class="`${prefixCls}-audio-panel`">
              <audio :key="currentSrc" :class="`${prefixCls}-audio`" :src="currentSrc" controls />
            </div>
            <iframe
              v-else-if="type === 'pdf'"
              :key="currentSrc"
              :class="`${prefixCls}-pdf`"
              :src="currentSrc"
              title="PDF preview"
              @load="onPreviewLoad"
              @error="onLoadError"
            />
          </slot>
        </div>
      </section>
      <button
        v-if="fullscreen && closable"
        type="button"
        :class="`${prefixCls}-close-btn`"
        @click="close"
      >
        <IconClose />
      </button>
      <div v-if="isLoading" :class="`${prefixCls}-loading`">
        <IconLoading />
      </div>
      <div v-if="isError" :class="`${prefixCls}-error`">文件预览加载失败</div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
  import type { CSSProperties, PropType } from 'vue';
  import { computed, nextTick, reactive, shallowRef, toRefs, watch } from 'vue';

  import type {
    FilePreviewerContentSlotProps,
    FilePreviewerStatus,
    FilePreviewerType,
  } from './types';

  import usePopupContainer from '../_hooks/use-popup-container';
  import usePopupManager from '../_hooks/use-popup-manager';
  import usePopupOverHidden from '../_hooks/use-popup-overflow-hidden';
  import { isServerRendering } from '../_utils/dom';
  import { getPrefixCls } from '../_utils/global-config';
  import { KEYBOARD_KEY } from '../_utils/keyboard';
  import IconClose from '../icon/icon-close';
  import IconLoading from '../icon/icon-loading';

  defineOptions({ name: 'FilePreviewer' });

  const slots = defineSlots<{
    /**
     * @zh 自定义标题
     * @en Custom title
     */
    title?: () => unknown;
    /**
     * @zh 自定义预览内容
     * @en Custom preview content
     */
    content?: (_props: FilePreviewerContentSlotProps) => unknown;
  }>();

  const props = defineProps({
    /**
     * @zh 文件地址
     * @en File source url
     */
    src: {
      type: String,
    },
    /**
     * @zh 预览类型，由参数决定使用哪个预览器
     * @en Preview type, decides which previewer to use
     */
    type: {
      type: String as PropType<FilePreviewerType>,
      default: 'image',
    },
    /**
     * @zh 是否可见
     * @en Whether the previewer is visible
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
     * @zh 是否使用全屏弹层展示
     * @en Whether to show the previewer in fullscreen overlay
     */
    fullscreen: {
      type: Boolean,
      default: true,
    },
    /**
     * @zh 标题
     * @en Title
     */
    title: {
      type: String,
    },
    /**
     * @zh 点击遮罩是否关闭
     * @en Whether to close when mask is clicked
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
     * @zh 是否支持 ESC 键关闭
     * @en Whether to support closing with ESC
     */
    escToClose: {
      type: Boolean,
      default: true,
    },
    /**
     * @zh 设置弹出框挂载点，同 teleport 的 to
     * @en Set the mount point, same as teleport to
     */
    popupContainer: {
      type: [Object, String] as PropType<HTMLElement | string>,
    },
    /**
     * @zh 是否渲染到 body
     * @en Whether to render to body
     */
    renderToBody: {
      type: Boolean,
      default: true,
    },
  });

  const emit = defineEmits<{
    /**
     * @zh 关闭事件
     * @en Close event
     */
    'close': [];
    /**
     * @zh 可见状态变化
     * @en Visible state change
     */
    'visible-change': [_visible: boolean];
    'update:visible': [_visible: boolean];
  }>();

  const {
    src,
    type,
    visible,
    defaultVisible,
    fullscreen,
    popupContainer,
    renderToBody,
    maskClosable,
    closable,
    escToClose,
    title,
  } = toRefs(props);

  const prefixCls = getPrefixCls('file-previewer');
  const wrapperRef = shallowRef<HTMLElement>();
  const status = shallowRef<FilePreviewerStatus>('beforeLoad');
  const requestId = shallowRef(0);
  let videoJsHtmlPromise: Promise<unknown> | undefined;

  const localVisible = shallowRef(defaultVisible.value);
  const mergedVisible = computed(() => visible?.value ?? localVisible.value);
  const shouldRender = computed(() => !fullscreen.value || mergedVisible.value);

  const container = usePopupContainer(document.body, reactive({ popupContainer }));
  const popupVisible = computed(() => fullscreen.value && mergedVisible.value);
  const { zIndex } = usePopupManager('dialog', { visible: popupVisible });
  const isFixed = computed(() => container.value === document.body);

  const currentSrc = computed(() => src?.value ?? '');
  const isLoading = computed(() => status.value === 'loading');
  const isLoaded = computed(() => status.value === 'loaded');
  const isError = computed(() => status.value === 'error');
  const classNames = computed(() => [
    prefixCls,
    `${prefixCls}-${type.value}`,
    fullscreen.value ? `${prefixCls}-fullscreen` : `${prefixCls}-inline`,
  ]);
  const contentClassNames = computed(() => [
    `${prefixCls}-content`,
    `${prefixCls}-content-${type.value}`,
    fullscreen.value ? `${prefixCls}-content-fullscreen` : `${prefixCls}-content-inline`,
  ]);
  const wrapperStyles = computed<CSSProperties | undefined>(() => {
    if (!fullscreen.value) return undefined;

    return isFixed.value
      ? { zIndex: zIndex.value, position: 'fixed' }
      : { zIndex: 'inherit', position: 'absolute' };
  });
  const contentSlotProps = computed<FilePreviewerContentSlotProps>(() => ({
    src: currentSrc.value,
    type: type.value,
    title: title?.value,
    visible: shouldRender.value,
    fullscreen: fullscreen.value,
    status: status.value,
    loading: isLoading.value,
    loaded: isLoaded.value,
    error: isError.value,
    close,
    onLoad: onPreviewLoad,
    onError: onLoadError,
  }));

  usePopupOverHidden(reactive({ container, hidden: popupVisible }));

  function resetPreviewState() {
    status.value = 'beforeLoad';
  }

  function setVisible(nextVisible: boolean) {
    if (nextVisible !== mergedVisible.value) {
      emit('visible-change', nextVisible);
      emit('update:visible', nextVisible);
      localVisible.value = nextVisible;
    }
  }

  function close() {
    if (fullscreen.value && !mergedVisible.value) return;
    emit('close');
    setVisible(false);
  }

  function onMaskClick() {
    if (maskClosable.value) close();
  }

  function onKeyDown(event: KeyboardEvent) {
    if (fullscreen.value && escToClose.value && event.key === KEYBOARD_KEY.ESC) {
      event.stopPropagation();
      close();
    }
  }

  function onPreviewLoad() {
    status.value = 'loaded';
  }

  function onLoadError() {
    status.value = 'error';
  }

  async function ensureVideoJsHtml() {
    if (typeof Element === 'undefined' && typeof window !== 'undefined' && window.Element) {
      Object.defineProperty(globalThis, 'Element', {
        configurable: true,
        value: window.Element,
      });
    }
    if (!videoJsHtmlPromise) videoJsHtmlPromise = import('@videojs/html');
    await videoJsHtmlPromise;
  }

  async function prepareVideo(currentRequestId: number) {
    status.value = 'loading';
    try {
      if (!isServerRendering) await ensureVideoJsHtml();
      if (currentRequestId !== requestId.value) return;
      status.value = 'loaded';
    } catch {
      if (currentRequestId !== requestId.value) return;
      status.value = 'error';
    }
  }

  watch(
    [src, type, shouldRender],
    () => {
      requestId.value += 1;
      if (!shouldRender.value) return;

      resetPreviewState();
      if (fullscreen.value) void nextTick(() => wrapperRef.value?.focus());

      if (slots.content) {
        status.value = 'loaded';
        return;
      }

      const currentRequestId = requestId.value;
      if (type.value === 'video') {
        void prepareVideo(currentRequestId);
        return;
      }

      if (type.value === 'audio' || type.value === 'pdf') {
        status.value = 'loaded';
        return;
      }

      status.value = 'loading';
    },
    { immediate: true },
  );

  defineExpose({
    close,
    onLoad: onPreviewLoad,
    onError: onLoadError,
    onImageLoad: onPreviewLoad,
    onPdfLoad: onPreviewLoad,
    onLoadError,
  });
</script>
