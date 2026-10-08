<script setup lang="ts">
  import type { TourInstance, TourStep, TourStepHook } from '@sdata/web-vue';

  import { shallowRef, useTemplateRef } from 'vue';

  const tour = useTemplateRef<TourInstance>('tour');
  const confirmed = shallowRef(false);
  const onNextClick: TourStepHook = (_element, _step, { driver }) => {
    if (confirmed.value) driver.moveNext();
  };
  const steps: TourStep[] = [
    { element: '#tour-custom-target', popover: { side: 'bottom', align: 'center' } },
    { popover: {} },
  ];
</script>

<template>
  <sd-tour ref="tour" :steps="steps" :on-next-click="onNextClick" show-progress>
    <div class="sd:flex sd:flex-col sd:gap-4">
      <sd-button type="primary" @click="tour?.drive()">开始自定义导览</sd-button>
      <sd-button id="tour-custom-target">目标区域</sd-button>
    </div>
    <template #title="{ index }">
      <sd-space
        ><sd-tag color="blue">Vue 插槽</sd-tag>{{ index === 0 ? '自定义内容' : '完成' }}</sd-space
      >
    </template>
    <template #description="{ index }">
      <div v-if="index === 0" class="sd:flex sd:flex-col sd:gap-3">
        <strong>直接使用 Vue 组件和响应式状态</strong>
        <sd-checkbox v-model="confirmed">我已了解这项操作</sd-checkbox>
      </div>
      <sd-alert v-else type="success">所有步骤均可使用组件库组件，无需拼接 HTML。</sd-alert>
    </template>
    <template #footer="{ driver, index }">
      <sd-space fill>
        <sd-button size="small" @click="driver.drive(0)">重新开始</sd-button>
        <sd-button
          v-if="index === 0"
          size="small"
          type="primary"
          :disabled="!confirmed"
          @click="driver.moveNext()"
          >下一步</sd-button
        >
        <sd-button v-else size="small" type="primary" @click="driver.destroy()">完成</sd-button>
      </sd-space>
    </template>
  </sd-tour>
</template>
