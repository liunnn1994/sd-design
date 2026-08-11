<template>
  <sd-row class="grid-demo sd:mb-4 sd:text-white">
    <sd-col flex="100px" class="sd:bg-[#4096ff]">
      <div>100px</div>
    </sd-col>
    <sd-col flex="auto" class="sd:bg-[#0958d9]">
      <div>auto</div>
    </sd-col>
  </sd-row>
  <sd-row class="grid-demo sd:mb-4 sd:text-white">
    <sd-col flex="100px" class="sd:bg-[#4096ff]">
      <div>100px</div>
    </sd-col>
    <sd-col flex="auto" class="sd:bg-[#0958d9]">
      <div>auto</div>
    </sd-col>
    <sd-col flex="100px" class="sd:bg-[#4096ff]">
      <div>100px</div>
    </sd-col>
  </sd-row>
  <sd-row class="grid-demo sd:mb-4 sd:text-white">
    <sd-col :flex="3" class="sd:bg-[#4096ff]">
      <div>3 / 12</div>
    </sd-col>
    <sd-col :flex="4" class="sd:bg-[#0958d9]">
      <div>4 / 12</div>
    </sd-col>
    <sd-col :flex="5" class="sd:bg-[#4096ff]">
      <div>5 / 12</div>
    </sd-col>
  </sd-row>
</template>

<style scoped>
  .grid-demo .sd-col {
    height: 48px;
    line-height: 48px;
    text-align: center;
  }
</style>
