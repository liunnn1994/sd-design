<template>
  <div>
    <div>
      <a-time-picker style="width: 194px">
        <template #prefix>
          <IconInfoCircle />
        </template> </a-time-picker
    ></div>
    <div>
      <a-time-picker type="time-range" style="width: 252px; margin-top: 20px">
        <template #prefix>
          <IconInfoCircle />
        </template>
      </a-time-picker>
    </div>
  </div>
</template>

<script>
  import { IconInfoCircle } from '@sdata/web-vue/es/icon/index.js';

  export default {
    components: { IconInfoCircle },
  };
</script>
