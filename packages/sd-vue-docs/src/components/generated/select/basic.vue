<template>
  <sd-space direction="vertical" size="large">
    <sd-select :style="{ width: '320px' }" placeholder="Please select ...">
      <sd-option>Beijing</sd-option>
      <sd-option>Shanghai</sd-option>
      <sd-option>Guangzhou</sd-option>
      <sd-option disabled>Disabled</sd-option>
    </sd-select>
    <sd-select :style="{ width: '320px' }" placeholder="Please select ...">
      <sd-option :value="true">是</sd-option>
      <sd-option :value="false">否</sd-option>
    </sd-select>
    <sd-select
      defaultValue="Beijing"
      :style="{ width: '320px' }"
      placeholder="Please select ..."
      disabled
    >
      <sd-option>Beijing</sd-option>
      <sd-option>Shanghai</sd-option>
      <sd-option>Guangzhou</sd-option>
      <sd-option disabled>Disabled</sd-option>
    </sd-select>
    <sd-select v-model="value" :style="{ width: '320px' }" placeholder="Please select ...">
      <sd-option v-for="item of data" :value="item" :label="item.label" />
    </sd-select>
    <div>Select Value: {{ value }}</div>
    <sd-select
      :style="{ width: '160px' }"
      placeholder="Select"
      :trigger-props="{ autoFitPopupMinWidth: true }"
    >
      <sd-option>Beijing-Beijing-Beijing</sd-option>
      <sd-option>Shanghai</sd-option>
      <sd-option>Guangzhou</sd-option>
      <sd-option disabled>Disabled</sd-option>
    </sd-select>
  </sd-space>
</template>

<script>
  import { ref } from 'vue';

  export default {
    setup() {
      const value = ref();
      const data = [
        {
          value: 'beijing',
          label: 'Beijing',
          other: 'extra',
        },
        {
          value: 'shanghai',
          label: 'Shanghai',
          other: 'extra',
        },
        {
          value: 'guangzhou',
          label: 'Guangzhou',
          other: 'extra',
        },
        {
          value: 'chengdu',
          label: 'Chengdu',
          other: 'extra',
        },
      ];

      return {
        value,
        data,
      };
    },
  };
</script>
