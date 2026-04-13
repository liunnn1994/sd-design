<template>
  <a-space direction="vertical" size="large">
    <a-checkbox-group :default-value="['1']">
      <a-checkbox value="1">Option 1</a-checkbox>
      <a-checkbox value="2">Option 2</a-checkbox>
      <a-checkbox value="3">Option 3</a-checkbox>
    </a-checkbox-group>
    <a-checkbox-group direction="vertical">
      <a-checkbox value="1">Option 1</a-checkbox>
      <a-checkbox value="2">Option 2</a-checkbox>
      <a-checkbox value="3">Option 3</a-checkbox>
    </a-checkbox-group>
  </a-space>
</template>
