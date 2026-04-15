<template>
  <sd-config-provider :locale="locale">
    <sd-radio-group type="button" v-model="localeType" :options="localeOptions"></sd-radio-group>
    <div>
      <sd-pagination
        :total="50"
        show-total
        show-jumper
        show-page-size
        style="margin-top: 20px; margin-bottom: 20px"
      />
    </div>
    <sd-space :size="20" style="margin-bottom: 20px">
      <sd-range-picker style="width: 300px" />
      <sd-time-picker type="time-range" style="width: 300px" />
      <sd-popconfirm content="Are you sure you want to delete?">
        <sd-button type="primary">Popconfirm</sd-button>
      </sd-popconfirm>
    </sd-space>
  </sd-config-provider>
</template>

<script>
  import { ref, computed } from 'vue';

  import deDE from '@sdata/web-vue/es/locale/lang/de-de.js';
  import enUS from '@sdata/web-vue/es/locale/lang/en-us.js';
  import esES from '@sdata/web-vue/es/locale/lang/es-es.js';
  import frFR from '@sdata/web-vue/es/locale/lang/fr-fr.js';
  import idID from '@sdata/web-vue/es/locale/lang/id-id.js';
  import itIT from '@sdata/web-vue/es/locale/lang/it-it.js';
  import jaJP from '@sdata/web-vue/es/locale/lang/ja-jp.js';
  import koKR from '@sdata/web-vue/es/locale/lang/ko-kr.js';
  import nlNL from '@sdata/web-vue/es/locale/lang/nl-nl.js';
  import ptPT from '@sdata/web-vue/es/locale/lang/pt-pt.js';
  import thTH from '@sdata/web-vue/es/locale/lang/th-th.js';
  import viVN from '@sdata/web-vue/es/locale/lang/vi-vn.js';
  import zhCN from '@sdata/web-vue/es/locale/lang/zh-cn.js';

  const locales = {
    'zh-CN': zhCN,
    'en-US': enUS,
    'es-ES': esES,
    'ja-JP': jaJP,
    'id-ID': idID,
    'fr-FR': frFR,
    'pt-PT': ptPT,
    'de-DE': deDE,
    'ko-KR': koKR,
    'it-IT': itIT,
    'th-TH': thTH,
    'vi-VN': viVN,
    'nl-NL': nlNL,
  };

  export default {
    setup() {
      const localeType = ref('es-ES');
      const locale = computed(() => {
        return locales[localeType.value] || zhCN;
      });

      return {
        localeType,
        locale,
        localeOptions: Object.keys(locales),
      };
    },
  };
</script>
