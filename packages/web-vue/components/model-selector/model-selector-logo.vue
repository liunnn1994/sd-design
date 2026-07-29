<template>
  <img
    v-bind="$attrs"
    :class="prefixCls"
    :src="source"
    :alt="alt || `${provider} logo`"
    :width="width"
    :height="height"
  />
</template>

<script setup lang="ts">
  import { computed } from 'vue';

  import type { ModelSelectorProvider } from './types';

  import { getPrefixCls } from '../_utils/global-config';

  defineOptions({ name: 'ModelSelectorLogo', inheritAttrs: false });

  const {
    provider,
    alt,
    width = 16,
    height = 16,
  } = defineProps<{
    /**
     * @zh 模型服务商标识；未知标识使用本地通用 Logo
     * @en Provider id; unknown ids use the local fallback logo
     */
    provider: ModelSelectorProvider;
    /**
     * @zh 图片替代文本
     * @en Alternative text
     */
    alt?: string;
    /**
     * @zh Logo 宽度
     * @en Logo width
     */
    width?: number | string;
    /**
     * @zh Logo 高度
     * @en Logo height
     */
    height?: number | string;
  }>();

  const logoModules = import.meta.glob<string>('./assets/logos/*.svg', {
    eager: true,
    import: 'default',
    query: '?url',
  });
  const prefixCls = getPrefixCls('model-selector-logo');
  const source = computed(
    () =>
      logoModules[`./assets/logos/${provider}.svg`] ?? logoModules['./assets/logos/default.svg'],
  );
</script>
