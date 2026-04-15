<template>
  <sd-space direction="vertical" size="large" fill>
    <sd-textarea
      placeholder="Please enter something"
      :max-length="10"
      allow-clear
      show-word-limit
    />
    <sd-textarea
      placeholder="Please enter something"
      :max-length="{ length: 10, errorOnly: true }"
      allow-clear
      show-word-limit
    />
  </sd-space>
</template>
