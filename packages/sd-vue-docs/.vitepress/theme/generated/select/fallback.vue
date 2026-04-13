<template>
  <a-space direction="vertical" size="large">
    <a-select
      defaultValue="Shanxi"
      :style="{ width: '320px' }"
      placeholder="Please select ..."
      :fallback-option="fallback"
    >
      <a-option>Beijing</a-option>
      <a-option>Shanghai</a-option>
      <a-option>Guangzhou</a-option>
      <a-option disabled>Disabled</a-option>
    </a-select>
    <a-select
      defaultValue="Shanxi"
      :style="{ width: '320px' }"
      placeholder="Please select ..."
      :fallback-option="fallback"
      :show-extra-options="false"
    >
      <a-option>Beijing</a-option>
      <a-option>Shanghai</a-option>
      <a-option>Guangzhou</a-option>
      <a-option disabled>Disabled</a-option>
    </a-select>
    <a-select
      :default-value="['Shanxi', 'Nanjing', 'Hangzhou']"
      :style="{ width: '320px' }"
      placeholder="Please select ..."
      multiple
      :fallback-option="fallback"
    >
      <a-option>Beijing</a-option>
      <a-option>Shanghai</a-option>
      <a-option>Guangzhou</a-option>
      <a-option disabled>Disabled</a-option>
      <a-option>Shenzhen</a-option>
      <a-option>Chengdu</a-option>
      <a-option>Wuhan</a-option>
    </a-select>
  </a-space>
</template>

<script>
  export default {
    setup() {
      const fallback = (value) => {
        return {
          value,
          label: `++${value}++`,
        };
      };
      return {
        fallback,
      };
    },
  };
</script>
