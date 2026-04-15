<template>
  <sd-space direction="vertical" size="large">
    <sd-input-number :style="{ width: '320px' }" placeholder="Please enter something" allow-clear>
      <template #prefix>
        <icon-user />
      </template>
    </sd-input-number>
    <sd-input-number
      :style="{ width: '320px' }"
      placeholder="Please enter something"
      allow-clear
      hide-button
    >
      <template #suffix>
        <icon-info-circle />
      </template>
    </sd-input-number>
  </sd-space>
</template>
