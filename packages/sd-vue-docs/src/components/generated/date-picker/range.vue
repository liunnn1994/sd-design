<template>
  <div class="sd:w-63.5 sd:mb-5">
    <sd-range-picker @change="onChange" @select="onSelect" />
  </div>
  <div class="sd:w-63.5 sd:mb-5">
    <sd-range-picker mode="week" @change="onChange" @select="onSelect" />
  </div>
  <div class="sd:w-63.5 sd:mb-5">
    <sd-range-picker mode="month" @change="onChange" @select="onSelect" />
  </div>
  <div class="sd:w-63.5 sd:mb-5">
    <sd-range-picker mode="year" @change="onChange" @select="onSelect" />
  </div>
  <div class="sd:w-63.5 sd:mb-5">
    <sd-range-picker mode="quarter" @change="onChange" @select="onSelect" />
  </div>
  <div class="sd:w-95">
    <sd-range-picker
      showTime
      :time-picker-props="{
        defaultValue: ['00:00:00', '00:00:00'],
      }"
      @change="onChange"
      @select="onSelect"
    />
  </div>
</template>
<script setup lang="ts">
  function onSelect(dateString: unknown, date: unknown) {
    console.log('onSelect', dateString, date);
  }

  function onChange(dateString: unknown, date: unknown) {
    console.log('onChange: ', dateString, date);
  }
</script>
