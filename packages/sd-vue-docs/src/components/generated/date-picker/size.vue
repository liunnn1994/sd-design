<template>
  <div style="margin-bottom: 20px">
    <sd-radio-group v-model="size" type="button">
      <sd-radio value="mini">mini</sd-radio>
      <sd-radio value="small">small</sd-radio>
      <sd-radio value="medium">medium</sd-radio>
      <sd-radio value="large">large</sd-radio>
    </sd-radio-group>
  </div>
  <sd-date-picker :size="size" style="width: 254px" />
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
