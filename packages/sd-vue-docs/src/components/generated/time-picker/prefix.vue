<template>
  <div>
    <div>
      <sd-time-picker style="width: 194px">
        <template #prefix>
          <IconInfoCircle />
        </template> </sd-time-picker
    ></div>
    <div>
      <sd-time-picker type="time-range" style="width: 252px; margin-top: 20px">
        <template #prefix>
          <IconInfoCircle />
        </template>
      </sd-time-picker>
    </div>
  </div>
</template>

<script>
  import { IconInfoCircle } from '@sdata/web-vue/es/icon/index.js';

  export default {
    components: { IconInfoCircle },
  };
</script>
