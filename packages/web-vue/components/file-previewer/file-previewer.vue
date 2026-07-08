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
            <Image
              v-if="type === 'image'"
              :key="currentSrc + 'image'"
              v-bind="mergedImageProps"
              :class="`${prefixCls}-image`"
            />
            <template v-else-if="type === 'video'">
              <component
                :is="mediaPlayerTag"
                v-if="useVideoJsMediaSkin"
                v-bind="mediaPlayerProps"
                :class="`${prefixCls}-video-player`"
              >
                <component :is="mediaSkinTag" v-bind="mediaSkinProps" :class="mediaSkinClassNames">
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
            </template>
            <div v-else-if="type === 'audio'" :class="`${prefixCls}-audio-panel`">
              <component
                :is="mediaPlayerTag"
                v-if="useVideoJsMediaSkin"
                v-bind="mediaPlayerProps"
                :class="`${prefixCls}-audio-player`"
              >
                <component :is="mediaSkinTag" v-bind="mediaSkinProps" :class="mediaSkinClassNames">
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
            </div>
            <iframe
              v-else-if="type === 'pdf'"
              :key="currentSrc + 'pdf'"
              v-bind="mergedPdfProps"
              :class="`${prefixCls}-pdf`"
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
    FilePreviewerImageProps,
    FilePreviewerMediaProps,
    FilePreviewerPdfProps,
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

  const prefixCls = getPrefixCls('file-previewer');
  const wrapperRef = shallowRef<HTMLElement>();
  const status = shallowRef<FilePreviewerStatus>('beforeLoad');
  const requestId = shallowRef(0);
  let videoJsVideoPromise: Promise<unknown> | undefined;
  let videoJsAudioPromise: Promise<unknown> | undefined;

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

  const mergedImageProps = computed<FilePreviewerImageProps>(() => {
    const userProps = imageProps?.value ?? {};
    return {
      preview: false,
      width: '100%',
      height: '100%',
      fit: 'contain',
      alt: title?.value || '',
      ...userProps,
      src: currentSrc.value,
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
  const mergedPdfProps = computed<FilePreviewerPdfProps>(() => {
    const userProps = pdfProps?.value ?? {};
    return {
      title: 'PDF preview',
      ...userProps,
      src: currentSrc.value,
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
      if (type.value === 'video' || type.value === 'audio') {
        if (useVideoJsMediaSkin.value) {
          void prepareMedia(currentRequestId);
          return;
        }
        status.value = 'loading';
        return;
      }

      if (type.value === 'pdf') {
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
