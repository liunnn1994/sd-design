<script setup lang="ts">
  import { shallowRef } from 'vue';

  import { Button, Tag, Timeline, TimelineItem } from '@sdata/web-vue';
  const published = shallowRef(false);
</script>
<template>
  <div class="home-content-example">
    <div class="home-content-example__heading"
      ><strong>发布进度</strong
      ><Tag size="small" :color="published ? 'green' : 'blue'">{{
        published ? '已发布' : '进行中'
      }}</Tag></div
    >
    <Timeline>
      <TimelineItem label="09:30" dot-color="rgb(var(--sd-success-6))"
        ><strong>整理更新亮点</strong><p>让每一次改进，都被看见。</p></TimelineItem
      >
      <TimelineItem label="10:00" dot-color="rgb(var(--sd-success-6))"
        ><strong>准备发布内容</strong><p>文案、截图与版本说明。</p></TimelineItem
      >
      <TimelineItem
        :label="published ? '10:30' : '下一步'"
        :dot-color="published ? 'rgb(var(--sd-success-6))' : 'rgb(var(--sd-primary-6))'"
        ><strong>{{ published ? '版本已发布' : '发布新版本' }}</strong
        ><p>{{ published ? '新的体验，已经上线。' : '一切就绪，等待出发。' }}</p></TimelineItem
      >
    </Timeline>
    <Button
      size="small"
      :type="published ? 'secondary' : 'primary'"
      @click="published = !published"
      >{{ published ? '重新演示' : '发布版本' }}</Button
    >
  </div>
</template>
<style lang="scss" scoped>
  .home-content-example {
    display: grid;
    gap: 24px;
    justify-items: start;
  }

  .home-content-example__heading {
    display: flex;
    gap: 12px;
    align-items: center;
    width: 100%;
    color: var(--sd-color-text-1);
    font-size: 14px;
  }

  .home-content-example__heading strong {
    margin-right: auto;
    font-weight: 500;
  }

  .home-content-example :deep(.sd-timeline) {
    width: 100%;
  }

  .home-content-example :deep(.sd-timeline-item-content) strong {
    color: var(--sd-color-text-1);
    font-weight: 500;
    font-size: 13px;
  }

  .home-content-example p {
    margin: 6px 0 0;
    color: var(--sd-color-text-2);
    font-size: 12px;
    line-height: 1.8;
  }
</style>
