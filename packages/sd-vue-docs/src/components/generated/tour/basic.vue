<script setup lang="ts">
  import type { TourInstance, TourStep } from '@sdata/web-vue';

  import { useTemplateRef } from 'vue';

  const tour = useTemplateRef<TourInstance>('tour');
  const steps: TourStep[] = [
    {
      element: '#tour-basic-filter',
      popover: { title: '筛选条件', description: '先确定查询范围。' },
    },
    {
      element: '#tour-basic-result',
      popover: { title: '结果面板', description: '在这里查看查询结果。' },
    },
  ];
</script>

<template>
  <sd-tour
    ref="tour"
    :steps="steps"
    show-progress
    next-btn-text="下一步"
    prev-btn-text="上一步"
    done-btn-text="完成"
    progress-text="第 {{current}} / {{total}} 步"
  >
    <div class="sd:flex sd:flex-col sd:gap-4">
      <sd-button type="primary" @click="tour?.drive()">开始导览</sd-button>
      <sd-button id="tour-basic-filter">筛选条件</sd-button>
      <sd-button id="tour-basic-result">结果面板</sd-button>
    </div>
  </sd-tour>
</template>
