<template>
  <a-space align="start">
    <a-slider
      :default-value="50"
      direction="vertical"
    />

    <a-slider
      direction="vertical"
      :default-value="5"
      :style="{ width: '300px' }"
      :max="15"
      :marks="{
        5: '5km',
        10: '10km',
      }"
    />
  </a-space>
</template>
