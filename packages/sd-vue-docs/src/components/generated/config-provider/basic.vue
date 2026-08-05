<template>
  <sd-config-provider :locale="locale">
    <sd-radio-group type="button" v-model="localeType" :options="localeOptions"></sd-radio-group>
    <div>
      <sd-pagination :total="50" show-total show-jumper show-page-size class="sd:mt-5 sd:mb-5" />
    </div>
    <sd-space :size="20" class="sd:mb-5">
      <sd-range-picker class="sd:w-75" />
      <sd-time-picker type="time-range" class="sd:w-75" />
      <sd-popconfirm content="Are you sure you want to delete?">
        <sd-button type="primary">Popconfirm</sd-button>
      </sd-popconfirm>
    </sd-space>
  </sd-config-provider>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';

  import enUS from '@sdata/web-vue/es/locale/lang/en-us.js';
  import zhCN from '@sdata/web-vue/es/locale/lang/zh-cn.js';

  const locales = {
    'zh-CN': zhCN,
    'en-US': enUS,
  };

  const localeType = ref<keyof typeof locales>('zh-CN');
  const locale = computed(() => {
    return locales[localeType.value] || zhCN;
  });

  const localeOptions = Object.keys(locales) as Array<keyof typeof locales>;
</script>
