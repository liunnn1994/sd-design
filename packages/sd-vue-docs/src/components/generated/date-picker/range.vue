<template>
  <sd-range-picker @change="onChange" @select="onSelect" style="width: 254px; marginbottom: 20px" />
  <br />
  <sd-range-picker
    mode="week"
    @change="onChange"
    @select="onSelect"
    style="width: 254px; marginbottom: 20px"
  />
  <br />
  <sd-range-picker
    mode="month"
    @change="onChange"
    @select="onSelect"
    style="width: 254px; marginbottom: 20px"
  />
  <br />
  <sd-range-picker
    mode="year"
    @change="onChange"
    @select="onSelect"
    style="width: 254px; marginbottom: 20px"
  />
  <br />
  <sd-range-picker
    mode="quarter"
    @change="onChange"
    @select="onSelect"
    style="width: 254px; marginbottom: 20px"
  />
  <br />
  <sd-range-picker
    showTime
    :time-picker-props="{
      defaultValue: ['00:00:00', '00:00:00'],
    }"
    @change="onChange"
    @select="onSelect"
    style="width: 380px"
  />
</template>
<script>
  export default {
    setup() {
      return {
        onSelect(dateString, date) {
          console.log('onSelect', dateString, date);
        },
        onChange(dateString, date) {
          console.log('onChange: ', dateString, date);
        },
      };
    },
  };
</script>
