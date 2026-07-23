<template>
  <component :is="tooltipWrapper" v-bind="tooltipBindings">
    <a
      v-if="href"
      ref="buttonRef"
      :class="[cls, { [`${prefixCls}-only-icon`]: $slots.icon && !$slots.default }]"
      :href="mergedDisabled || loading ? undefined : href"
      @click="handleClick"
    >
      <span v-if="loading || $slots.icon" :class="`${prefixCls}-icon`">
        <icon-loading v-if="loading" spin />
        <slot v-else name="icon" />
      </span>
      <slot v-if="!isTwoCNChar" />
      <span v-else><slot /></span>
      <span v-if="$slots['sr-only']" :class="`${prefixCls}-sr-only`">
        <slot name="sr-only" />
      </span>
    </a>
    <button
      v-else
      ref="buttonRef"
      :class="[cls, { [`${prefixCls}-only-icon`]: $slots.icon && !$slots.default }]"
      :type="htmlType"
      :disabled="mergedDisabled"
      :autofocus="autofocus"
      @click="handleClick"
    >
      <span v-if="loading || $slots.icon" :class="`${prefixCls}-icon`">
        <icon-loading v-if="loading" :spin="true" />
        <slot v-else name="icon" />
      </span>
      <slot v-if="!isTwoCNChar" />
      <span v-else><slot /></span>
      <span v-if="$slots['sr-only']" :class="`${prefixCls}-sr-only`">
        <slot name="sr-only" />
      </span>
    </button>
    <template v-if="$slots.tooltip" #content>
      <slot name="tooltip" />
    </template>
  </component>
</template>

<script setup lang="ts">
  import type { PropType } from 'vue';
  import {
    cloneVNode,
    computed,
    defineComponent,
    toRefs,
    inject,
    ref,
    onMounted,
    onUpdated,
    useSlots,
  } from 'vue';

  import type { TooltipProps } from '../tooltip';

  import { useFormItem } from '../_hooks/use-form-item';
  import { useSize } from '../_hooks/use-size';
  import { Status, Size, BorderShape } from '../_utils/constant';
  import { getPrefixCls } from '../_utils/global-config';
  import { isString } from '../_utils/is';
  import { configProviderInjectionKey } from '../config-provider/context';
  import IconLoading from '../icon/icon-loading';
  import Tooltip from '../tooltip';
  import { ButtonTypes } from './constants';
  import { buttonGroupInjectionKey } from './context';

  const regexTwoCNChar = /^[一-龥]{2}$/;

  defineOptions({ name: 'Button' });

  const props = defineProps({
    /**
     * @zh 按钮的类型，分为五种：次要按钮、主要按钮、虚框按钮、线性按钮、文字按钮。
     * @en Button types are divided into five types: secondary, primary, dashed, outline and text.
     * @defaultValue 'secondary'
     */
    type: {
      type: String as PropType<ButtonTypes>,
    },
    /**
     * @zh 按钮的形状
     * @en Button shape
     */
    shape: {
      type: String as PropType<BorderShape>,
    },
    /**
     * @zh 按钮的状态
     * @en Button state
     * @values 'normal','warning','success','danger'
     * @defaultValue 'normal'
     */
    status: {
      type: String as PropType<Status>,
    },
    /**
     * @zh 按钮的尺寸
     * @en Button size
     * @values 'mini','small','medium','large'
     * @defaultValue 'medium'
     */
    size: {
      type: String as PropType<Size>,
    },
    /**
     * @zh 按钮的宽度是否随容器自适应。
     * @en Whether the width of the button adapts to the container.
     */
    long: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 按钮是否为加载中状态
     * @en Whether the button is in the loading state
     */
    loading: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 当 loading 的时候，不改变按钮的宽度。
     * @en The width of the button remains unchanged on loading.
     */
    loadingFixedWidth: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 按钮是否禁用
     * @en Whether the button is disabled
     * @defaultValue false
     */
    disabled: {
      type: Boolean,
    },
    /**
     * @zh 设置 `button` 的原生 `type` 属性，可选值参考 [HTML标准](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button#attr-type "_blank")
     * @en Set the native `type` attribute of `button`, optional values refer to [HTML](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button#attr-type "_blank")
     */
    htmlType: {
      type: String as PropType<HTMLButtonElement['type']>,
      default: 'button',
    },
    /**
     * @zh 设置 `button` 的原生 `autofocus` 属性，可选值参考 [HTML标准](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button#attr-type "_blank")
     * @en Set the native `autofocus` attribute of `button`, optional values refer to [HTML](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button#attr-type "_blank")
     */
    autofocus: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 设置跳转链接。设置此属性时，按钮渲染为a标签。
     * @en Set up a jump link. When this property is set, the button is rendered as `<a>`
     */
    href: String,
    /**
     * @zh 按钮的文字气泡配置。传入字符串时作为气泡内容；传入对象时可完整继承 Tooltip 的所有属性。
     * @en Tooltip configuration for the button. A string is used as the tooltip content; an object inherits all Tooltip props.
     */
    tooltip: {
      type: [String, Object] as PropType<string | TooltipProps>,
    },
  });

  const emit = defineEmits<{
    /**
     * @zh 点击按钮时触发
     * @en Emitted when the button is clicked
     * @property {MouseEvent} ev
     */
    click: [_ev: MouseEvent];
  }>();

  /**
   * @zh 图标
   * @en Icon
   * @slot icon
   */
  /**
   * @zh 仅供屏幕阅读器读取的按钮文本
   * @en Button text for screen readers only
   * @slot sr-only
   */
  const { size, disabled } = toRefs(props);
  const prefixCls = getPrefixCls('btn');

  // 未设置 tooltip 时透传默认插槽，避免引入 Tooltip/Trigger 的额外开销。
  // 以单根 vnode 形式克隆插槽首个子节点并显式合并 attrs：返回数组会被当作
  // fragment，导致透传 attrs（class、aria-label 等）丢失，且 $el 指向注释
  // 节点，破坏依赖它的父组件（Affix/Mention 的 ResizeObserver、Copy/Tour
  // 的 class 透传）。inheritAttrs:false 避免与手动合并重复应用。
  const PassThrough = defineComponent({
    name: 'ButtonPassThrough',
    inheritAttrs: false,
    setup:
      (_, { slots, attrs }) =>
      () => {
        const vnodes = slots.default?.();
        return vnodes?.length ? cloneVNode(vnodes[0], attrs) : undefined;
      },
  });

  const slots = useSlots();
  const hasTooltip = computed(() => props.tooltip != null || Boolean(slots.tooltip));
  const tooltipWrapper = computed(() => (hasTooltip.value ? Tooltip : PassThrough));
  const tooltipBindings = computed(() => {
    if (!hasTooltip.value) {
      return undefined;
    }
    const tooltip = props.tooltip;
    if (isString(tooltip)) {
      return { content: tooltip };
    }
    return tooltip ?? {};
  });
  const configContext = inject(configProviderInjectionKey, undefined);
  const groupContext = inject(buttonGroupInjectionKey, undefined);
  const autoInsertSpaceInButton = computed(() => Boolean(configContext?.autoInsertSpaceInButton));
  const _size = computed(() => size!.value ?? groupContext?.size);
  const _disabled = computed(() => Boolean(disabled.value || groupContext?.disabled));
  const { mergedSize: _mergedSize, mergedDisabled } = useFormItem({
    size: _size,
    disabled: _disabled,
  });
  const { mergedSize } = useSize(_mergedSize);
  const buttonRef = ref<HTMLAnchorElement | HTMLButtonElement>();
  const isTwoCNChar = ref(false);

  const updateIsTwoCNChar = () => {
    if (!autoInsertSpaceInButton.value) {
      if (isTwoCNChar.value) {
        isTwoCNChar.value = false;
      }
      return;
    }

    const textContent = buttonRef.value?.textContent?.replace(/\s/g, '') ?? '';
    const value = regexTwoCNChar.test(textContent);

    if (value !== isTwoCNChar.value) {
      isTwoCNChar.value = value;
    }
  };

  onMounted(updateIsTwoCNChar);
  onUpdated(updateIsTwoCNChar);

  const cls = computed(() => [
    prefixCls,
    `${prefixCls}-${props.type ?? groupContext?.type ?? 'secondary'}`,
    `${prefixCls}-shape-${props.shape ?? groupContext?.shape ?? 'square'}`,
    `${prefixCls}-size-${mergedSize.value}`,
    `${prefixCls}-status-${props.status ?? groupContext?.status ?? 'normal'}`,
    {
      [`${prefixCls}-long`]: props.long,
      [`${prefixCls}-loading`]: props.loading,
      [`${prefixCls}-loading-fixed-width`]: props.loadingFixedWidth,
      [`${prefixCls}-disabled`]: mergedDisabled.value,
      [`${prefixCls}-link`]: isString(props.href),
      [`${prefixCls}-two-chinese-chars`]: autoInsertSpaceInButton.value && isTwoCNChar.value,
    },
  ]);

  const handleClick = (ev: MouseEvent) => {
    if (props.disabled || props.loading) {
      ev.preventDefault();
      return;
    }
    emit('click', ev);
  };
</script>
