<template>
  <div style="margin-bottom: 10px">
    <sd-switch v-model="scrollbar" />
    Virtual Scrollbar
  </div>
  <sd-space direction="vertical" size="large">
    <sd-select
      :default-value="['Beijing', 'Shanghai']"
      :style="{ width: '360px' }"
      placeholder="Please select ..."
      multiple
      :scrollbar="scrollbar"
    >
      <sd-option>Beijing</sd-option>
      <sd-option :tag-props="{ color: 'red' }">Shanghai</sd-option>
      <sd-option>Guangzhou</sd-option>
      <sd-option disabled>Disabled</sd-option>
      <sd-option>Shenzhen</sd-option>
      <sd-option>Wuhan</sd-option>
    </sd-select>
    <sd-select
      :default-value="['Beijing', 'Shanghai', 'Guangzhou']"
      :style="{ width: '360px' }"
      placeholder="Please select ..."
      multiple
      :max-tag-count="2"
      allow-clear
      :scrollbar="scrollbar"
    >
      <sd-option>Beijing</sd-option>
      <sd-option>Shanghai</sd-option>
      <sd-option>Guangzhou</sd-option>
      <sd-option disabled>Disabled</sd-option>
      <sd-option>Shenzhen</sd-option>
      <sd-option>Chengdu</sd-option>
      <sd-option>Wuhan</sd-option>
    </sd-select>
    <sd-select
      :default-value="['Beijing', 'Shanghai']"
      :style="{ width: '360px' }"
      placeholder="Please select ..."
      multiple
      :limit="2"
      :scrollbar="scrollbar"
    >
      <sd-option>Beijing</sd-option>
      <sd-option :tag-props="{ color: 'red' }">Shanghai</sd-option>
      <sd-option>Guangzhou</sd-option>
      <sd-option disabled>Disabled</sd-option>
      <sd-option>Shenzhen</sd-option>
      <sd-option>Wuhan</sd-option>
    </sd-select>
  </sd-space>
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
