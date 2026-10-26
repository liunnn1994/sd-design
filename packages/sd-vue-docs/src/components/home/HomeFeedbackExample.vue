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
<style lang="scss" scoped>
  .home-feedback-example {
    display: grid;
    gap: 12px;
    justify-items: start;
  }

  .home-feedback-example__refresh {
    justify-self: end;
  }

  .home-feedback-example > :deep(.sd-skeleton-reveal) {
    width: 100%;
  }

  .home-feedback-example__answer {
    padding: 18px;
    color: var(--sd-color-text-1);
    font-size: 13px;
    line-height: 1.8;
    background: var(--sd-color-fill-1);
    border: 1px solid var(--sd-color-border-1);
    border-radius: 10px;
  }

  .home-feedback-example__identity {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .home-feedback-example__identity img {
    flex-shrink: 0;
  }

  .home-feedback-example__identity strong {
    margin-right: auto;
    font-weight: 500;
    font-size: 12px;
  }

  .home-feedback-example__answer h3 {
    margin: 18px 0 6px;
    font-weight: 600;
    font-size: 16px;
    line-height: 1.5;
  }

  .home-feedback-example__answer p {
    margin: 0;
    color: var(--sd-color-text-2);
    font-size: 12px;
  }

  .home-feedback-example__answer ul {
    display: grid;
    gap: 6px;
    margin: 16px 0 20px;
    padding-left: 18px;
    color: var(--sd-color-text-2);
    font-size: 12px;
  }
</style>
