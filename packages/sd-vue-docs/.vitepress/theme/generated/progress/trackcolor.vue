<template>
  <div :style="{ width: '50%' }">
    <a-progress
      :percent="0.4"
      trackColor="var(--color-primary-light-1)"
      style="margin-bottom: 20px"
    />
    <a-progress
      :percent="0.4"
      :steps="4"
      trackColor="var(--color-primary-light-1)"
      style="margin-bottom: 20px"
    />
    <a-progress
      :percent="0.4"
      type="circle"
      trackColor="var(--color-primary-light-1)"
      style="margin-bottom: 20px"
    />
  </div>
</template>
