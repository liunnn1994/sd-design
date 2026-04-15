<template>
  <div :style="{ width: '50%' }">
    <sd-progress
      :percent="0.4"
      trackColor="var(--color-primary-light-1)"
      style="margin-bottom: 20px"
    />
    <sd-progress
      :percent="0.4"
      :steps="4"
      trackColor="var(--color-primary-light-1)"
      style="margin-bottom: 20px"
    />
    <sd-progress
      :percent="0.4"
      type="circle"
      trackColor="var(--color-primary-light-1)"
      style="margin-bottom: 20px"
    />
  </div>
</template>
