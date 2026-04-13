<template>
  <a-space direction="vertical" size="large">
    <a-input-number :style="{width:'320px'}" placeholder="Please enter something" allow-clear>
      <template #prefix>
        <icon-user />
      </template>
    </a-input-number>
    <a-input-number :style="{width:'320px'}" placeholder="Please enter something" allow-clear hide-button>
      <template #suffix>
        <icon-info-circle />
      </template>
    </a-input-number>
  </a-space>
</template>
