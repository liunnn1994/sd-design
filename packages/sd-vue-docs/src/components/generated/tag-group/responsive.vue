<template>
  <div>
    <sd-typography-text type="secondary" class="sd:mb-2 sd:block">
      拖拽右侧手柄，观察标签组如何根据容器宽度自动折叠。
    </sd-typography-text>
    <div class="sd:h-28 sd:rounded sd:border sd:border-solid"
      ><sd-panel-group>
        <sd-panel
          v-model:size="width"
          :min-size="140"
          max-size="60%"
          class="sd:overflow-hidden sd:p-2"
        >
          <sd-tag-group :options="options" />
        </sd-panel>
        <sd-panel-separator />
        <sd-panel class="sd:p-2">
          <span>自适应区域</span>
        </sd-panel>
      </sd-panel-group></div
    >
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';

  const width = ref(300);
  const options = ['超长标签文案需要折叠', '处理中', '已告警'];
</script>
