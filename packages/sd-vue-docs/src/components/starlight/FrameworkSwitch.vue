<script setup lang="ts">
  import { RadioGroup } from '@sdata/web-vue';

  defineProps<{
    isReact: boolean;
    vueHref: string;
    reactHref: string;
  }>();

  const options = [
    { label: 'Vue', value: 'vue' },
    { label: 'React', value: 'react' },
  ];

  function switchFramework(href: string) {
    const url = new URL(href, window.location.href);
    url.hash = window.location.hash;
    window.location.assign(url.href);
  }
</script>

<template>
  <RadioGroup
    class="framework-switch"
    type="button"
    aria-label="文档框架"
    :model-value="isReact ? 'react' : 'vue'"
    :options="options"
    @change="(value) => switchFramework(value === 'react' ? reactHref : vueHref)"
  />
</template>

<style scoped lang="scss">
  .framework-switch {
    display: flex;
    width: 100%;
    margin-bottom: 1rem;

    :deep(.sd-radio-button) {
      flex: 1;
      text-align: center;
    }
  }
</style>
