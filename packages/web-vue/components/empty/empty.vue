<template>
  <!-- ConfigProvider 自定义分支：用容器 div 承载 $attrs（与默认分支行为一致），
       避免对 ConfigProvider 插槽返回的 vnode 做 clone 合并引发渲染循环 -->
  <div v-if="!inConfigProvider && getCustomEmpty() && !slots.image && !imgSrc && !description" v-bind="$attrs">
    <CustomEmptyRenderer :vnode="getCustomEmpty()" />
  </div>
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

  const getCustomEmpty = (): VNode | VNode[] | undefined => {
    const slot = configCtx?.slots.empty;
    // 在渲染期调用插槽（模板内联触发），拿到 ConfigProvider 提供的自定义空状态 vnode
    const vnode = slot ? slot({ component: 'empty' }) : undefined;
    if (vnode && (typeof vnode === 'object')) {
      return vnode as VNode | VNode[];
    }
    return undefined;
  };
</script>

<script lang="ts">
  // 稳定标识的函数式组件：接住 ConfigProvider 插槽返回的 vnode 作为唯一子节点渲染。
  // 必须定义在模块级保持标识稳定，否则每次渲染都识别为新组件导致整树重挂载。
  import type { VNode } from 'vue';

  const CustomEmptyRenderer = (props: { vnode?: VNode | VNode[] }) => props.vnode;
  CustomEmptyRenderer.props = ['vnode'];
</script>
