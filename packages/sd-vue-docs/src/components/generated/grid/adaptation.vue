<template>
  <sd-row class="grid-demo sd:text-white">
    <sd-col :xs="2" :sm="4" :md="6" :lg="8" :xl="10" :xxl="8" class="sd:bg-[#4096ff]"> Col </sd-col>
    <sd-col :xs="20" :sm="16" :md="12" :lg="8" :xl="4" :xxl="8" class="sd:bg-[#0958d9]">
      Col
    </sd-col>
    <sd-col :xs="2" :sm="4" :md="6" :lg="8" :xl="10" :xxl="8" class="sd:bg-[#4096ff]"> Col </sd-col>
  </sd-row>
</template>

<style scoped>
  .grid-demo .sd-col {
    height: 48px;
    line-height: 48px;
    text-align: center;
  }
</style>
