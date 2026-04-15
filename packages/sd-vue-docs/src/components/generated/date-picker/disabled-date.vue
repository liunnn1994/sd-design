<template>
  <div>
    <sd-date-picker
      style="width: 200px; margin-right: 24px; margin-bottom: 24px"
      :disabledDate="(current) => dayjs(current).isBefore(dayjs())"
    />
    <sd-range-picker
      style="width: 360px; margin-right: 24px; margin-bottom: 24px"
      :disabledDate="(current) => dayjs(current).isBefore(dayjs())"
    />
    <sd-date-picker
      style="width: 200px; margin-right: 24px; margin-bottom: 24px"
      show-time
      :disabledDate="(current) => dayjs(current).isBefore(dayjs())"
      :disabledTime="getDisabledTime"
    />
    <sd-range-picker
      style="width: 360px; margin-bottom: 24px"
      show-time
      :timePickerProps="{ hideDisabledOptions: true }"
      :disabledDate="(current) => dayjs(current).isBefore(dayjs())"
      :disabledTime="getDisabledRangeTime"
    />
  </div>
</template>
<script>
  import dayjs from 'dayjs';

  function range(start, end) {
    const result = [];
    for (let i = start; i < end; i++) {
      result.push(i);
    }
    return result;
  }

  function getDisabledTime(date) {
    return {
      disabledHours: () => range(6, 24),
      disabledMinutes: () => range(30, 60),
      disabledSeconds: () => range(30, 60),
    };
  }

  function getDisabledRangeTime(date, type) {
    return {
      disabledHours: () => (type === 'start' ? range(0, 6) : range(6, 24)),
      disabledMinutes: () => (type === 'end' ? range(0, 30) : [31, 60]),
      disabledSeconds: () => range(30, 60),
    };
  }

  export default {
    setup() {
      return {
        dayjs,
        getDisabledTime,
        getDisabledRangeTime,
      };
    },
  };
</script>
