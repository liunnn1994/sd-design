<template>
  <a-space direction="vertical" size="large">
    <a-input :style="{ width: '320px' }" placeholder="Please enter something" allow-clear>
      <template #prefix>
        <icon-user />
      </template>
    </a-input>
    <a-input :style="{ width: '320px' }" placeholder="Please enter something" allow-clear>
      <template #suffix>
        <icon-info-circle />
      </template>
    </a-input>
  </a-space>
</template>
