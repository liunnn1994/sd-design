<template>
  <sd-comment author="苏格拉底" content="评论正文内容。" datetime="1 hour">
    <template #actions>
      <span class="action" key="heart" @click="onLikeChange">
        <span v-if="like">
          <IconHeartFill class="sd:text-[#f53f3f]" />
        </span>
        <span v-else>
          <IconHeart />
        </span>
        {{ 83 + (like ? 1 : 0) }}
      </span>
      <span class="action" key="star" @click="onStarChange">
        <span v-if="star">
          <IconStarFill class="sd:text-[#ffb400]" />
        </span>
        <span v-else>
          <IconStar />
        </span>
        {{ 3 + (star ? 1 : 0) }}
      </span>
      <span class="action" key="reply"> <IconMessage /> 回复 </span>
    </template>
    <template #avatar>
      <sd-avatar>
        <img alt="头像" src="https://picsum.photos/1000/1000" />
      </sd-avatar>
    </template>
  </sd-comment>
</template>

<script setup lang="ts">
  import { ref } from 'vue';

  import {
    IconHeart,
    IconMessage,
    IconStar,
    IconStarFill,
    IconHeartFill,
  } from '@sdata/web-vue/es/icon/index.js';

  const like = ref(false);
  const star = ref(false);

  function onLikeChange() {
    like.value = !like.value;
  }

  function onStarChange() {
    star.value = !star.value;
  }
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
