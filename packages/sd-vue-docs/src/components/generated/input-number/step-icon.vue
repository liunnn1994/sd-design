<template>
  <sd-space direction="vertical" size="large">
    <sd-input-number :style="{ width: '320px' }" placeholder="Please enter something" allow-clear>
      <template #plus>
        <icon-plus />
      </template>
      <template #minus>
        <icon-minus />
      </template>
    </sd-input-number>
  </sd-space>
</template>
