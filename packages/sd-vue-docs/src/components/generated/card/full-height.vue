<template>
  <div class="sd:flex sd:gap-[16px]">
    <div class="sd:h-[300px] sd:flex-1">
      <sd-card full-height title="Scrollbar 组件滚动">
        <p v-for="n in 30" :key="n" class="sd:leading-[24px]">第 {{ n }} 行内容</p>
      </sd-card>
    </div>
    <div class="sd:h-[300px] sd:flex-1">
      <sd-card full-height :scrollbar="false" title="原生 overflow 滚动">
        <p v-for="n in 30" :key="n" class="sd:leading-[24px]">第 {{ n }} 行内容</p>
      </sd-card>
    </div>
  </div>
</template>
