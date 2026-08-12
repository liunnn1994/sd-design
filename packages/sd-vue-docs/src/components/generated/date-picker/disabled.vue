<template>
  <div class="sd:w-50 sd:mb-5">
    <sd-date-picker defaultValue="2020-08-08" disabled />
  </div>
  <div class="sd:w-75 sd:mb-5">
    <sd-range-picker :defaultValue="['2020-08-08', '2020-08-18']" disabled />
  </div>
  <div class="sd:mb-5 sd:w-75">
    <sd-range-picker
      :defaultValue="['2020-08-08']"
      :disabled="[true, false]"
      :disabledDate="disableBeforePresetDate"
    />
  </div>
  <div class="sd:w-95">
    <sd-range-picker showTime :defaultValue="['2020-08-08 02:02:02']" :disabled="[true, false]" />
  </div>
</template>
<script setup lang="ts">
  import type { DisabledDate } from '@sdata/web-vue';

  import dayjs from 'dayjs';

  const disableBeforePresetDate: DisabledDate = (current) =>
    dayjs(current).isBefore(dayjs('2020-08-08'));
</script>
