<template>
  <a-space direction="vertical" size="large">
    <a-input-number
      :style="{ width: '320px' }"
      placeholder="Please Enter"
      :default-value="3.6"
      :step="1.2"
      :precision="2"
      class="input-demo"
    />
    <a-input-number
      :style="{ width: '320px' }"
      placeholder="Please Enter"
      :default-value="1.22"
      :step="1.22"
      :precision="1"
      class="input-demo"
    />
  </a-space>
</template>
