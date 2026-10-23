<script setup lang="ts">
  import type { SenderSlotConfig } from '@sdata/web-vue';

  import { computed, h, shallowRef, useTemplateRef } from 'vue';

  import {
    Button,
    Dropdown,
    Doption,
    Dgroup,
    Sender,
    SkeletonReveal,
    Tag,
    Space,
  } from '@sdata/web-vue';
  import { IconPlus, IconDown, IconArrowUp, IconRefresh } from '@sdata/web-vue/es/icon/index.js';

  import HomeFileLinks from './HomeFileLinks.vue';

  const context = shallowRef('AI 对话界面');
  const mode = shallowRef('Agent');
  const reveal = useTemplateRef('reveal');
  const sender = useTemplateRef('sender');
  const fileInput = useTemplateRef<HTMLInputElement>('fileInput');
  const scenes = ['AI 对话界面', '数据工作台', '知识库'];
  const slots = computed<SenderSlotConfig[]>(() => [
    { type: 'text', value: '用 SD Design 构建 ' },
    {
      type: 'select',
      key: `scene-${context.value}`,
      props: {
        options: scenes,
        defaultValue: scenes.includes(context.value) ? context.value : 'AI 对话界面',
      },
    },
    { type: 'text', value: '，要求 ' },
    {
      type: 'input',
      key: 'detail',
      props: { defaultValue: '清晰、轻量', placeholder: '补充要求' },
    },
    { type: 'text', value: '，参考 ' },
    {
      type: 'custom',
      key: 'example-logo',
      props: { defaultValue: 'android-chrome-192x192.png' },
      customRender: (_value, _change, state) =>
        h(HomeFileLinks, {
          source: { name: 'android-chrome-192x192.png', url: '/android-chrome-192x192.png' },
          type: 'image',
          onRemove: state.remove,
        }),
    },
    { type: 'text', value: '。' },
  ]);
  function addContext(action: unknown) {
    if (action === 'file') fileInput.value?.click();
    if (action === 'library') context.value = 'SD Design';
  }
  function selectMode(next: unknown) {
    if (next === 'Agent' || next === 'Ask') mode.value = next;
  }
  function addFiles(incoming: FileList) {
    const additions = Array.from(incoming).flatMap<SenderSlotConfig>((source) => {
      const type = source.type.startsWith('image/')
        ? 'image'
        : source.type.startsWith('video/')
          ? 'video'
          : source.type.startsWith('audio/')
            ? 'audio'
            : source.type === 'application/pdf' || /\.pdf$/i.test(source.name)
              ? 'pdf'
              : /\.(md|markdown)$/i.test(source.name) || source.type === 'text/markdown'
                ? 'markdown'
                : undefined;
      if (!type) return [];
      return [
        {
          type: 'custom',
          key: `file-${crypto.randomUUID()}`,
          props: { defaultValue: source.name },
          customRender: (_value, _onChange, state) =>
            h(HomeFileLinks, { source, type, onRemove: state.remove }),
        },
      ];
    });
    if (additions.length) sender.value?.insert(additions, 'cursor');
  }
  function chooseFile(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) addFiles(input.files);
    input.value = '';
  }
</script>
<template>
  <div class="home-workbench">
    <SkeletonReveal ref="reveal">
      <Sender
        ref="sender"
        :slot-config="slots"
        placeholder="描述你想构建的组件或界面…"
        suffix-placement="footer"
        :auto-size="{ minRows: 2, maxRows: 5 }"
        @paste-file="addFiles"
      >
        <template #footer>
          <Space :size="8">
            <Dropdown trigger="click" position="bl" @select="addContext">
              <Button shape="circle" type="outline" aria-label="添加内容"><IconPlus /></Button>
              <template #content>
                <Doption value="file">添加文件</Doption>
                <Doption value="library">添加组件库</Doption>
              </template>
            </Dropdown>
            <Tag v-if="context" class="home-workbench__context" closable @close="context = ''">{{
              context
            }}</Tag>
          </Space>
        </template>
        <template #suffix="{ actions }">
          <Space :size="8">
            <Dropdown trigger="click" position="br" :popup-max-height="false" @select="selectMode">
              <Button type="outline" aria-label="选择工作方式">{{ mode }} <IconDown /></Button>
              <template #content>
                <Dgroup title="工作方式"
                  ><Doption value="Agent">Agent</Doption><Doption value="Ask">Ask</Doption></Dgroup
                >
                <Dgroup title="构建方式"
                  ><Doption>Vue 3</Doption><Doption disabled>React · 即将到来</Doption></Dgroup
                >
              </template>
            </Dropdown>
            <Button
              type="primary"
              shape="circle"
              :disabled="actions.submitDisabled"
              aria-label="发送需求"
              @click="actions.send()"
              ><IconArrowUp
            /></Button>
          </Space>
        </template>
      </Sender>
    </SkeletonReveal>
    <input
      ref="fileInput"
      class="home-workbench__file"
      type="file"
      multiple
      accept="image/*,video/*,audio/*,application/pdf,.md,.markdown,text/markdown"
      aria-label="选择参考文件"
      @change="chooseFile"
    />
    <div class="home-workbench__below">
      <Button type="text" shape="circle" aria-label="重播入场" @click="reveal?.replay()"
        ><IconRefresh
      /></Button>
    </div>
  </div>
</template>
<style lang="scss" scoped>
  .home-workbench {
    min-width: 0;
    text-align: left;
  }

  .home-workbench__file {
    display: none;
  }

  .home-workbench__below {
    display: flex;
    gap: 8px;
    align-items: center;
    justify-content: flex-end;
    margin-top: 8px;
  }
</style>
