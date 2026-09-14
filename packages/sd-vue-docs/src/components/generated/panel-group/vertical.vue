<template>
  <div class="sd:h-75 sd:border sd:border-solid sd:rounded">
    <sd-panel-group orientation="vertical" class="sd:h-full">
      <sd-panel class="sd:overflow-hidden sd:p-2">
        <sd-typography-paragraph>编辑器区域（填充面板）。</sd-typography-paragraph>
      </sd-panel>
      <sd-panel-separator />
      <sd-panel
        v-model:size="height"
        :min-size="80"
        :max-size="220"
        class="sd:overflow-hidden sd:p-2"
      >
        <div class="sd:flex sd:items-center sd:justify-between sd:mb-1">
          <span class="sd:text-sm sd:font-medium">输出</span>
          <sd-typography-text type="secondary">{{ height }}px</sd-typography-text>
        </div>
        <sd-divider />
        <sd-typography-paragraph>底部输出面板（垂直方向）。</sd-typography-paragraph>
      </sd-panel>
    </sd-panel-group>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';

  const height = ref(120);
</script>
