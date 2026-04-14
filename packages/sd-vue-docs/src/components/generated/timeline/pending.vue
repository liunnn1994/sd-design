<template>
  <a-row align="center" :style="{ marginBottom: '24px' }">
    <a-checkbox
      :checked="!!pendingProps.direction"
      @change="(v) => onChange({ direction: v ? 'horizontal' : '' })"
    >
      horizontal &nbsp; &nbsp;
    </a-checkbox>
    <a-checkbox :checked="!!pendingProps.reverse" @change="(v) => onChange({ reverse: v })">
      reverse &nbsp; &nbsp;
    </a-checkbox>
    <a-checkbox
      :checked="!!pendingProps.pending"
      @change="(v) => onChange({ pending: v ? 'This is a pending dot' : false })"
    >
      pending &nbsp; &nbsp;
    </a-checkbox>

    <a-checkbox
      :checked="!!pendingProps.hasPendingDot"
      @change="(v) => onChange({ hasPendingDot: v })"
    >
      custom pendingDot
    </a-checkbox>
  </a-row>
  <a-timeline v-bind="pendingProps">
    <template v-if="pendingProps.hasPendingDot" #dot>
      <IconFire :style="{ color: '#e70a0a' }" />
    </template>
    <a-timeline-item label="2017-03-10" dotColor="#52C419"> The first milestone </a-timeline-item>
    <a-timeline-item label="2018-05-12" dotColor="#F5222D"> The second milestone </a-timeline-item>
    <a-timeline-item label="2020-09-30">The third milestone</a-timeline-item>
  </a-timeline>
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
