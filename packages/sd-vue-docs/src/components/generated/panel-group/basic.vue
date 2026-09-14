<template>
  <div class="single-panel-demo" :style="{ '--panel-height': `${contentHeight}px` }">
    <sd-panel-group>
      <sd-panel v-model:size="width" :min-size="100" max-size="100%">
        <sd-panel-group orientation="vertical">
          <sd-panel v-model:size="height" :min-size="100" :max-size="340">
            <div ref="contentRef" class="single-panel-demo-content">
              <sd-typography-paragraph>
                我们正在构建内容发现与创作的新体验。
              </sd-typography-paragraph>
              <sd-divider />
              <sd-typography-paragraph>
                拖拽右侧调整宽度，拖拽底部调整高度。两根伸缩杆交汇处可以同时调整宽高。
              </sd-typography-paragraph>
              <sd-divider>内容面板</sd-divider>
              <sd-typography-text type="secondary"
                >{{ width }} × {{ height }} px</sd-typography-text
              >
            </div>
          </sd-panel>
          <sd-panel />
        </sd-panel-group>
      </sd-panel>
      <sd-panel />
    </sd-panel-group>
  </div>
</template>

<script setup lang="ts">
  import { ref, useTemplateRef } from 'vue';

  import { useElementSize } from '@vueuse/core';

  const width = ref(500);
  const height = ref(200);
  const contentRef = useTemplateRef<HTMLElement>('contentRef');
  // size 在拖拽结束后提交，伸缩杆跟随内容盒子的实时尺寸（包含边框）。
  const { height: contentHeight } = useElementSize(
    contentRef,
    { width: width.value, height: height.value },
    { box: 'border-box' },
  );
</script>

<style scoped lang="scss">
  .single-panel-demo {
    height: 360px;

    // 空白填充面板只用于提供伸缩空间，右侧伸缩杆与内容面板等高。
    :deep(> .sd-panel-group > .sd-panel > .sd-panel-separator-edge) {
      height: var(--panel-height);
    }
  }

  .single-panel-demo-content {
    height: 100%;
    padding: 12px;
    overflow: hidden;
    border: 1px solid var(--sd-color-border-2);
    text-align: center;
  }
</style>
