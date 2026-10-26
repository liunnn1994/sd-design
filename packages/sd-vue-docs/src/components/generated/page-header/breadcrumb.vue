<template>
  <div class="sd:p-7" :style="{ backgroundColor: `var(${getCssVarToken('--color-fill-2')})` }">
    <sd-page-header
      :style="{ backgroundColor: `var(${getCssVarToken('--color-bg-2')})` }"
      title="SD Design"
      subtitle="SD Design Vue"
      :show-back="false"
    >
      <template #breadcrumb>
        <sd-breadcrumb>
          <sd-breadcrumb-item>首页</sd-breadcrumb-item>
          <sd-breadcrumb-item>渠道</sd-breadcrumb-item>
          <sd-breadcrumb-item>新闻</sd-breadcrumb-item>
        </sd-breadcrumb>
      </template>
      <template #extra>
        <sd-space>
          <sd-button>取消</sd-button>
          <sd-button type="primary">保存</sd-button>
        </sd-space>
      </template>
    </sd-page-header>
  </div>
</template>

<script setup lang="ts">
  import { getCssVarToken } from '@sdata/web-vue';
</script>
