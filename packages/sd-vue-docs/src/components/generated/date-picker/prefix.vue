<template>
  <div>
    <div>
      <a-date-picker style="width: 300px">
        <template #prefix>
          <IconInfoCircle />
        </template>
      </a-date-picker>
    </div>
    <a-range-picker
      showTime
      :defaultValue="['2019-08-08 00:00:00', '2019-08-18 00:00:00']"
      @select="onSelect"
      @change="onChange"
      :style="{ width: '400px', marginTop: '20px' }"
    >
      <template #prefix>
        <IconInfoCircle />
      </template>
    </a-range-picker>
  </div>
</template>

<script>
  import { IconInfoCircle } from '@sdata/web-vue/es/icon/index.js';

  export default {
    components: { IconInfoCircle },
  };
</script>
