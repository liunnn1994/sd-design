<template>
  <div>
    <sd-row class="grid-demo sd:text-white">
      <sd-col :span="6" :order="4" class="sd:bg-[#4096ff]">
        <div>1 col-order-4</div>
      </sd-col>
      <sd-col :span="6" :order="3" class="sd:bg-[#0958d9]">
        <div>2 col-order-3</div>
      </sd-col>
      <sd-col :span="6" :order="2" class="sd:bg-[#4096ff]">
        <div>3 col-order-2</div>
      </sd-col>
      <sd-col :span="6" :order="1" class="sd:bg-[#0958d9]">
        <div>4 col-order-1</div>
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
