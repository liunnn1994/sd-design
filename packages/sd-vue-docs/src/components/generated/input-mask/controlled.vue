<template>
  <sd-space direction="vertical" align="start">
    <sd-input-mask v-model="value" :preset="preset" allow-clear />
    <sd-space>
      <sd-button @click="preset = preset === 'semver' ? 'url' : 'semver'">
        切换为 {{ preset === 'semver' ? 'URL' : 'SemVer' }}
      </sd-button>
      <span class="text-sm text-slate-500">当前值：{{ value || '空' }}</span>
    </sd-space>
  </sd-space>
</template>

<script setup lang="ts">
  import type { InputMaskPresetName } from '@sdata/web-vue';

  import { ref } from 'vue';

  const preset = ref<InputMaskPresetName>('semver');
  const value = ref('1.2.3');
</script>
