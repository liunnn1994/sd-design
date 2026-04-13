<template>
  <a-space direction="vertical" size="large">
    <a-slider :default-value="10" :style="{ width: '300px' }" show-input />
    <a-slider :default-value="[10,20]" :style="{ width: '380px' }" range show-input />
  </a-space>
</template>
