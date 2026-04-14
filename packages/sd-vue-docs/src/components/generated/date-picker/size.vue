<template>
  <div style="margin-bottom: 20px;">
    <a-radio-group v-model="size" type="button">
      <a-radio value="mini">mini</a-radio>
      <a-radio value="small">small</a-radio>
      <a-radio value="medium">medium</a-radio>
      <a-radio value="large">large</a-radio>
    </a-radio-group>
  </div>
  <a-date-picker :size="size" style="width: 254px;" />
</template>
<script>
  export default {
    data() {
      return {
        size: 'small',
      };
    },
  };
</script>
