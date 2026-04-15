<template>
  <sd-space direction="vertical" size="large">
    <sd-input :style="{ width: '320px' }" placeholder="Please enter something" allow-clear>
      <template #prefix>
        <icon-user />
      </template>
    </sd-input>
    <sd-input :style="{ width: '320px' }" placeholder="Please enter something" allow-clear>
      <template #suffix>
        <icon-info-circle />
      </template>
    </sd-input>
  </sd-space>
</template>
