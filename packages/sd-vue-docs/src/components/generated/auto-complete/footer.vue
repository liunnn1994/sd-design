<template>
  <a-auto-complete
    :data="data"
    @search="handleSearch"
    :style="{ width: '360px' }"
    placeholder="please enter something"
  >
    <template #footer>
      <div style="padding: 6px 0; text-align: center;">
        <a-button>Click Me</a-button>
      </div>
    </template>
  </a-auto-complete>
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
