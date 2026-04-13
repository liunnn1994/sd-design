<template>
  <a-row :gutter="[40, 20]">
    <a-col :span="12">
      <a-alert>This is an info alert.</a-alert>
    </a-col>
    <a-col :span="12">
      <a-alert type="success">This is an success alert.</a-alert>
    </a-col>
    <a-col :span="12">
      <a-alert type="warning">This is an warning alert.</a-alert>
    </a-col>
    <a-col :span="12">
      <a-alert type="error">This is an error alert.</a-alert>
    </a-col>
    <a-col :span="12">
      <a-alert type="normal">
        <template #icon>
          <icon-exclamation-circle-fill />
        </template>
        This is an normal alert.
      </a-alert>
    </a-col>
  </a-row>
</template>

<script>
  import { IconExclamationCircleFill } from '@sdata/web-vue/es/icon';

  export default {
    components: { IconExclamationCircleFill },
  };
</script>
