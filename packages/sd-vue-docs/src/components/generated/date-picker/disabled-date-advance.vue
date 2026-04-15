<template>
  <sd-range-picker
    style="width: 300px"
    @select="onSelect"
    @popupVisibleChange="onPopupVisibleChange"
    :disabledDate="disabledDate"
  />
</template>
<script>
  export default {
    data() {
      return {
        dates: [],
      };
    },
    methods: {
      onSelect(valueString, value) {
        this.dates = value;
      },
      onPopupVisibleChange(visible) {
        if (!visible) {
          this.dates = [];
        }
      },
      disabledDate(current) {
        const dates = this.dates;
        if (dates && dates.length) {
          const tooLate =
            dates[0] && Math.abs((new Date(current) - dates[0]) / (24 * 60 * 60 * 1000)) > 7;
          const tooEarly =
            dates[1] && Math.abs((new Date(current) - dates[1]) / (24 * 60 * 60 * 1000)) > 7;
          return tooEarly || tooLate;
        }
        return false;
      },
    },
  };
</script>
