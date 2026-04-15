<template>
  <sd-select default-value="Beijing" :style="{ width: '320px' }" placeholder="Please select ...">
    <template #label="{ data }">
      <span><icon-plus />{{ data?.label }}</span>
    </template>
    <sd-option>Beijing</sd-option>
    <sd-option>Shanghai</sd-option>
    <sd-option>Guangzhou</sd-option>
    <sd-option disabled>Disabled</sd-option>
  </sd-select>
</template>

<script>
  import { IconPlus } from '@sdata/web-vue/es/icon/index.js';

  export default {
    components: { IconPlus },
  };
</script>
