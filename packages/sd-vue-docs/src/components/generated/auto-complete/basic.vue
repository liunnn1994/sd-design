<template>
  <sd-auto-complete
    :data="data"
    @search="handleSearch"
    :style="{ width: '360px' }"
    placeholder="please enter something"
  />
</template>

<script>
  export default {
    data() {
      return {
        data: [],
      };
    },
    methods: {
      handleSearch(value) {
        if (value) {
          this.data = [...Array(5)].map((_, index) => `${value}-${index}`);
          console.log(this.data);
        } else {
          this.data = [];
        }
      },
    },
  };
</script>
