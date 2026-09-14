<template>
  <div>
    <sd-space class="sd:mb-2">
      <sd-button size="small" @click="collapsed = !collapsed">
        {{ collapsed ? '展开' : '收起' }}
      </sd-button>
      <sd-radio-group v-model:model-value="fold" type="button" size="small">
        <sd-radio value="flip">翻转</sd-radio>
        <sd-radio value="fade">淡入淡出</sd-radio>
        <sd-radio value="scale">缩放</sd-radio>
        <sd-radio value="snap">无动画</sd-radio>
        <sd-radio value="spring">弹簧</sd-radio>
      </sd-radio-group>
    </sd-space>
    <div class="sd:h-75 sd:border sd:border-solid sd:rounded">
      <sd-panel-group class="sd:h-full">
        <sd-panel
          v-model:size="width"
          v-model:collapsed="collapsed"
          :min-size="180"
          max-size="52%"
          :fold="folds[fold]"
          :transition="transitions[fold]"
          class="sd:overflow-hidden sd:p-2"
        >
          <div class="sd:flex sd:items-center sd:justify-between sd:mb-1">
            <span class="sd:text-sm sd:font-medium">导航</span>
            <sd-typography-text type="secondary">
              {{ collapsed ? '已折叠' : `${width}px` }}
            </sd-typography-text>
          </div>
          <sd-divider />
          <sd-typography-paragraph>折叠时内容应用 fold 姿态动画。</sd-typography-paragraph>
        </sd-panel>
        <sd-panel-separator />
        <sd-panel class="sd:overflow-hidden sd:p-2">
          <sd-typography-paragraph>编辑器区域（填充面板）。</sd-typography-paragraph>
        </sd-panel>
      </sd-panel-group>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { PanelFold, PanelTransition } from '@sdata/web-vue';

  import { ref } from 'vue';

  const collapsed = ref(false);
  const fold = ref<'flip' | 'fade' | 'scale' | 'snap' | 'spring'>('flip');
  const width = ref(260);

  const folds = {
    flip: {
      hidden: {
        opacity: 0,
        transform: 'perspective(500px) rotateY(-75deg)',
        transformOrigin: 'right center',
      },
      shown: {
        opacity: 1,
        transform: 'perspective(500px) rotateY(0deg)',
        transformOrigin: 'right center',
      },
    },
    fade: {
      hidden: { opacity: 0 },
      shown: { opacity: 1 },
    },
    scale: {
      hidden: { opacity: 0, transform: 'scale(0.85)' },
      shown: { opacity: 1, transform: 'scale(1)' },
    },
    snap: {},
    spring: {
      hidden: { opacity: 0, transform: 'scale(0.9)' },
      shown: { opacity: 1, transform: 'scale(1)' },
    },
  } satisfies Record<string, PanelFold>;

  const transitions: Record<string, PanelTransition> = {
    flip: { duration: 280, easing: [0.25, 0.46, 0.45, 0.94] },
    fade: { duration: 350 },
    scale: { duration: 250 },
    snap: { duration: 0 },
    spring: { type: 'spring', bounce: 0.4, duration: 700 },
  };
</script>
