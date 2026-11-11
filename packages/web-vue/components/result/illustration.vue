<template>
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 213 213"
    style="fill-rule: evenodd; clip-rule: evenodd; stroke-linejoin: round; stroke-miterlimit: 2"
    v-html="markup"
  />
</template>

<script setup lang="ts">
  import { computed, useId } from 'vue';

  import {
    getResultIllustration,
    type ResultIllustrationStatus,
  } from '@sdata/web-core/result/illustrations';

  const props = defineProps<{ status: ResultIllustrationStatus }>();
  const id = useId();
  const markup = computed(() => getResultIllustration(props.status, id));
</script>
