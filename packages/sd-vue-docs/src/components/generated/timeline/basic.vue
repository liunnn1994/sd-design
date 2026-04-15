<template>
  <div :style="{ marginBottom: '40px' }">
    <sd-typography-text :style="{ verticalAlign: 'middle', marginRight: '8px' }">
      Reverse
    </sd-typography-text>
    <sd-radio-group @change="onChange" style="{ marginBottom: '30px' }" :modelValue="isReverse">
      <sd-radio :value="false">No Reverse</sd-radio>
      <sd-radio :value="true">Reverse</sd-radio>
    </sd-radio-group>
  </div>
  <sd-timeline :reverse="isReverse">
    <sd-timeline-item label="2017-03-10">The first milestone</sd-timeline-item>
    <sd-timeline-item label="2018-05-12">The second milestone</sd-timeline-item>
    <sd-timeline-item label="2020-09-30">The third milestone</sd-timeline-item>
  </sd-timeline>
</template>

<script>
  import { ref } from 'vue';

  export default {
    setup() {
      const isReverse = ref(false);

      const onChange = (bool) => {
        isReverse.value = bool;
      };

      return {
        isReverse,
        onChange,
      };
    },
  };
</script>
