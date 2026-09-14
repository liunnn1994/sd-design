<template>
  <div class="sd:h-75 sd:border sd:border-solid sd:rounded">
    <sd-panel-group class="sd:h-full">
      <sd-panel v-model:size="left" min-size="14%" max-size="35%" class="sd:overflow-hidden sd:p-2">
        <div class="sd:flex sd:items-center sd:justify-between sd:mb-1">
          <span class="sd:text-sm sd:font-medium">文件</span>
          <sd-typography-text type="secondary">{{ left }}px</sd-typography-text>
        </div>
        <sd-divider />
        <sd-typography-paragraph>左侧文件列表面板。</sd-typography-paragraph>
      </sd-panel>
      <sd-panel class="sd:overflow-hidden sd:p-2">
        <sd-typography-paragraph> 中间为填充面板，两侧面板均可拖拽伸缩。 </sd-typography-paragraph>
      </sd-panel>
      <sd-panel
        v-model:size="right"
        min-size="14%"
        max-size="35%"
        class="sd:overflow-hidden sd:p-2"
      >
        <div class="sd:flex sd:items-center sd:justify-between sd:mb-1">
          <span class="sd:text-sm sd:font-medium">大纲</span>
          <sd-typography-text type="secondary">{{ right }}px</sd-typography-text>
        </div>
        <sd-divider />
        <sd-typography-paragraph>右侧大纲面板。</sd-typography-paragraph>
      </sd-panel>
    </sd-panel-group>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';

  const left = ref(200);
  const right = ref(200);
</script>
