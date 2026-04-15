<template>
  <div>
    <sd-split
      :style="{
        height: '200px',
        width: '100%',
        minWidth: '500px',
        border: '1px solid var(--color-border)',
      }"
      v-model:size="size"
      min="80px"
    >
      <template #first>
        <sd-typography-paragraph>Left</sd-typography-paragraph>
      </template>
      <template #second>
        <sd-typography-paragraph>Right</sd-typography-paragraph>
      </template>
    </sd-split>
  </div>
</template>
<script>
  export default {
    data() {
      return {
        size: 0.5,
      };
    },
  };
</script>
