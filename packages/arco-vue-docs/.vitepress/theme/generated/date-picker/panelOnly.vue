<template>
  <div>
    <a-date-picker
      default-value="2019-06-03"
      v-model:pickerValue="pickerValue"
      hide-trigger
      style="width: 268px;"
    />
    <a-range-picker
      :default-value="['2019-08-01', '2020-06-01']"
      v-model:pickerValue="rangePickerValue"
      hide-trigger
      style="width: 560px; margin-top: 20px;"
    />
  </div>
</template>
<script>
export default {
  data() {
    return {
      pickerValue: null,
      rangePickerValue: null,
    };
  }
};
</script>
