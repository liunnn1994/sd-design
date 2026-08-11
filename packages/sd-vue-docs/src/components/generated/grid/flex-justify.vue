<template>
  <div>
    <p>Arrange left</p>
    <sd-row class="grid-demo sd:text-white" justify="start">
      <sd-col :span="4" class="sd:bg-[#4096ff]">
        <div>col - 4</div>
      </sd-col>
      <sd-col :span="4" class="sd:bg-[#0958d9]">
        <div>col - 4</div>
      </sd-col>
      <sd-col :span="4" class="sd:bg-[#4096ff]">
        <div>col - 4</div>
      </sd-col>
      <sd-col :span="4" class="sd:bg-[#0958d9]">
        <div>col - 4</div>
      </sd-col>
    </sd-row>
    <p>Arrange center</p>
    <sd-row class="grid-demo sd:text-white" justify="center">
      <sd-col :span="4" class="sd:bg-[#4096ff]">
        <div>col - 4</div>
      </sd-col>
      <sd-col :span="4" class="sd:bg-[#0958d9]">
        <div>col - 4</div>
      </sd-col>
      <sd-col :span="4" class="sd:bg-[#4096ff]">
        <div>col - 4</div>
      </sd-col>
      <sd-col :span="4" class="sd:bg-[#0958d9]">
        <div>col - 4</div>
      </sd-col>
    </sd-row>
    <p>Arrange right</p>
    <sd-row class="grid-demo sd:text-white" justify="end">
      <sd-col :span="4" class="sd:bg-[#4096ff]">
        <div>col - 4</div>
      </sd-col>
      <sd-col :span="4" class="sd:bg-[#0958d9]">
        <div>col - 4</div>
      </sd-col>
      <sd-col :span="4" class="sd:bg-[#4096ff]">
        <div>col - 4</div>
      </sd-col>
      <sd-col :span="4" class="sd:bg-[#0958d9]">
        <div>col - 4</div>
      </sd-col>
    </sd-row>
    <p>Space around</p>
    <sd-row class="grid-demo sd:text-white" justify="space-around">
      <sd-col :span="4" class="sd:bg-[#4096ff]">
        <div>col - 4</div>
      </sd-col>
      <sd-col :span="4" class="sd:bg-[#0958d9]">
        <div>col - 4</div>
      </sd-col>
      <sd-col :span="4" class="sd:bg-[#4096ff]">
        <div>col - 4</div>
      </sd-col>
      <sd-col :span="4" class="sd:bg-[#0958d9]">
        <div>col - 4</div>
      </sd-col>
    </sd-row>
    <p>Space between</p>
    <sd-row class="grid-demo sd:text-white" justify="space-between">
      <sd-col :span="4" class="sd:bg-[#4096ff]">
        <div>col - 4</div>
      </sd-col>
      <sd-col :span="4" class="sd:bg-[#0958d9]">
        <div>col - 4</div>
      </sd-col>
      <sd-col :span="4" class="sd:bg-[#4096ff]">
        <div>col - 4</div>
      </sd-col>
      <sd-col :span="4" class="sd:bg-[#0958d9]">
        <div>col - 4</div>
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
</style>
