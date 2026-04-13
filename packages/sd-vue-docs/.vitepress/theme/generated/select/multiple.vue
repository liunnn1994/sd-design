<template>
  <div style="margin-bottom: 10px">
    <a-switch v-model="scrollbar" />
    Virtual Scrollbar
  </div>
  <a-space direction="vertical" size="large">
    <a-select
      :default-value="['Beijing', 'Shanghai']"
      :style="{ width: '360px' }"
      placeholder="Please select ..."
      multiple
      :scrollbar="scrollbar"
    >
      <a-option>Beijing</a-option>
      <a-option :tag-props="{ color: 'red' }">Shanghai</a-option>
      <a-option>Guangzhou</a-option>
      <a-option disabled>Disabled</a-option>
      <a-option>Shenzhen</a-option>
      <a-option>Wuhan</a-option>
    </a-select>
    <a-select
      :default-value="['Beijing', 'Shanghai', 'Guangzhou']"
      :style="{ width: '360px' }"
      placeholder="Please select ..."
      multiple
      :max-tag-count="2"
      allow-clear
      :scrollbar="scrollbar"
    >
      <a-option>Beijing</a-option>
      <a-option>Shanghai</a-option>
      <a-option>Guangzhou</a-option>
      <a-option disabled>Disabled</a-option>
      <a-option>Shenzhen</a-option>
      <a-option>Chengdu</a-option>
      <a-option>Wuhan</a-option>
    </a-select>
    <a-select
      :default-value="['Beijing', 'Shanghai']"
      :style="{ width: '360px' }"
      placeholder="Please select ..."
      multiple
      :limit="2"
      :scrollbar="scrollbar"
    >
      <a-option>Beijing</a-option>
      <a-option :tag-props="{ color: 'red' }">Shanghai</a-option>
      <a-option>Guangzhou</a-option>
      <a-option disabled>Disabled</a-option>
      <a-option>Shenzhen</a-option>
      <a-option>Wuhan</a-option>
    </a-select>
  </a-space>
</template>

<script>
  import { ref } from 'vue';

  export default {
    setup() {
      const scrollbar = ref(true);

      return {
        scrollbar,
      };
    },
  };
</script>
