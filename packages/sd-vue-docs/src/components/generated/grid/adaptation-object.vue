<template>
  <div>
    <sd-row class="grid-demo sd:text-white">
      <sd-col :xs="{ span: 5, offset: 1 }" :lg="{ span: 6, offset: 2 }" class="sd:bg-[#4096ff]">
        Col
      </sd-col>
      <sd-col :xs="{ span: 11, offset: 1 }" :lg="{ span: 6, offset: 2 }" class="sd:bg-[#0958d9]">
        Col
      </sd-col>
      <sd-col :xs="{ span: 5, offset: 1 }" :lg="{ span: 6, offset: 2 }" class="sd:bg-[#4096ff]">
        Col
      </sd-col>
    </sd-row>
  </div>
</template>

<style scoped>
  .grid-demo .sd-col {
    height: 48px;
    line-height: 48px;
    text-align: center;
  }
</style>
