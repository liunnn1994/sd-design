<template>
  <sd-space direction="vertical" size="large">
    <sd-slider :default-value="10" :style="{ width: '300px' }" show-input />
    <sd-slider :default-value="[10, 20]" :style="{ width: '380px' }" range show-input />
  </sd-space>
</template>
