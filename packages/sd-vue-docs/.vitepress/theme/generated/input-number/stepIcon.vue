<template>
  <a-space direction="vertical" size="large">
    <a-input-number :style="{ width: '320px' }" placeholder="Please enter something" allow-clear>
      <template #plus>
        <icon-plus />
      </template>
      <template #minus>
        <icon-minus />
      </template>
    </a-input-number>
  </a-space>
</template>
