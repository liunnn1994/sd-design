<template>
  <sd-space direction="vertical" size="large">
    <sd-input :style="{ width: '320px' }" placeholder="Disabled status" disabled />
    <sd-input
      :style="{ width: '320px' }"
      default-value="Disabled"
      placeholder="Disabled status"
      disabled
    />
    <sd-input :style="{ width: '320px' }" placeholder="Error status" error />
  </sd-space>
</template>
