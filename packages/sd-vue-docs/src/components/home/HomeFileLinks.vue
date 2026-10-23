<script setup lang="ts">
  import type { FilePreviewerType } from '@sdata/web-vue';

  import { onBeforeUnmount, shallowRef } from 'vue';

  import { Button, FilePreviewer, Link, MarkdownRender, Space, Trigger } from '@sdata/web-vue';
  import { IconClose } from '@sdata/web-vue/es/icon/index.js';
  const props = defineProps<{
    source: File | { name: string; url: string };
    type: FilePreviewerType | 'markdown';
  }>();
  const emit = defineEmits<{ remove: [] }>();
  const localUrl = 'url' in props.source ? undefined : URL.createObjectURL(props.source);
  const file = shallowRef({
    name: props.source.name,
    url: 'url' in props.source ? props.source.url : localUrl!,
    type: props.type,
    content: '',
    width: 0,
    height: 0,
  });
  if (props.type === 'markdown' && 'text' in props.source) {
    void props.source.text().then((content) => {
      file.value = { ...file.value, content };
    });
  }
  function imageLoaded(event: Event) {
    const image = event.target as HTMLImageElement;
    file.value = { ...file.value, width: image.naturalWidth, height: image.naturalHeight };
  }
  onBeforeUnmount(() => {
    if (localUrl) URL.revokeObjectURL(localUrl);
  });
</script>
<template>
  <Space class="home-file-links" :size="0">
    <Trigger
      :trigger="['hover', 'focus']"
      position="top"
      auto-fit-position
      auto-fit-popup-size
      auto-fit-transform-origin
      animation-name="slide-dynamic-origin"
      :unmount-on-close="true"
    >
      <Link :href="file.url" target="_blank" :title="file.name">{{ file.name }}</Link>
      <template #content>
        <div
          class="home-file-links__preview"
          :class="`home-file-links__preview--${file.type}`"
          :style="
            file.width && file.height
              ? {
                  '--preview-width': `${file.width}px`,
                  '--preview-ratio': file.width / file.height,
                }
              : undefined
          "
        >
          <div v-if="file.type === 'markdown'" class="home-file-links__markdown">
            <MarkdownRender :content="file.content ?? ''" final />
          </div>
          <FilePreviewer
            v-else
            :image-props="{
              onLoad: (event: Event) => imageLoaded(event),
              preview: false,
            }"
            :media-props="{ autoplay: true, muted: true, playsinline: true }"
            :src="file.url"
            :type="file.type"
            :title="file.type === 'pdf' ? file.name : undefined"
            :fullscreen="false"
          />
        </div>
      </template>
    </Trigger>
    <Button
      type="text"
      size="mini"
      shape="circle"
      :aria-label="`移除 ${file.name}`"
      @click="emit('remove')"
      ><IconClose
    /></Button>
  </Space>
</template>
<style lang="scss" scoped>
  .home-file-links__preview {
    --sd-file-previewer-size-inline-min-height: 0px;

    box-sizing: border-box;
    width: min(480px, calc(100vw - 32px), calc(var(--sd-trigger-available-height, 80dvh) * 16 / 9));
    aspect-ratio: 16 / 9;
    overflow: hidden;
    background: var(--sd-color-bg-popup);
    border: 1px solid var(--sd-color-border-2);
    border-radius: 4px;
    box-shadow: 0 4px 16px rgb(0 0 0 / 12%);
  }

  .home-file-links__preview--pdf,
  .home-file-links__preview--markdown {
    width: min(
      480px,
      calc(100vw - 32px),
      calc((100dvh - 96px) * 210 / 297),
      calc(var(--sd-trigger-available-height, 80dvh) * 210 / 297)
    );
    aspect-ratio: 210 / 297;
  }

  .home-file-links__preview--image {
    width: min(
      640px,
      var(--preview-width, 360px),
      calc(100vw - 32px),
      calc((100dvh - 96px) * var(--preview-ratio, 1)),
      calc(var(--sd-trigger-available-height, 80dvh) * var(--preview-ratio, 1))
    );
    aspect-ratio: var(--preview-ratio, 1);
  }

  .home-file-links__preview--pdf :deep(.sd-file-previewer-pdf-canvas) {
    width: 100% !important;
    height: 100% !important;
    object-fit: contain;
  }

  .home-file-links__markdown {
    box-sizing: border-box;
    height: 100%;
    padding: 12px;
    overflow: auto;
  }
</style>
