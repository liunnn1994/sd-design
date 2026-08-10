<template>
  <component
    :is="getCustomEmpty()"
    v-if="!inConfigProvider && getCustomEmpty() && !slots.image && !imgSrc && !description"
    component="empty"
  />
  <div v-else :class="prefixCls" v-bind="$attrs">
    <div :class="`${prefixCls}-image`">
      <slot name="image">
        <img v-if="imgSrc" :src="imgSrc" :alt="description || 'empty'" />
        <IconEmpty v-else />
      </slot>
    </div>
    <div :class="`${prefixCls}-description`">
      <slot>{{ description || t('empty.description') }}</slot>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { inject } from 'vue';

  import { getPrefixCls } from '../_utils/global-config';
  import { configProviderInjectionKey } from '../config-provider/context';
  import IconEmpty from '../icon/icon-empty';
  import { useI18n } from '../locale';

  defineOptions({
    name: 'Empty',
    inheritAttrs: false,
  });

  const {
    description,
    imgSrc,
    inConfigProvider = false,
  } = defineProps<{
    /**
     * @zh 描述内容
     * @en Description
     */
    description?: string;
    /**
     * @zh 自定义图片的地址
     * @en The src of the Custom Image
     */
    imgSrc?: string;
    /**
     * @zh 是否在 ConfigProvider 中使用
     * @en Whether to use in ConfigProvider
     * @version 2.47.0
     */
    inConfigProvider?: boolean;
  }>();

  const slots = defineSlots<{
    /**
     * @zh 描述内容
     * @en Description
     */
    default?: () => unknown;
    /**
     * @zh 图片/图标
     * @en Image/Icon
     */
    image?: () => unknown;
  }>();

  const prefixCls = getPrefixCls('empty');
  const { t } = useI18n();
  const configCtx = inject(configProviderInjectionKey, undefined);

  const getCustomEmpty = () => configCtx?.slots.empty;
</script>
