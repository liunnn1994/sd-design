<template>
  <a-space direction="vertical" size="large" fill>
    <a-input
      :style="{ width: '320px' }"
      placeholder="Please enter something"
      :max-length="10"
      allow-clear
      show-word-limit
    />
    <a-input
      :style="{ width: '320px' }"
      placeholder="Please enter something"
      :max-length="{ length: 10, errorOnly: true }"
      allow-clear
      show-word-limit
    />
  </a-space>
</template>
