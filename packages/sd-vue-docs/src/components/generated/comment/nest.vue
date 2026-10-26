<template>
  <sd-comment
    author="苏格拉底"
    avatar="https://picsum.photos/1000/1000"
    content="评论正文内容。"
    datetime="1 hour"
  >
    <template #actions>
      <span class="action"> <IconMessage /> 回复 </span>
    </template>
    <sd-comment
      author="巴尔扎克"
      avatar="https://picsum.photos/1000/1000"
      content="评论正文内容。"
      datetime="1 hour"
    >
      <template #actions>
        <span class="action"> <IconMessage /> 回复 </span>
      </template>
      <sd-comment
        author="奥斯汀"
        avatar="https://picsum.photos/1000/1000"
        content="回复内容"
        datetime="1 hour"
      >
        <template #actions>
          <span class="action"> <IconMessage /> 回复 </span>
        </template>
      </sd-comment>
      <sd-comment
        author="柏拉图"
        avatar="https://picsum.photos/1000/1000"
        content="回复内容"
        datetime="1 hour"
      >
        <template #actions>
          <span class="action"> <IconMessage /> 回复 </span>
        </template>
      </sd-comment>
    </sd-comment>
  </sd-comment>
</template>

<script setup lang="ts">
  import { IconHeart, IconMessage, IconStar } from '@sdata/web-vue/es/icon/index.js';
</script>

<style scoped>
  .action {
    display: inline-block;
    padding: 0 4px;
    color: var(--color-text-1);
    line-height: 24px;
    background: transparent;
    border-radius: 2px;
    cursor: pointer;
    transition: all 0.1s ease;
  }

  .action:hover {
    background: var(--color-fill-3);
  }
</style>
