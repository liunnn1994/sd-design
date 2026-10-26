<template>
  <sd-comment
    align="right"
    author="巴尔扎克"
    avatar="https://picsum.photos/1000/1000"
    content="设计是为构建对象、系统或开展活动而制定的计划与规范，也可以指由此产生的原型、产品或流程。设计需要满足目标与约束，综合考虑美观、功能和成本，并与使用环境相适应。建筑蓝图、工程图纸和业务流程都是常见的设计成果。"
    datetime="1 hour"
  >
    <template #actions>
      <span class="action"> <IconMessage /> 回复 </span>
    </template>
    <sd-comment align="right" avatar="https://picsum.photos/1000/1000">
      <template #actions>
        <sd-button key="0" type="secondary"> 取消 </sd-button>
        <sd-button key="1" type="primary"> 回复 </sd-button>
      </template>
      <template #content>
        <sd-input placeholder="这里是自定义内容。" />
      </template>
    </sd-comment>
  </sd-comment>
</template>

<script setup lang="ts">
  import { IconMessage } from '@sdata/web-vue/es/icon/index.js';
</script>

<style scoped>
  .action {
    display: inline-block;
    padding: 0 4px;
    color: var(--color-text-1);
    line-height: 24px;
    background: transparent;
    border-radius: 2px;
    cursor: pointer;
    transition: all 0.1s ease;
  }

  .action:hover {
    background: var(--color-fill-3);
  }
</style>
