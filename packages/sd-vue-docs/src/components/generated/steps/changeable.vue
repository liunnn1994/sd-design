<template>
  <div>
    <sd-steps changeable :current="current" @change="setCurrent">
      <sd-step description="This is a description">Succeeded</sd-step>
      <sd-step description="This is a description">Processing</sd-step>
      <sd-step description="This is a description">Pending</sd-step>
    </sd-steps>
    <div
      :style="{
        width: '100%',
        height: '200px',
        textAlign: 'center',
        background: 'var(--color-bg-2)',
        color: '#C2C7CC',
      }"
    >
      <div style="line-height: 160px">Step{{ current }} Content</div>
      <sd-space size="large">
        <sd-button type="secondary" :disabled="current <= 1" @click="onPrev">
          <IconLeft /> Back
        </sd-button>
        <sd-button type="primary" :disabled="current >= 3" @click="onNext">
          Next <IconRight />
        </sd-button>
      </sd-space>
    </div>
  </div>
</template>
<script>
  export default {
    data() {
      return {
        current: 1,
      };
    },
    methods: {
      onPrev() {
        this.current = Math.max(1, this.current - 1);
      },

      onNext() {
        this.current = Math.min(3, this.current + 1);
      },

      setCurrent(current) {
        this.current = current;
      },
    },
  };
</script>
