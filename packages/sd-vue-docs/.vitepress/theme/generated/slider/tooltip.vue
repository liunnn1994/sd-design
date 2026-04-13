<template>
  <a-slider :min="0" :max="50" :style="{ width: '200px' }" :format-tooltip="formatter" />
</template>

<script>
  export default {
    setup() {
      const formatter = (value) => {
        return `${Math.round((value / 50) * 100)}%`;
      };

      return {
        formatter,
      };
    },
  };
</script>
