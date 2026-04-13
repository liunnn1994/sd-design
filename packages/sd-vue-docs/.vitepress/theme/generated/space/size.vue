<template>
  <div>
    <div style="marginbottom: 20px">
      <a-radio-group v-model="size" type="button">
        <a-radio value="mini">mini</a-radio>
        <a-radio value="small">small</a-radio>
        <a-radio value="medium">medium</a-radio>
        <a-radio value="large">large</a-radio>
      </a-radio-group>
    </div>
    <a-space :size="size">
      <a-button type="primary">Item1</a-button>
      <a-button type="primary">Item2</a-button>
      <a-button type="primary">Item3</a-button>
    </a-space>
  </div>
</template>
<script>
  export default {
    data() {
      return {
        size: 'medium',
      };
    },
  };
</script>
