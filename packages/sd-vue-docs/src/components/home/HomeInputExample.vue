<script setup lang="ts">
  import type { SenderInstance, SenderSlotConfig } from '@sdata/web-vue';
  import type { ScrollbarInstance } from '@sdata/web-vue';

  import { nextTick, shallowRef, useTemplateRef, watch } from 'vue';

  import { Sender, Scrollbar, MarkdownRender, Progress } from '@sdata/web-vue';

  import { useBrowserChat } from './useBrowserChat';

  const { messages, busy, replying, preparing, progress, error, send, stop } = useBrowserChat();
  const scrollbar = useTemplateRef<ScrollbarInstance>('scrollbar');
  const sender = useTemplateRef<SenderInstance>('sender');
  const following = shallowRef(true);
  function trackScroll() {
    const viewport = scrollbar.value?.elements()?.scrollOffsetElement;
    if (viewport)
      following.value = viewport.scrollHeight - viewport.clientHeight - viewport.scrollTop < 32;
  }
  async function scrollBottom() {
    await nextTick();
    scrollbar.value?.update();
    const viewport = scrollbar.value?.elements()?.scrollOffsetElement;
    if (viewport) scrollbar.value?.scrollTop(viewport.scrollHeight);
  }
  function followReply() {
    if (following.value) void scrollBottom();
  }
  watch(
    [messages, busy],
    () => {
      if (following.value) void scrollBottom();
    },
    { flush: 'post' },
  );
  const slots: SenderSlotConfig[] = [
    { type: 'text', value: '介绍一下 ' },
    { type: 'input', key: 'topic', props: { defaultValue: 'Sender', placeholder: '组件名称' } },
    { type: 'text', value: ' 的用途。' },
  ];
  function submit(value: string) {
    if (replying.value || !value.trim()) return;
    following.value = true;
    void send(value);
    sender.value?.clear();
  }
</script>
<template>
  <div class="home-input-example">
    <div class="home-input-example__heading"
      ><img src="/logo-icon.png" alt="" width="22" height="22" /><strong>组件助手</strong
      ><Progress
        v-if="preparing"
        class="home-input-example__progress"
        size="mini"
        :percent="progress"
        :show-text="false"
        aria-label="模型加载进度"
    /></div>
    <Scrollbar ref="scrollbar" :outer-style="{ height: '240px' }" @scroll="trackScroll"
      ><ol class="home-input-example__messages" role="log" aria-label="对话记录" aria-live="polite"
        ><li v-for="(message, index) in messages" :key="index" :class="message.role"
          ><img
            v-if="message.role === 'assistant'"
            src="/logo-icon.png"
            alt="助手"
            width="22"
            height="22"
          /><div v-if="message.role === 'assistant'" class="home-input-example__bubble"
            ><MarkdownRender
              :content="message.content"
              final
              :batch-rendering="false"
              :node-virtual="false"
              :style="{ contentVisibility: 'visible', containIntrinsicSize: 'none' }"
              @render-settled="followReply" /></div
          ><p v-else class="home-input-example__bubble">{{ message.content }}</p
          ><span v-if="message.role === 'user'" class="home-input-example__avatar" aria-label="你"
            >你</span
          ></li
        ><li v-if="busy && !preparing" class="assistant"
          ><p class="home-input-example__bubble">正在回复…</p></li
        ></ol
      ></Scrollbar
    >
    <Sender
      ref="sender"
      :slot-config="slots"
      placeholder="输入组件问题，例如：如何使用 Sender？"
      :auto-size="{ minRows: 2, maxRows: 3 }"
      :loading="replying"
      @submit="submit"
      @cancel="stop"
    />
    <span v-if="error" class="home-input-example__error" role="status">{{ error }}</span>
  </div>
</template>
<style lang="scss" scoped>
  .home-input-example {
    display: grid;
    gap: 18px;
  }

  .home-input-example__error {
    color: rgb(var(--sd-danger-6));
    font-size: 12px;
  }

  .home-input-example__heading {
    display: flex;
    gap: 8px;
    align-items: center;
    font-size: 12px;
  }

  .home-input-example__heading strong {
    color: var(--sd-color-text-1);
    font-weight: 500;
  }

  .home-input-example__progress {
    margin-left: auto;
  }

  .home-input-example__messages {
    display: grid;
    gap: 16px;
    margin: 0;
    padding: 0 10px 8px 0;
    list-style: none;
  }

  .home-input-example__messages > li {
    display: flex;
    gap: 8px;
    align-items: flex-start;
  }

  .home-input-example__messages .user {
    justify-content: flex-end;
  }

  .home-input-example__messages > li > img {
    flex-shrink: 0;
    margin-top: 6px;
  }

  .home-input-example__bubble {
    min-width: 0;
    max-width: 82%;
    margin: 0;
    padding: 9px 12px;
    color: var(--sd-color-text-1);
    font-size: 12px;
    line-height: 1.8;
    overflow-wrap: anywhere;
    background: var(--sd-color-fill-2);
    border-radius: 2px 10px 10px;
  }

  .home-input-example__messages .user .home-input-example__bubble {
    color: rgb(var(--sd-primary-7));
    white-space: pre-wrap;
    background: var(--sd-color-primary-light-1);
    border-radius: 10px 2px 10px 10px;
  }

  .home-input-example__bubble :deep(.sd-markdown-render) {
    font-size: 12px;
    line-height: 1.8;
  }

  .home-input-example__avatar {
    display: grid;
    flex-shrink: 0;
    place-items: center;
    width: 22px;
    height: 22px;
    margin-top: 6px;
    color: var(--sd-color-text-2);
    font-size: 10px;
    background: var(--sd-color-fill-2);
    border-radius: 50%;
  }
</style>
