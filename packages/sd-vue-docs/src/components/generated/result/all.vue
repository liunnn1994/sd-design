<template>
  <sd-result status="error" title="无法连接网络 ">
    <template #icon>
      <IconFaceFrownFill />
    </template>
    <template #subtitle> DNS_PROBE_FINISHED_NO_INTERNET </template>

    <template #extra>
      <sd-button type="primary">刷新</sd-button>
    </template>
    <sd-typography
      class="sd:p-6"
      :style="{ backgroundColor: `var(${getCssVarToken('--color-fill-2')})` }"
    >
      <sd-typography-paragraph>请尝试：</sd-typography-paragraph>
      <ul>
        <li> 检查网线、调制解调器和路由器 </li>
        <li> 重新连接 Wi-Fi </li>
      </ul>
    </sd-typography>
  </sd-result>
</template>

<script setup lang="ts">
  import { getCssVarToken } from '@sdata/web-vue';
  import { IconFaceFrownFill } from '@sdata/web-vue/es/icon/index.js';
</script>
