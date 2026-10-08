<script setup lang="ts">
  import type { TourInstance } from '@sdata/web-vue';

  import { useTemplateRef } from 'vue';

  const tour = useTemplateRef<TourInstance>('tour');
</script>

<template>
  <sd-tour ref="tour" :overlay-opacity="0.2" :animate="false" :stage-padding="8" :stage-radius="6">
    <div class="sd:flex sd:flex-col sd:gap-4">
      <sd-button
        type="primary"
        @click="
          tour?.highlight({
            element: '#tour-highlight-target',
            popover: {
              title: '单元素高亮',
              description: '直接调用原生 highlight，不需要 steps 数组。',
              showButtons: ['close'],
            },
          })
        "
        >高亮单个元素</sd-button
      >
      <sd-button id="tour-highlight-target">需要关注的操作</sd-button>
    </div>
  </sd-tour>
</template>
