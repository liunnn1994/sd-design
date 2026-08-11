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
          <sd-breadcrumb-item>Home</sd-breadcrumb-item>
          <sd-breadcrumb-item>Channel</sd-breadcrumb-item>
          <sd-breadcrumb-item>News</sd-breadcrumb-item>
        </sd-breadcrumb>
      </template>
      <template #extra>
        <sd-space>
          <sd-button>Cancel</sd-button>
          <sd-button type="primary">Save</sd-button>
        </sd-space>
      </template>
    </sd-page-header>
  </div>
</template>

<script setup>
  import { getCssVarToken } from '@sdata/web-vue';
</script>
