<template>
  <div
    class="sd:flex sd:w-full sd:box-border sd:p-10"
    :style="{ backgroundColor: `var(${getCssVarToken('--color-fill-2')})` }"
  >
    <sd-card class="sd:w-90" title="SD 卡片" :bordered="false">
      <template #extra>
        <sd-link>更多</sd-link>
      </template>
      卡片内容
      <br />
      卡片内容
    </sd-card>
    <sd-card class="sd:w-90 sd:ml-6" title="悬停此处" hoverable :bordered="false">
      <template #extra>
        <sd-link>更多</sd-link>
      </template>
      卡片内容
      <br />
      卡片内容
    </sd-card>
  </div>
</template>

<script setup lang="ts">
  import { getCssVarToken } from '@sdata/web-vue';
</script>
