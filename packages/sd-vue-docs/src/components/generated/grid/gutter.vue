<template>
  <div>
    <p>Horizontal</p>
    <sd-row class="grid-demo sd:text-white" :gutter="24">
      <sd-col :span="12">
        <div class="sd:bg-[#4096ff]">col - 12</div>
      </sd-col>
      <sd-col :span="12">
        <div class="sd:bg-[#0958d9]">col - 12</div>
      </sd-col>
    </sd-row>
    <p>Responsive</p>
    <sd-row class="grid-demo sd:text-white" :gutter="{ md: 8, lg: 24, xl: 32 }">
      <sd-col :span="6">
        <div class="sd:bg-[#4096ff]">col - 6</div>
      </sd-col>
      <sd-col :span="6">
        <div class="sd:bg-[#0958d9]">col - 6</div>
      </sd-col>
      <sd-col :span="6">
        <div class="sd:bg-[#4096ff]">col - 6</div>
      </sd-col>
      <sd-col :span="6">
        <div class="sd:bg-[#0958d9]">col - 6</div>
      </sd-col>
    </sd-row>
    <p>Horizontal and Vertical</p>
    <sd-row class="grid-demo sd:text-white" :gutter="[24, 12]">
      <sd-col :span="6">
        <div class="sd:bg-[#4096ff]">col - 6</div>
      </sd-col>
      <sd-col :span="6">
        <div class="sd:bg-[#0958d9]">col - 6</div>
      </sd-col>
      <sd-col :span="6">
        <div class="sd:bg-[#4096ff]">col - 6</div>
      </sd-col>
      <sd-col :span="6">
        <div class="sd:bg-[#0958d9]">col - 6</div>
      </sd-col>
      <sd-col :span="6">
        <div class="sd:bg-[#4096ff]">col - 6</div>
      </sd-col>
      <sd-col :span="6">
        <div class="sd:bg-[#0958d9]">col - 6</div>
      </sd-col>
      <sd-col :span="6">
        <div class="sd:bg-[#4096ff]">col - 6</div>
      </sd-col>
      <sd-col :span="6">
        <div class="sd:bg-[#0958d9]">col - 6</div>
      </sd-col>
    </sd-row>
  </div>
</template>

<style scoped>
  .grid-demo .sd-col {
    height: 48px;
  }

  .grid-demo .sd-col > div {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
  }
</style>
