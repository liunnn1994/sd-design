<template>
  <div>
    <sd-row class="grid-demo sd:mb-4 sd:bg-[var(--color-fill-2)] sd:text-white">
      <sd-col :span="8" class="sd:bg-[#4096ff]">col - 8</sd-col>
      <sd-col :span="8" :offset="8" class="sd:bg-[#0958d9]"> col - 8 | offset - 8 </sd-col>
    </sd-row>
    <sd-row class="grid-demo sd:mb-4 sd:bg-[var(--color-fill-2)] sd:text-white">
      <sd-col :span="6" :offset="8" class="sd:bg-[#4096ff]"> col - 6 | offset - 8 </sd-col>
      <sd-col :span="6" :offset="4" class="sd:bg-[#0958d9]"> col - 6 | offset - 4 </sd-col>
    </sd-row>
    <sd-row class="grid-demo sd:bg-[var(--color-fill-2)] sd:text-white">
      <sd-col :span="12" :offset="8" class="sd:bg-[#4096ff]"> col - 12 | offset - 8 </sd-col>
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
