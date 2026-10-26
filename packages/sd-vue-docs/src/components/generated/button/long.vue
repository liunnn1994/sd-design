<template>
  <sd-space class="wrapper" direction="vertical">
    <sd-button type="primary" long>主要</sd-button>
    <sd-button long>默认</sd-button>
    <sd-button type="dashed" long>虚线</sd-button>
    <sd-button type="outline" long>描边</sd-button>
    <sd-button type="text" long>文本</sd-button>
  </sd-space>
</template>

<style scoped lang="scss">
  .wrapper {
    width: 400px;
    padding: 20px;
    border: 1px solid var(--color-border);
    border-radius: 4px;
  }
</style>
