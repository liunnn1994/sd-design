<template>
  <a-date-picker>
    <template #cell="{ date }">
      <div class="sd-picker-date">
        <div class="sd-picker-date-value" :style="getCellStyle(date)">
          {{ date.getDate() }}
        </div>
      </div>
    </template>
  </a-date-picker>
</template>
<script>
  export default {
    setup() {
      const highlightDates = [6, 14, 22];
      const highlightStyle = {
        border: '1px solid rgb(var(--sdblue-6))',
      };
      return {
        getCellStyle(date) {
          return highlightDates.includes(date.getDate()) ? highlightStyle : {};
        },
      };
    },
  };
</script>
