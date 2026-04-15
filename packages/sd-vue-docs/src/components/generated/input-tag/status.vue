<template>
  <sd-space direction="vertical" size="large">
    <sd-input-tag
      :default-value="['test']"
      :style="{ width: '320px' }"
      placeholder="Please Enter"
      disabled
    />
    <sd-input-tag
      :default-value="['test']"
      :style="{ width: '320px' }"
      placeholder="Please Enter"
      readonly
    />
    <sd-input-tag
      :default-value="['test']"
      :style="{ width: '320px' }"
      placeholder="Please Enter"
      error
    />
  </sd-space>
</template>
