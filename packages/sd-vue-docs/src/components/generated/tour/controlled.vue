<script setup lang="ts">
  import type { TourInstance, TourProps, TourStep } from '@sdata/web-vue';

  import { shallowRef, useTemplateRef } from 'vue';

  const tour = useTemplateRef<TourInstance>('tour');
  const current = shallowRef<number>();
  const status = shallowRef('尚未开始');
  const steps: TourStep[] = [
    {
      element: '#tour-api-first',
      popover: { title: '第一个目标', description: '下一步使用原生 moveNext 方法。' },
    },
    {
      element: '#tour-api-second',
      popover: { title: '第二个目标', description: '可从任意步骤启动，也可随时销毁。' },
    },
  ];
  const onHighlighted: TourProps['onHighlighted'] = (_element, _step, { driver, index }) => {
    current.value = index;
    status.value = driver.isActive() ? '进行中' : '已结束';
  };
  const onDestroyed: TourProps['onDestroyed'] = () => {
    status.value = '已结束';
  };
</script>

<template>
  <sd-tour
    ref="tour"
    :steps="steps"
    :on-highlighted="onHighlighted"
    :on-destroyed="onDestroyed"
    next-btn-text="下一步"
    prev-btn-text="上一步"
    done-btn-text="完成"
  >
    <div class="sd:flex sd:flex-col sd:gap-4">
      <div>状态：{{ status }}，步骤下标：{{ current ?? '无' }}</div>
      <sd-button type="primary" @click="tour?.drive(1)">从第二步开始</sd-button>
      <div id="tour-api-first"
        ><sd-button @click="tour?.moveNext()">业务操作：下一步</sd-button></div
      >
      <div id="tour-api-second"><sd-button @click="tour?.destroy()">结束导览</sd-button></div>
    </div>
  </sd-tour>
</template>
