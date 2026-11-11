<script setup lang="ts">
  import { shallowRef, useTemplateRef } from 'vue';

  import { Button, Link, SkeletonReveal, Tag } from '@sdata/web-vue';
  import { IconRefresh } from '@sdata/web-vue/es/icon/index.js';
  const reveal = useTemplateRef('reveal');
  const adopted = shallowRef(false);
</script>
<template>
  <div class="home-feedback-example">
    <Link
      class="home-feedback-example__refresh"
      role="button"
      tabindex="0"
      aria-label="刷新反馈示例"
      title="刷新"
      @click="reveal?.replay()"
      @keydown.enter.prevent="reveal?.replay()"
      @keydown.space.prevent="reveal?.replay()"
      ><template #icon><IconRefresh /></template
    ></Link>
    <SkeletonReveal ref="reveal" :duration="2000">
      <div class="home-feedback-example__answer">
        <div class="home-feedback-example__identity"
          ><img src="/logo-icon.png" alt="" width="24" height="24" /><strong>SD 助手</strong
          ><Tag color="green" size="small">已生成</Tag></div
        >
        <h3>产品发布计划已就绪</h3>
        <p>从亮点到行动，下一步更清晰。</p>
        <ul
          ><li>整理 3 个核心更新亮点</li
          ><li>准备发布文案与渠道</li
          ><li>收集反馈，持续改进</li></ul
        >
        <Button
          size="small"
          :type="adopted ? 'secondary' : 'primary'"
          :aria-pressed="adopted"
          @click="adopted = !adopted"
          >{{ adopted ? '已采用' : '采用计划' }}</Button
        >
      </div>
    </SkeletonReveal>
  </div>
</template>
<style lang="scss" src="./HomeFeedbackExample.scss"></style>
