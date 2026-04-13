<template>
  <a-select default-value="Beijing" :style="{ width: '320px' }" placeholder="Please select ...">
    <template #label="{ data }">
      <span><icon-plus />{{ data?.label }}</span>
    </template>
    <a-option>Beijing</a-option>
    <a-option>Shanghai</a-option>
    <a-option>Guangzhou</a-option>
    <a-option disabled>Disabled</a-option>
  </a-select>
</template>

<script>
  import { IconPlus } from '@sdata/web-vue/es/icon';

  export default {
    components: { IconPlus },
  };
</script>
