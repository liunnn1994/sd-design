<template>
  <a-space :size="40">
    <a-badge :count="2" />
    <a-badge
      :count="2"
      :dotStyle="{ background: '#E5E6EB', color: '#86909C' }"
    />
    <a-badge :count="16" />
    <a-badge :count="1000" :max-count="99" />
  </a-space>
</template>
