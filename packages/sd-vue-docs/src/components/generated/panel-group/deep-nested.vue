<template>
  <div>
    <sd-space class="sd:mb-2">
      <sd-button size="small" @click="filesCollapsed = !filesCollapsed">切换文件面板</sd-button>
      <sd-button size="small" @click="outlineCollapsed = !outlineCollapsed">切换大纲面板</sd-button>
      <sd-button size="small" @click="terminalCollapsed = !terminalCollapsed"
        >切换终端面板</sd-button
      >
    </sd-space>
    <div class="sd:h-90 sd:border sd:border-solid sd:rounded"
      ><sd-panel-group>
        <sd-panel
          v-model:size="files"
          v-model:collapsed="filesCollapsed"
          min-size="12%"
          max-size="30%"
          class="sd:p-2"
        >
          文件列表
        </sd-panel>
        <sd-panel-separator />
        <sd-panel>
          <sd-panel-group orientation="vertical">
            <sd-panel>
              <sd-panel-group>
                <sd-panel class="sd:p-2">编辑器区域</sd-panel>
                <sd-panel-separator />
                <sd-panel
                  v-model:size="outline"
                  v-model:collapsed="outlineCollapsed"
                  min-size="12%"
                  max-size="30%"
                  class="sd:p-2"
                >
                  大纲
                </sd-panel>
              </sd-panel-group>
            </sd-panel>
            <sd-panel-separator />
            <sd-panel
              v-model:size="terminal"
              v-model:collapsed="terminalCollapsed"
              :min-size="60"
              :max-size="160"
              :transition="{ type: 'spring', duration: 700, bounce: 0.4 }"
              class="sd:p-2"
            >
              终端输出
            </sd-panel>
          </sd-panel-group>
        </sd-panel>
      </sd-panel-group></div
    >
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';

  const files = ref(140);
  const outline = ref(120);
  const terminal = ref(90);
  const filesCollapsed = ref(false);
  const outlineCollapsed = ref(false);
  const terminalCollapsed = ref(false);
</script>
