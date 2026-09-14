<template>
  <div class="sd:h-75 sd:border sd:border-solid sd:rounded">
    <sd-panel-group class="sd:h-full">
      <sd-panel
        v-model:size="width"
        :min-size="180"
        max-size="55%"
        class="sd:overflow-hidden sd:p-2"
      >
        <div class="sd:flex sd:items-center sd:justify-between sd:mb-2">
          <span class="sd:text-sm sd:font-medium">文件</span>
          <sd-typography-text type="secondary">{{ width }}px</sd-typography-text>
        </div>
        <sd-divider />
        <sd-typography-paragraph>
          我们正在构建内容发现与创作的新体验。面板可以拖拽伸缩，松手后尺寸即时同步。
        </sd-typography-paragraph>
      </sd-panel>
      <sd-panel class="sd:overflow-hidden sd:p-2">
        <sd-typography-paragraph>
          右侧为填充面板（未设置 size），自动占据剩余空间。
        </sd-typography-paragraph>
      </sd-panel>
    </sd-panel-group>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';

  const width = ref(280);
</script>
