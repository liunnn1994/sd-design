<template>
  <Image
    v-if="useImagePreview"
    :key="currentSrc + 'image'"
    v-bind="mergedImageProps"
    :preview-visible="mergedVisible"
    :class="`${prefixCls}-image`"
    @preview-visible-change="onImagePreviewVisibleChange"
  />
  <teleport v-else :to="container" :disabled="!fullscreen || !renderToBody">
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
        :aria-label="title || t('a11y.filePreview')"
      >
        <header v-if="title || $slots.title" :class="`${prefixCls}-header`">
          <slot name="title">
            <span :class="`${prefixCls}-title`">{{ title }}</span>
          </slot>
        </header>
        <div :class="`${prefixCls}-body`">
          <slot name="content" v-bind="contentSlotProps">
            <slot v-if="type === 'image'" name="image" v-bind="imageSlotProps">
              <Image
                :key="currentSrc + 'image'"
                v-bind="mergedImageProps"
                :class="`${prefixCls}-image`"
              />
            </slot>
            <template v-else-if="type === 'video'">
              <slot name="video" v-bind="mediaSlotProps">
                <component
                  :is="mediaPlayerTag"
                  v-if="useVideoJsMediaSkin"
                  v-bind="mediaPlayerProps"
                  :class="`${prefixCls}-video-player`"
                >
                  <component
                    :is="mediaSkinTag"
                    v-bind="mediaSkinProps"
                    :class="mediaSkinClassNames"
                  >
                    <video
                      :key="currentSrc + 'video'"
                      v-bind="mergedMediaProps"
                      :class="`${prefixCls}-video`"
                    />
                  </component>
                </component>
                <video
                  v-else
                  :key="currentSrc"
                  v-bind="mergedMediaProps"
                  :class="`${prefixCls}-video`"
                />
              </slot>
            </template>
            <div v-else-if="type === 'audio'" :class="`${prefixCls}-audio-panel`">
              <slot name="audio" v-bind="mediaSlotProps">
                <component
                  :is="mediaPlayerTag"
                  v-if="useVideoJsMediaSkin"
                  v-bind="mediaPlayerProps"
                  :class="`${prefixCls}-audio-player`"
                >
                  <component
                    :is="mediaSkinTag"
                    v-bind="mediaSkinProps"
                    :class="mediaSkinClassNames"
                  >
                    <audio
                      :key="currentSrc + 'audio'"
                      v-bind="mergedMediaProps"
                      :class="`${prefixCls}-audio`"
                    />
                  </component>
                </component>
                <audio
                  v-else
                  :key="currentSrc + 'audio'"
                  v-bind="mergedMediaProps"
                  :class="`${prefixCls}-audio`"
                />
              </slot>
            </div>
            <template v-else-if="type === 'pdf'">
              <slot name="pdf" v-bind="pdfSlotProps">
                <div :class="`${prefixCls}-pdf`">
                  <div :class="`${prefixCls}-pdf-canvas-wrap`">
                    <canvas ref="pdfCanvasRef" :class="`${prefixCls}-pdf-canvas`" />
                  </div>
                  <div v-if="pdfNumPages > 1" :class="`${prefixCls}-pdf-toolbar`">
                    <button
                      type="button"
                      :class="`${prefixCls}-pdf-btn`"
                      :disabled="pdfCurrentPage <= 1"
                      :aria-label="t('a11y.prevPage')"
                      @click="pdfPrev"
                    >
                      ‹
                    </button>
                    <span :class="`${prefixCls}-pdf-page`">
                      {{ pdfCurrentPage }} / {{ pdfNumPages }}
                    </span>
                    <button
                      type="button"
                      :class="`${prefixCls}-pdf-btn`"
                      :disabled="pdfCurrentPage >= pdfNumPages"
                      :aria-label="t('a11y.nextPage')"
                      @click="pdfNext"
                    >
                      ›
                    </button>
                  </div>
                </div>
              </slot>
            </template>
          </slot>
        </div>
      </section>
      <button
        v-if="fullscreen && closable"
        type="button"
        :class="`${prefixCls}-close-btn`"
        :aria-label="t('a11y.close')"
        @click="close"
      >
        <IconClose />
      </button>
      <div
        v-if="isLoading"
        :class="`${prefixCls}-loading`"
        role="status"
        :aria-label="t('a11y.loading')"
      >
        <IconLoading />
      </div>
      <div v-if="isError" :class="`${prefixCls}-error`" role="alert">文件预览加载失败</div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
  import type { CSSProperties, PropType } from 'vue';
  import { computed, nextTick, onBeforeUnmount, reactive, shallowRef, toRefs, watch } from 'vue';

  import type {
    FilePreviewerContentSlotProps,
    FilePreviewerImageProps,
    FilePreviewerImageSlotProps,
    FilePreviewerMediaProps,
    FilePreviewerMediaSlotProps,
    FilePreviewerPdfProps,
    FilePreviewerPdfSlotProps,
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
  import Image from '../image';
  import { useI18n } from '../locale';
  import { usePdfJs } from './use-pdf-js';

  defineOptions({ name: 'FilePreviewer' });

  const slots = defineSlots<{
    /**
     * @zh 自定义标题
     * @en Custom title
     */
    title?: () => unknown;
    /**
     * @zh 自定义预览内容，优先级最高，会完全接管预览区域
     * @en Custom preview content, highest priority, fully takes over the preview area
     */
    content?: (_props: FilePreviewerContentSlotProps) => unknown;
    /**
     * @zh 自定义图片预览内容，透出 Image 组件属性与状态
     * @en Custom image preview content, exposes Image component props and status
     */
    image?: (_props: FilePreviewerImageSlotProps) => unknown;
    /**
     * @zh 自定义视频预览内容，透出 Video.js 皮肤配置与状态
     * @en Custom video preview content, exposes Video.js skin config and status
     */
    video?: (_props: FilePreviewerMediaSlotProps) => unknown;
    /**
     * @zh 自定义音频预览内容，透出 Video.js 皮肤配置与状态
     * @en Custom audio preview content, exposes Video.js skin config and status
     */
    audio?: (_props: FilePreviewerMediaSlotProps) => unknown;
    /**
     * @zh 自定义 PDF 预览内容，透出 pdf.js 文档代理、分页与渲染能力
     * @en Custom PDF preview content, exposes pdf.js document proxy, pagination and rendering
     */
    pdf?: (_props: FilePreviewerPdfSlotProps) => unknown;
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
    /**
     * @zh 图片预览器参数
     * @en Image previewer props
     */
    imageProps: {
      type: Object as PropType<FilePreviewerImageProps>,
    },
    /**
     * @zh 视频和音频预览器参数
     * @en Video and audio previewer props
     */
    mediaProps: {
      type: Object as PropType<FilePreviewerMediaProps>,
    },
    /**
     * @zh PDF 预览器参数
     * @en PDF previewer props
     */
    pdfProps: {
      type: Object as PropType<FilePreviewerPdfProps>,
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
    imageProps,
    mediaProps,
    pdfProps,
  } = toRefs(props);

  const { t } = useI18n();

  const prefixCls = getPrefixCls('file-previewer');
  const wrapperRef = shallowRef<HTMLElement>();
  const status = shallowRef<FilePreviewerStatus>('beforeLoad');
  const requestId = shallowRef(0);
  let videoJsVideoPromise: Promise<unknown> | undefined;
  let videoJsAudioPromise: Promise<unknown> | undefined;

  const localVisible = shallowRef(defaultVisible.value);
  const mergedVisible = computed(() => visible?.value ?? localVisible.value);
  const shouldRender = computed(() => !fullscreen.value || mergedVisible.value);
  const useImagePreview = computed(
    () => type.value === 'image' && fullscreen.value && !slots.content && !slots.image,
  );

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

  const mergedImageProps = computed<FilePreviewerImageProps>(() => {
    const userProps = imageProps?.value ?? {};
    return {
      alt: title?.value || '',
      ...userProps,
      src: currentSrc.value,
      renderToBody: renderToBody.value,
      previewProps: {
        maskClosable: maskClosable.value,
        closable: closable.value,
        popupContainer: popupContainer?.value,
        escToClose: escToClose.value,
        ...userProps.previewProps,
      },
      onLoad: (event: Event) => {
        callEventHandler(userProps.onLoad, event);
        onPreviewLoad();
      },
      onError: (event: Event) => {
        callEventHandler(userProps.onError, event);
        onLoadError();
      },
    };
  });
  const mediaSkin = computed(() => mediaProps?.value?.skin ?? 'default');
  const useVideoJsMediaSkin = computed(
    () => mediaSkin.value !== false && mediaSkin.value !== 'native',
  );
  const mediaSkinTag = computed(() => {
    if (mediaSkin.value === 'minimal') {
      return type.value === 'audio' ? 'minimal-audio-skin' : 'minimal-video-skin';
    }
    if (mediaSkin.value && mediaSkin.value !== 'default') return String(mediaSkin.value);
    return type.value === 'audio' ? 'audio-skin' : 'video-skin';
  });
  const mediaPlayerTag = computed(() => (type.value === 'audio' ? 'audio-player' : 'video-player'));
  const mediaSkinClassNames = computed(() => [
    `${prefixCls}-media-skin`,
    `${prefixCls}-media-skin-${type.value}`,
  ]);
  const mediaPlayerProps = computed(() => mediaProps?.value?.playerProps ?? {});
  const mediaSkinProps = computed(() => mediaProps?.value?.skinProps ?? {});
  const mergedMediaProps = computed<FilePreviewerMediaProps>(() => {
    const userProps = { ...mediaProps?.value };
    const { onLoadedData, onError } = userProps;
    delete userProps.skin;
    delete userProps.playerProps;
    delete userProps.skinProps;
    delete userProps.onLoadedData;
    delete userProps.onError;

    return {
      ...(useVideoJsMediaSkin.value ? undefined : { controls: true }),
      ...(type.value === 'video' ? { playsinline: true } : undefined),
      ...userProps,
      src: currentSrc.value,
      onLoadedData: (event: Event) => {
        callEventHandler(onLoadedData, event);
        onPreviewLoad();
      },
      onError: (event: Event) => {
        callEventHandler(onError, event);
        onLoadError();
      },
    };
  });
  const {
    doc: pdfDoc,
    numPages: pdfNumPages,
    page: pdfCurrentPage,
    goto: pdfGoto,
    prev: pdfPrev,
    next: pdfNext,
    render: pdfRender,
    load: loadPdf,
    destroy: destroyPdf,
  } = usePdfJs({
    src: () => currentSrc.value,
    pdfProps: () => pdfProps?.value,
    onStatus: (next) => {
      status.value = next;
    },
  });
  const pdfCanvasRef = shallowRef<HTMLCanvasElement>();

  const hasTypeSlot = computed(() => {
    switch (type.value) {
      case 'image':
        return !!slots.image;
      case 'video':
        return !!slots.video;
      case 'audio':
        return !!slots.audio;
      case 'pdf':
        return !!slots.pdf;
      default:
        return false;
    }
  });
  const pdfSlotProps = computed<FilePreviewerPdfSlotProps>(() => ({
    src: currentSrc.value,
    status: status.value,
    loading: isLoading.value,
    loaded: isLoaded.value,
    error: isError.value,
    doc: pdfDoc.value,
    page: pdfCurrentPage.value,
    numPages: pdfNumPages.value,
    goto: pdfGoto,
    prev: pdfPrev,
    next: pdfNext,
    render: pdfRender,
    close,
    onLoad: onPreviewLoad,
    onError: onLoadError,
  }));
  const mediaSlotProps = computed<FilePreviewerMediaSlotProps>(() => ({
    src: currentSrc.value,
    status: status.value,
    loading: isLoading.value,
    loaded: isLoaded.value,
    error: isError.value,
    skin: mediaSkin.value,
    useVideoJs: useVideoJsMediaSkin.value,
    playerProps: mediaPlayerProps.value,
    skinProps: mediaSkinProps.value,
    close,
    onLoad: onPreviewLoad,
    onError: onLoadError,
  }));
  const imageSlotProps = computed<FilePreviewerImageSlotProps>(() => ({
    src: currentSrc.value,
    status: status.value,
    loading: isLoading.value,
    loaded: isLoaded.value,
    error: isError.value,
    imageProps: mergedImageProps.value,
    close,
    onLoad: onPreviewLoad,
    onError: onLoadError,
  }));

  usePopupOverHidden(reactive({ container, hidden: popupVisible }));

  watch(
    [pdfDoc, pdfCurrentPage, () => pdfProps?.value?.scale, () => pdfProps?.value?.rotation],
    () => {
      if (!pdfDoc.value || !pdfCanvasRef.value) return;
      void pdfRender(pdfCanvasRef.value, pdfCurrentPage.value);
    },
    { flush: 'post' },
  );

  onBeforeUnmount(() => {
    void destroyPdf();
  });

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

  function onImagePreviewVisibleChange(nextVisible: boolean) {
    if (!nextVisible && mergedVisible.value) emit('close');
    setVisible(nextVisible);
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

  function callEventHandler(handler: unknown, event: Event) {
    if (Array.isArray(handler)) {
      handler.forEach((item) => callEventHandler(item, event));
      return;
    }
    if (typeof handler === 'function') handler(event);
  }

  async function ensureVideoJsHtml() {
    if (typeof Element === 'undefined' && typeof window !== 'undefined' && window.Element) {
      Object.defineProperty(globalThis, 'Element', {
        configurable: true,
        value: window.Element,
      });
    }
    if (type.value === 'audio') {
      if (!videoJsAudioPromise) videoJsAudioPromise = import('@videojs/html/audio');
      await videoJsAudioPromise;
      return;
    }
    if (!videoJsVideoPromise) videoJsVideoPromise = import('@videojs/html/video');
    await videoJsVideoPromise;
  }

  async function prepareMedia(currentRequestId: number) {
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
      if (type.value === 'pdf') {
        void loadPdf();
        return;
      }

      if (type.value === 'video' || type.value === 'audio') {
        if (useVideoJsMediaSkin.value) {
          void prepareMedia(currentRequestId);
          return;
        }
        if (hasTypeSlot.value) {
          status.value = 'loaded';
          return;
        }
        status.value = 'loading';
        return;
      }

      if (hasTypeSlot.value) {
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
