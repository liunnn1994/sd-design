<script setup lang="ts">
  import HomeContentExample from './HomeContentExample.vue';
  import HomeFeedbackExample from './HomeFeedbackExample.vue';
  import HomeInputExample from './HomeInputExample.vue';
</script>
<template>
  <div class="home-ai-examples">
    <article
      ><header><span>01 / 输入</span><a href="/components/sender/">发送器 ↗</a></header
      ><div class="home-ai-examples__stage"><HomeInputExample /></div
    ></article>
    <article
      ><header><span>02 / 呈现</span><a href="/components/timeline/">时间轴 ↗</a></header
      ><div class="home-ai-examples__stage"><HomeContentExample /></div
    ></article>
    <article
      ><header><span>03 / 反馈</span><a href="/components/skeleton-reveal/">骨架过渡 ↗</a></header
      ><div class="home-ai-examples__stage"><HomeFeedbackExample /></div
    ></article>
  </div>
</template>
<style lang="scss" scoped>
  .home-ai-examples {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 20px;

    article {
      min-width: 0;
      border: 1px solid var(--sd-color-border-1);
      border-radius: 12px;
    }

    header {
      display: flex;
      gap: 12px;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      border-bottom: 1px solid var(--sd-color-border-1);
    }

    header span {
      color: rgb(var(--sd-primary-7));
      font-weight: 500;
      font-size: 13px;
    }

    a {
      color: var(--sd-color-text-2);
      font-size: 11px;
      text-decoration: none;
    }

    a:hover {
      color: rgb(var(--sd-primary-7));
    }

    a:focus-visible {
      outline: 2px solid rgb(var(--sd-primary-6));
      outline-offset: 4px;
    }

    &__stage {
      min-width: 0;
      padding: 22px 20px;
    }

    @media (width < 60rem) {
      grid-template-columns: 1fr;
    }
  }
</style>
