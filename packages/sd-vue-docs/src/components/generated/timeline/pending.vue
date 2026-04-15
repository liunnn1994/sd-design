<template>
  <sd-row align="center" :style="{ marginBottom: '24px' }">
    <sd-checkbox
      :checked="!!pendingProps.direction"
      @change="(v) => onChange({ direction: v ? 'horizontal' : '' })"
    >
      horizontal &nbsp; &nbsp;
    </sd-checkbox>
    <sd-checkbox :checked="!!pendingProps.reverse" @change="(v) => onChange({ reverse: v })">
      reverse &nbsp; &nbsp;
    </sd-checkbox>
    <sd-checkbox
      :checked="!!pendingProps.pending"
      @change="(v) => onChange({ pending: v ? 'This is a pending dot' : false })"
    >
      pending &nbsp; &nbsp;
    </sd-checkbox>

    <sd-checkbox
      :checked="!!pendingProps.hasPendingDot"
      @change="(v) => onChange({ hasPendingDot: v })"
    >
      custom pendingDot
    </sd-checkbox>
  </sd-row>
  <sd-timeline v-bind="pendingProps">
    <template v-if="pendingProps.hasPendingDot" #dot>
      <IconFire :style="{ color: '#e70a0a' }" />
    </template>
    <sd-timeline-item label="2017-03-10" dotColor="#52C419"> The first milestone </sd-timeline-item>
    <sd-timeline-item label="2018-05-12" dotColor="#F5222D">
      The second milestone
    </sd-timeline-item>
    <sd-timeline-item label="2020-09-30">The third milestone</sd-timeline-item>
  </sd-timeline>
</template>

<script>
  import { ref } from 'vue';

  import { IconFire } from '@sdata/web-vue/es/icon/index.js';

  export default {
    components: {
      IconFire,
    },
    setup() {
      const pendingProps = ref({});

      const onChange = (newProps) => {
        pendingProps.value = {
          ...pendingProps.value,
          ...newProps,
        };
      };

      return {
        pendingProps,
        onChange,
      };
    },
  };
</script>
