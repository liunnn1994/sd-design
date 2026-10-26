<template>
  <div>
    <sd-steps changeable label-placement="vertical" :current="current" @change="setCurrent">
      <sd-step description="这是一段描述">
        已成功
        <template v-slot:node="slotProps">
          <sd-popover content="步骤提示" :popup-visible="current === 1">
            <span>{{ slotProps.step }}</span>
          </sd-popover>
        </template>
      </sd-step>
      <sd-step description="这是一段描述">
        处理成功
        <template v-slot:node="slotProps">
          <sd-popover content="步骤提示" :popup-visible="current === 2">
            <span>{{ slotProps.step }}</span>
          </sd-popover>
        </template>
      </sd-step>
      <sd-step description="这是一段描述"
        >等待中
        <template v-slot:node="slotProps">
          <sd-popover content="步骤提示" :popup-visible="current === 3">
            <span>{{ slotProps.step }}</span>
          </sd-popover>
        </template>
      </sd-step>
    </sd-steps>
    <div class="sd:mt-5 sd:text-center">
      <sd-space size="large">
        <sd-button type="secondary" :disabled="current <= 1" @click="onPrev">
          <IconLeft />
          返回
        </sd-button>
        <sd-button type="primary" :disabled="current >= 3" @click="onNext">
          下一步
          <IconRight />
        </sd-button>
      </sd-space>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { StepsChangeHandler } from '@sdata/web-vue';

  import { ref } from 'vue';

  const current = ref(1);

  const onPrev = () => {
    current.value = Math.max(1, current.value - 1);
  };

  const onNext = () => {
    current.value = Math.min(3, current.value + 1);
  };

  const setCurrent: StepsChangeHandler = (step) => {
    current.value = step;
  };
</script>
