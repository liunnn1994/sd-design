<template>
  <sd-space direction="vertical" size="large">
    <sd-input-number
      v-model="value"
      :style="{ width: '320px' }"
      placeholder="Please Enter"
      class="input-demo"
      :min="10"
      :max="100"
    />
    <sd-input-number
      :style="{ width: '320px' }"
      placeholder="Please Enter"
      class="input-demo"
      :min="10"
      :max="100"
    />
    <sd-input-number
      :style="{ width: '320px' }"
      placeholder="Please Enter"
      :default-value="500"
      class="input-demo"
      disabled
    />
  </sd-space>
</template>

<script>
  export default {
    data() {
      return {
        value: 15,
      };
    },
  };
</script>
