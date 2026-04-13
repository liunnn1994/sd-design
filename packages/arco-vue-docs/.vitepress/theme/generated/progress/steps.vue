<template>
  <div :style="{ width: '50%' }">
    <a-progress :steps="3" :percent="0.3" />
    <a-progress :steps="5" status="warning" :percent="1" />
    <a-progress :steps="3" size="small" :percent="0.3" />
  </div>
</template>
