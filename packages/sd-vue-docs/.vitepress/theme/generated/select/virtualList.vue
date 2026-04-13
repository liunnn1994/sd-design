<template>
  <a-select
    :style="{ width: '320px' }"
    :options="options"
    placeholder="Please select ..."
    :virtual-list-props="{ height: 200 }"
  />
</template>

<script>
  export default {
    setup() {
      const options = Array(1000)
        .fill(null)
        .map((_, index) => `Option ${index}`);

      return {
        options,
      };
    },
  };
</script>
