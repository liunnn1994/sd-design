<template>
  <div>
    <div style="marginbottom: 20px">
      <sd-radio-group v-model="align" type="button">
        <sd-radio value="start">start</sd-radio>
        <sd-radio value="center">center</sd-radio>
        <sd-radio value="end">end</sd-radio>
        <sd-radio value="baseline">baseline</sd-radio>
      </sd-radio-group>
    </div>
    <sd-space :align="align" style="backgroundcolor: var(--color-fill-2); padding: 10px">
      <sd-typography-text>Space:</sd-typography-text>
      <sd-button type="primary">Item2</sd-button>
      <sd-card title="Card"> Card content </sd-card>
    </sd-space>
  </div>
</template>
<script>
  export default {
    data() {
      return {
        align: 'center',
      };
    },
  };
</script>
