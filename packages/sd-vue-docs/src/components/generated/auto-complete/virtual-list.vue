<template>
  <sd-auto-complete
    :data="data"
    @search="handleSearch"
    :style="{ width: '360px' }"
    placeholder="please enter something"
    :virtual-list-props="{ height: 200, threshold: 20 }"
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
          this.data = [...Array(5000)].map((_, index) => `${value}-${index}`);
        } else {
          this.data = [];
        }
      },
    },
  };
</script>
