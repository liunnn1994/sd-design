<template>
  <div class="sd:h-90 sd:border sd:border-solid sd:rounded">
    <sd-panel-group class="sd:h-full">
      <sd-panel
        v-model:size="sidebar"
        min-size="18%"
        max-size="45%"
        class="sd:overflow-hidden sd:p-2"
      >
        <div class="sd:flex sd:items-center sd:justify-between sd:mb-1">
          <span class="sd:text-sm sd:font-medium">文件</span>
          <sd-typography-text type="secondary">{{ sidebar }}px</sd-typography-text>
        </div>
        <sd-divider />
        <sd-typography-paragraph>文件树。</sd-typography-paragraph>
      </sd-panel>
      <sd-panel-separator />
      <sd-panel class="sd:overflow-hidden">
        <sd-panel-group orientation="vertical" class="sd:h-full">
          <sd-panel class="sd:overflow-hidden sd:p-2">
            <sd-typography-paragraph>编辑器（嵌套的垂直面板组）。</sd-typography-paragraph>
          </sd-panel>
          <sd-panel-separator />
          <sd-panel
            v-model:size="terminal"
            :min-size="60"
            :max-size="180"
            class="sd:overflow-hidden sd:p-2"
          >
            <div class="sd:flex sd:items-center sd:justify-between sd:mb-1">
              <span class="sd:text-sm sd:font-medium">控制台</span>
              <sd-typography-text type="secondary">{{ terminal }}px</sd-typography-text>
            </div>
            <sd-divider />
            <sd-typography-paragraph>控制台面板。</sd-typography-paragraph>
          </sd-panel>
        </sd-panel-group>
      </sd-panel>
    </sd-panel-group>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';

  const sidebar = ref(200);
  const terminal = ref(100);
</script>
