<template>
  <div>
    <p>Arrange top</p>
    <sd-row class="grid-demo sd:text-white" align="start">
      <sd-col :span="6" class="sd:bg-[#4096ff]">
        <div>col - 6</div>
      </sd-col>
      <sd-col :span="6" class="sd:bg-[#0958d9]">
        <div>col - 6</div>
      </sd-col>
      <sd-col :span="6" class="sd:bg-[#4096ff]">
        <div>col - 6</div>
      </sd-col>
      <sd-col :span="6" class="sd:bg-[#0958d9]">
        <div>col - 6</div>
      </sd-col>
    </sd-row>
    <p>Arrange center</p>
    <sd-row class="grid-demo sd:text-white" align="center">
      <sd-col :span="6" class="sd:bg-[#4096ff]">
        <div>col - 6</div>
      </sd-col>
      <sd-col :span="6" class="sd:bg-[#0958d9]">
        <div>col - 6</div>
      </sd-col>
      <sd-col :span="6" class="sd:bg-[#4096ff]">
        <div>col - 6</div>
      </sd-col>
      <sd-col :span="6" class="sd:bg-[#0958d9]">
        <div>col - 6</div>
      </sd-col>
    </sd-row>
    <p>Arrange bottom</p>
    <sd-row class="grid-demo sd:text-white" align="end">
      <sd-col :span="6" class="sd:bg-[#4096ff]">
        <div>col - 6</div>
      </sd-col>
      <sd-col :span="6" class="sd:bg-[#0958d9]">
        <div>col - 6</div>
      </sd-col>
      <sd-col :span="6" class="sd:bg-[#4096ff]">
        <div>col - 6</div>
      </sd-col>
      <sd-col :span="6" class="sd:bg-[#0958d9]">
        <div>col - 6</div>
      </sd-col>
    </sd-row>
  </div>
</template>

<style scoped>
  .grid-demo {
    margin-bottom: 40px;
    background-color: var(--color-fill-2);
  }

  .grid-demo:last-child {
    margin-bottom: 0;
  }

  .grid-demo .sd-col {
    height: 48px;
    line-height: 48px;
    text-align: center;
  }

  .grid-demo .sd-col:nth-of-type(1) {
    height: 90px;
    line-height: 90px;
  }

  .grid-demo .sd-col:nth-of-type(2) {
    height: 48px;
    line-height: 48px;
  }

  .grid-demo .sd-col:nth-of-type(3) {
    height: 120px;
    line-height: 120px;
  }

  .grid-demo .sd-col:nth-of-type(4) {
    height: 60px;
    line-height: 60px;
  }
</style>
