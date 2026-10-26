<template>
  <div
    class="sd:box-border sd:w-140 sd:border-30 sd:border-solid sd:border-[rgb(var(--gray-2))] sd:p-6"
  >
    <p
      >设计是为构建对象、系统或开展活动而制定的计划与规范，也可以指由此产生的原型、产品或流程。设计的过程就是将想法逐步转化为可用方案的过程。</p
    >
    <sd-divider />
    <p
      >设计是为构建对象、系统或开展活动而制定的计划与规范，也可以指由此产生的原型、产品或流程。设计的过程就是将想法逐步转化为可用方案的过程。</p
    >
    <sd-divider dashed />
    <p
      >设计是为构建对象、系统或开展活动而制定的计划与规范，也可以指由此产生的原型、产品或流程。设计的过程就是将想法逐步转化为可用方案的过程。</p
    >
    <sd-divider :size="2" class="sd:[border-bottom-style:dotted]" />
    <p
      >设计是为构建对象、系统或开展活动而制定的计划与规范，也可以指由此产生的原型、产品或流程。设计的过程就是将想法逐步转化为可用方案的过程。</p
    >
  </div>
  <div
    class="sd:mt-12 sd:box-border sd:w-140 sd:border-30 sd:border-solid sd:border-[rgb(var(--gray-2))] sd:p-6"
  >
    <div class="sd:flex sd:items-center sd:justify-center">
      <span
        class="sd:flex sd:h-10 sd:w-10 sd:items-center sd:justify-center sd:mr-4 sd:rounded-[50%] sd:bg-[var(--color-fill-3)] sd:text-base sd:text-[var(--color-text-2)]"
        ><IconImage
      /></span>
      <div class="sd:flex-1 sd:text-xs sd:leading-5 sd:text-[var(--color-text-2)]">
        <sd-typography-title :heading="6">图片</sd-typography-title>
        2010 年 5 月 4 日
      </div>
    </div>
    <sd-divider class="sd:left-[55px] sd:w-[calc(100%-55px)] sd:min-w-auto sd:my-4" />
    <div class="sd:flex sd:items-center sd:justify-center">
      <span
        class="sd:flex sd:h-10 sd:w-10 sd:items-center sd:justify-center sd:mr-4 sd:rounded-[50%] sd:bg-[var(--color-fill-3)] sd:text-base sd:text-[var(--color-text-2)]"
        ><IconUser
      /></span>
      <div class="sd:flex-1 sd:text-xs sd:leading-5 sd:text-[var(--color-text-2)]">
        <sd-typography-title :heading="6">头像</sd-typography-title>
        2010 年 5 月 4 日
      </div>
    </div>
    <sd-divider class="sd:left-[55px] sd:w-[calc(100%-55px)] sd:min-w-auto sd:my-4" />
    <div class="sd:flex sd:items-center sd:justify-center">
      <span
        class="sd:flex sd:h-10 sd:w-10 sd:items-center sd:justify-center sd:mr-4 sd:rounded-[50%] sd:bg-[var(--color-fill-3)] sd:text-base sd:text-[var(--color-text-2)]"
        ><IconPen
      /></span>
      <div class="sd:flex-1 sd:text-xs sd:leading-5 sd:text-[var(--color-text-2)]">
        <sd-typography-title :heading="6">图标</sd-typography-title>
        2010 年 5 月 4 日
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { IconImage, IconUser, IconPen } from '@sdata/web-vue/es/icon/index.js';
</script>
