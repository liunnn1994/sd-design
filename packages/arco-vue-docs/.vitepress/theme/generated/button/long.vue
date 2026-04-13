<template>
  <a-space class="wrapper" direction="vertical">
    <a-button type="primary" long>Primary</a-button>
    <a-button long>Default</a-button>
    <a-button type="dashed" long>Dashed</a-button>
    <a-button type="outline" long>Outline</a-button>
    <a-button type="text" long>Text</a-button>
  </a-space>
</template>

<style scoped lang="less">
.wrapper{
  width: 400px;
  padding: 20px;
  border: 1px solid var(~'--color-border');
  border-radius: 4px;
}
</style>
