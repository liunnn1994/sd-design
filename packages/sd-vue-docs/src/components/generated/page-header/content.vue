<template>
  <div class="sd:p-7" :style="{ backgroundColor: `var(${getCssVarToken('--color-fill-2')})` }">
    <sd-page-header
      :style="{ backgroundColor: `var(${getCssVarToken('--color-bg-2')})` }"
      title="SD Design"
    >
      <template #breadcrumb>
        <sd-breadcrumb>
          <sd-breadcrumb-item>首页</sd-breadcrumb-item>
          <sd-breadcrumb-item>渠道</sd-breadcrumb-item>
          <sd-breadcrumb-item>新闻</sd-breadcrumb-item>
        </sd-breadcrumb>
      </template>
      <template #subtitle>
        <sd-space>
          <span>SD Design Vue</span>
          <sd-tag color="red" size="small">默认</sd-tag>
        </sd-space>
      </template>
      <template #extra>
        <sd-space>
          <sd-button>取消</sd-button>
          <sd-button type="primary">保存</sd-button>
        </sd-space>
      </template>
      <p> 其他用法请参阅设计 </p>
      <p>
        设计是为构建对象、系统或开展活动而制定的计划与规范，也可以指由此产生的原型、产品或流程。设计需要满足目标与约束，综合考虑美观、功能和成本，并与使用环境相适应。建筑蓝图、工程图纸和业务流程都是常见的设计成果。
      </p>
    </sd-page-header>
  </div>
</template>

<script setup lang="ts">
  import { getCssVarToken } from '@sdata/web-vue';
</script>
