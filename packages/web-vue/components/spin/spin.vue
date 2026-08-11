<template>
  <DefineSpinIcon>
    <div v-if="!mergedHideIcon" :class="`${prefixCls}-icon`" :style="iconStyle" aria-hidden="true">
      <VNodeRenderer v-if="customIcon" :content="customIcon" />
      <slot v-else-if="slots.element" name="element" />
      <DotLoading v-else-if="mergedDot" :size="mergedSize" />
      <component :is="configCtx.slots.loading" v-else-if="configCtx?.slots.loading" />
      <IconLoading v-else spin :size="mergedSize" />
    </div>
    <div v-if="hasTip" :class="`${prefixCls}-tip`">
      <slot v-if="$slots.tip" name="tip" />
      <template v-else>{{ mergedTip }}</template>
    </div>
  </DefineSpinIcon>

  <div v-bind="$attrs" role="status" aria-live="polite" :class="cls">
    <template v-if="$slots.default">
      <slot />
      <div v-if="activeLoading" :class="`${prefixCls}-mask`">
        <div :class="`${prefixCls}-mask-icon`">
          <ReuseSpinIcon />
        </div>
      </div>
    </template>
    <ReuseSpinIcon v-else-if="activeLoading" />
  </div>
</template>

<script setup lang="ts">
  import type { VNode, VNodeChild } from 'vue';
  import { cloneVNode, computed, inject, shallowRef, toRef } from 'vue';

  import { createReusableTemplate, watchDebounced } from '@vueuse/core';

  import { useConfigProviderProp } from '../_hooks/use-config-provider-prop';
  import { getPrefixCls } from '../_utils/global-config';
  import { getFirstComponent } from '../_utils/vue-utils';
  import { configProviderInjectionKey } from '../config-provider/context';
  import IconLoading from '../icon/icon-loading';
  import DotLoading from './dot-loading.vue';

  const VNodeRenderer = ({ content }: { content: VNodeChild }) => content;

  defineOptions({ name: 'Spin', inheritAttrs: false });

  const props = withDefaults(
    defineProps<{
      /**
       * @zh 尺寸
       * @en Size
       */
      size?: number;
      /**
       * @zh 是否为加载中状态（仅在容器模式下生效）
       * @en Whether it is loading state (Only effective in container mode)
       */
      loading?: boolean;
      /**
       * @zh 加载指示器显示前的延迟时间。设置为 `true` 时延迟 400ms
       * @en Delay before showing the loading indicator. Uses 400ms when set to `true`
       */
      delay?: boolean | number;
      /**
       * @zh 是否使用点类型的动画
       * @en Whether to use dot type animation
       */
      dot?: boolean;
      /**
       * @zh 提示内容
       * @en Prompt content
       */
      tip?: string;
      /**
       * @zh 是否隐藏图标
       * @en Whether to hide the icon
       */
      hideIcon?: boolean;
    }>(),
    {
      delay: false,
      hideIcon: false,
    },
  );

  const slots = defineSlots<{
    /**
     * @zh 自定义内容
     * @en Custom content
     */
    default?: () => VNode[];
    /**
     * @zh 自定义图标（自动旋转）
     * @en Custom icon (auto-rotation)
     */
    icon?: () => VNode[];
    /**
     * @zh 自定义元素
     * @en Custom element
     */
    element?: () => VNode[];
    /**
     * @zh 自定义提示内容
     * @en Custom tip
     */
    tip?: () => VNode[];
  }>();

  const [DefineSpinIcon, ReuseSpinIcon] = createReusableTemplate();
  const prefixCls = getPrefixCls('spin');
  const configCtx = inject(configProviderInjectionKey, undefined);
  const { mergedValue: mergedLoading } = useConfigProviderProp(toRef(props, 'loading'), {
    propNames: ['loading'],
    getGlobalValue: (ctx) => ctx?.spinProps?.loading,
  });
  const { mergedValue: mergedDelay } = useConfigProviderProp(toRef(props, 'delay'), {
    propNames: ['delay'],
    getGlobalValue: (ctx) => ctx?.spinProps?.delay,
  });
  const { mergedValue: mergedSize } = useConfigProviderProp(toRef(props, 'size'), {
    propNames: ['size'],
    getGlobalValue: (ctx) => ctx?.spinProps?.size,
  });
  const { mergedValue: mergedDot } = useConfigProviderProp(toRef(props, 'dot'), {
    propNames: ['dot'],
    getGlobalValue: (ctx) => ctx?.spinProps?.dot,
  });
  const { mergedValue: mergedTip } = useConfigProviderProp(toRef(props, 'tip'), {
    propNames: ['tip'],
    getGlobalValue: (ctx) => ctx?.spinProps?.tip,
  });
  const { mergedValue: mergedHideIcon } = useConfigProviderProp(toRef(props, 'hideIcon'), {
    propNames: ['hideIcon', 'hide-icon'],
    getGlobalValue: (ctx) => ctx?.spinProps?.hideIcon,
  });
  const delayTime = computed(() =>
    mergedDelay.value === true ? 400 : Math.max(0, Number(mergedDelay.value) || 0),
  );
  const requestedLoading = computed(() => (slots.default ? Boolean(mergedLoading.value) : true));
  const delayedLoading = shallowRef(false);

  watchDebounced(
    requestedLoading,
    (loading) => {
      delayedLoading.value = loading;
    },
    { debounce: delayTime, immediate: true },
  );

  const activeLoading = computed(() =>
    delayTime.value > 0
      ? Boolean(requestedLoading.value && delayedLoading.value)
      : requestedLoading.value,
  );
  const cls = computed(() => [
    prefixCls,
    {
      [`${prefixCls}-loading`]: slots.default ? activeLoading.value : Boolean(mergedLoading.value),
      [`${prefixCls}-with-tip`]: mergedTip.value && !slots.default,
    },
  ]);
  const iconStyle = computed(() =>
    mergedSize.value ? { fontSize: `${mergedSize.value}px` } : undefined,
  );
  const hasTip = computed(() => Boolean(slots.tip ?? mergedTip.value));

  const customIcon = computed(() => {
    const iconVNode = slots.icon ? getFirstComponent(slots.icon()) : undefined;
    return iconVNode ? cloneVNode(iconVNode, { spin: true }) : undefined;
  });
</script>
