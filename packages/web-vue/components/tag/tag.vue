<template>
  <span
    v-if="computedVisible"
    :class="cls"
    :style="style"
    :role="checkable ? 'button' : undefined"
    :tabindex="checkable ? 0 : undefined"
    :aria-pressed="checkable ? computedChecked : undefined"
    @click="handleClick"
    @keydown="handleTagKeydown"
  >
    <span v-if="$slots.icon" :class="`${prefixCls}-icon`">
      <slot name="icon" />
    </span>
    <component
      :is="ellipsisComponent"
      v-if="shouldRenderEllipsis"
      :class="`${prefixCls}-text`"
      :line-clamp="ellipsisLineClamp"
      :expand-trigger="ellipsisExpandTrigger"
      :tooltip="mergedEllipsisTooltip"
    >
      <slot />
      <template v-if="hasCustomTooltip" #tooltip>
        <slot name="tooltip">{{ tooltip }}</slot>
      </template>
    </component>
    <Tooltip
      v-else-if="hasCustomTooltip && ellipsisTooltip !== false && $slots.default"
      v-bind="tooltipBindings"
      :content="tooltip"
    >
      <span :class="`${prefixCls}-text`">
        <slot />
      </span>
      <template #content>
        <slot name="tooltip">{{ tooltip }}</slot>
      </template>
    </Tooltip>
    <span v-else-if="$slots.default" :class="`${prefixCls}-text`">
      <slot />
    </span>
    <icon-hover
      v-if="closable"
      tabindex="0"
      role="button"
      :aria-label="t('a11y.close')"
      :prefix="prefixCls"
      :class="`${prefixCls}-close-btn`"
      @click.stop="handleClose"
      @keydown.stop="handleCloseKeydown"
    >
      <slot name="close-icon">
        <icon-close />
      </slot>
    </icon-hover>
    <span v-if="loading" :class="`${prefixCls}-loading-icon`">
      <icon-loading />
    </span>
  </span>
</template>

<script setup lang="ts">
  import type { CSSProperties, PropType } from 'vue';
  import { computed, inject, onBeforeUpdate, ref, useSlots } from 'vue';

  import { createTagFoundation } from '@sdata/web-core/tag/foundation';
  import { isNil } from 'es-toolkit/compat';

  import type { EllipsisTooltipProps } from '../ellipsis';

  import IconHover from '../_components/icon-hover.vue';
  import { useSize } from '../_hooks/use-size';
  import { Size } from '../_utils/constant';
  import { getPrefixCls } from '../_utils/global-config';
  import { configProviderInjectionKey } from '../config-provider/context';
  import Ellipsis, { PerformantEllipsis } from '../ellipsis';
  import IconClose from '../icon/icon-close';
  import IconLoading from '../icon/icon-loading';
  import { useI18n } from '../locale';
  import Tooltip from '../tooltip';

  const props = defineProps({
    /**
     * @zh 标签的颜色
     * @en Label color
     * @values 'red','orangered','orange','gold','lime','green','cyan','blue','sdblue','purple','pinkpurple','magenta','gray'
     */
    color: {
      type: String,
    },
    /**
     * @zh 标签的大小
     * @en Label size
     * @values 'small','medium','large'
     * @defaultValue 'medium'
     */
    size: {
      type: String,
    },
    /**
     * @zh 是否显示边框
     * @en Whether the tag is bordered
     * @version 2.33.0
     */
    bordered: {
      type: Boolean,
      default: undefined,
    },
    /**
     * @zh 标签是否可见
     * @en Whether the tag is visible
     * @vModel
     */
    visible: {
      type: Boolean,
      default: undefined,
    },
    /**
     * @zh 标签默认是否可见
     * @en Whether the tag is visible by default
     */
    defaultVisible: {
      type: Boolean,
      default: true,
    },
    /**
     * @zh 标签是否为加载中状态
     * @en Whether the tag is loading state
     */
    loading: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 标签是否可关闭
     * @en Whether the tag can be closed
     */
    closable: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 标签是否可选中
     * @en Whether the tag can be checked
     */
    checkable: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 标签是否选中（标签可选中时可用）
     * @en Whether the tag is checked (available when the tag is checkable)
     * @vModel
     */
    checked: {
      type: Boolean,
      default: undefined,
    },
    /**
     * @zh 标签默认选中状态（标签可选中时可用）
     * @en Whether the tag is checked by default (available when the tag is checkable)
     */
    defaultChecked: {
      type: Boolean,
      default: true,
    },
    /**
     * @zh 标签内容不换行
     * @en Tag content does not wrap
     * @version 2.56.1
     */
    nowrap: {
      type: Boolean,
      default: undefined,
    },
    /**
     * @zh 是否开启默认内容省略
     * @en Whether to enable ellipsis for the default slot content
     * @defaultValue true
     */
    ellipsis: {
      type: Boolean,
      default: undefined,
    },
    /**
     * @zh 默认内容省略的最大显示行数
     * @en Maximum number of displayed lines for ellipsis content
     */
    ellipsisLineClamp: {
      type: [Number, String],
      default: undefined,
    },
    /**
     * @zh 省略内容的展开触发方式
     * @en Trigger mode for ellipsis expansion
     * @values 'click'
     */
    ellipsisExpandTrigger: {
      type: String as () => 'click',
      default: undefined,
    },
    /**
     * @zh 省略时是否展示提示。可传入 Tooltip 属性。
     * @en Whether to show a tooltip when ellipsis is active. Tooltip props are supported.
     * @defaultValue true
     */
    ellipsisTooltip: {
      type: [Boolean, Object] as PropType<boolean | EllipsisTooltipProps>,
      default: true,
    },
    /**
     * @zh 自定义提示内容。设置后（或使用 tooltip 插槽时）无论内容是否省略，hover 时都会显示提示；ellipsis-tooltip 显式关闭（false 或 disabled: true）时除外
     * @en Custom tooltip content. When set (or when the tooltip slot is used), the tooltip shows on hover whether or not the content is truncated, unless the ellipsis tooltip is explicitly disabled (false or disabled: true)
     * @version 4.8.0
     */
    tooltip: {
      type: String,
    },
    /**
     * @zh 是否使用高性能省略实现
     * @en Whether to use the performant ellipsis implementation
     */
    ellipsisPerformant: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 自定义颜色的文字颜色，仅在自定义颜色时生效
     * @en Text color for custom color tags, only effective when using a custom color
     */
    textColor: {
      type: String,
      default: undefined,
    },
    /**
     * @zh 自定义颜色的背景透明度，仅在自定义颜色时生效。未显式传入时：若颜色自带透明度则使用该透明度，否则为 0.8
     * @en Background opacity for custom color tags, only effective when using a custom color. When not explicitly set, uses the color's own opacity if it has one, otherwise 0.8
     */
    backgroundAlpha: {
      type: Number,
      default: undefined,
    },
  });

  defineOptions({ name: 'Tag' });

  const emit = defineEmits<{
    'update:visible': [_visible: boolean];
    'update:checked': [_checked: boolean];
    /**
     * @zh 点击关闭按钮时触发
     * @en Emitted when the close button is clicked
     * @param {MouseEvent | KeyboardEvent} ev
     */
    'close': [_ev: MouseEvent | KeyboardEvent];
    /**
     * @zh 用户选中时触发（仅在可选中模式下触发）
     * @en Emitted when the user check (emit only in the checkable mode)
     * @param {boolean} checked
     * @param {MouseEvent | KeyboardEvent} ev
     */
    'check': [_checked: boolean, _ev: MouseEvent | KeyboardEvent];
  }>();

  const slots = useSlots();

  const { t } = useI18n();

  const prefixCls = getPrefixCls('tag');
  const { mergedSize: _mergedSize } = useSize(computed(() => props.size as Size | undefined));
  const configCtx = inject(configProviderInjectionKey, undefined);

  const _visible = ref(props.defaultVisible);
  const _checked = ref(props.defaultChecked);
  const foundation: ReturnType<typeof createTagFoundation<EllipsisTooltipProps, Size>> =
    createTagFoundation(
      {
        props,
        get visible() {
          return _visible.value;
        },
        set visible(value) {
          _visible.value = value;
        },
        get checked() {
          return _checked.value;
        },
        set checked(value) {
          _checked.value = value;
        },
        get size() {
          return _mergedSize.value;
        },
        get isBuiltInColor() {
          return isBuiltInColor.value;
        },
        get isCustomColor() {
          return isCustomColor.value;
        },
        get resolvedColor() {
          return resolvedColor.value;
        },
        get isGradientColor() {
          return isGradientColor.value;
        },
        get resolvedBackgroundColor() {
          return resolvedBackgroundColor.value;
        },
        get autoTextColor() {
          return autoTextColor.value;
        },
        get finalTextColor() {
          return finalTextColor.value;
        },
        get colorAlpha() {
          return colorAlpha.value;
        },
        get finalBackgroundAlpha() {
          return finalBackgroundAlpha.value;
        },
        get computedChecked() {
          return computedChecked.value;
        },
        get resolvedEllipsis() {
          return resolvedEllipsis.value;
        },
        get shouldRenderEllipsis() {
          return shouldRenderEllipsis.value;
        },
        get hasCustomTooltip() {
          return hasCustomTooltip.value;
        },
        get hasDefaultSlot() {
          return hasDefaultSlot.value;
        },
        get hasTooltipSlot() {
          return hasTooltipSlot.value;
        },
      },
      {
        updateVisible: (value) => emit('update:visible', value),
        updateChecked: (value) => emit('update:checked', value),
        close: (event) => emit('close', event),
        check: (value, event) => emit('check', value, event),
      },
    );
  const { handleClose, handleCloseKeydown, handleClick, handleTagKeydown } = foundation;

  // ---- 内置/自定义颜色判断 ----
  const isBuiltInColor = computed(foundation.getIsBuiltInColor);
  const isCustomColor = computed(foundation.getIsCustomColor);

  // ---- 自定义颜色处理 ----
  // 通过 DOM 解析 CSS 颜色值为标准 rgb 格式
  const resolvedColor = computed(foundation.getResolvedColor);

  // 是否为渐变颜色
  const isGradientColor = computed(foundation.getIsGradientColor);

  // 背景颜色（自定义颜色时使用）
  const resolvedBackgroundColor = computed(foundation.getResolvedBackgroundColor);

  // 自动计算文字颜色
  const autoTextColor = computed(foundation.getAutoTextColor);

  // 最终文字颜色：用户指定的 textColor 优先
  const finalTextColor = computed(foundation.getFinalTextColor);

  // 自定义颜色自带的透明度（仅对纯色生效；颜色不透明时返回 undefined 以便回退到默认值）
  const colorAlpha = computed(foundation.getColorAlpha);

  // 背景透明度的处理：
  // - bordered 未显式传入时为完全不透明
  // - 显式传入 backgroundAlpha 时使用该值
  // - 否则使用颜色自带的透明度；颜色不透明时回退到默认 0.8
  const finalBackgroundAlpha = computed(foundation.getFinalBackgroundAlpha);

  // ---- 可见性 / 选中状态 ----
  const computedVisible = computed(foundation.getComputedVisible);
  const computedChecked = computed(foundation.getComputedChecked);

  // ---- 尺寸 ----
  const mergedSize = computed(foundation.getMergedSize);

  // ---- Ellipsis ----
  const hasDefaultSlot = ref(Boolean(slots.default));
  const hasTooltipSlot = ref(Boolean(slots.tooltip));
  onBeforeUpdate(() => {
    hasDefaultSlot.value = Boolean(slots.default);
    hasTooltipSlot.value = Boolean(slots.tooltip);
  });
  const resolvedEllipsis = computed(foundation.getResolvedEllipsis);
  const shouldRenderEllipsis = computed(foundation.getShouldRenderEllipsis);
  const hasLineClampEllipsis = computed(foundation.getHasLineClampEllipsis);
  const ellipsisComponent = computed(() =>
    props.ellipsisPerformant ? PerformantEllipsis : Ellipsis,
  );

  // ---- Tooltip ----
  // 显式传入 tooltip 属性或 tooltip 插槽时，无论内容是否被省略，hover 都展示提示
  const hasCustomTooltip = computed(foundation.getHasCustomTooltip);
  // 自定义提示内容时，让 Ellipsis 的提示常显（always）；ellipsis-tooltip 显式关闭
  // （false 或 disabled: true）时尊重该配置，不展示提示
  const mergedEllipsisTooltip = computed<boolean | EllipsisTooltipProps>(
    foundation.getMergedEllipsisTooltip,
  );
  // 非省略渲染路径的自定义提示：转发给 Tooltip 的绑定（always 非 Tooltip 属性，剔除；
  // disabled 原样透传以尊重显式关闭）
  const tooltipBindings = computed(foundation.getTooltipBindings);

  // ---- RTL ----
  const rtl = computed(() => configCtx?.rtl ?? false);

  // ---- CSS class ----
  const cls = computed(() => [
    prefixCls,
    `${prefixCls}-size-${mergedSize.value}`,
    {
      [`${prefixCls}-ellipsis`]: shouldRenderEllipsis.value,
      [`${prefixCls}-ellipsis-line-clamp`]: hasLineClampEllipsis.value,
      [`${prefixCls}-loading`]: props.loading,
      [`${prefixCls}-no-ellipsis`]: !shouldRenderEllipsis.value,
      [`${prefixCls}-${props.color}`]: isBuiltInColor.value,
      [`${prefixCls}-bordered`]: props.bordered,
      [`${prefixCls}-checkable`]: props.checkable,
      [`${prefixCls}-checked`]: computedChecked.value,
      [`${prefixCls}-custom-color`]: isCustomColor.value,
      [`${prefixCls}-rtl`]: rtl.value,
    },
  ]);

  // ---- Inline style（自定义颜色时通过 CSS 变量传递） ----
  const style = computed(() => {
    if (isCustomColor.value && resolvedColor.value) {
      const styleObj: CSSProperties = {};

      // 文字颜色
      if (finalTextColor.value) {
        styleObj['--sd-tag-color'] = finalTextColor.value;
      }

      // 背景颜色（带透明度）
      styleObj['--sd-tag-bg-color'] = foundation.getBackgroundColor();

      // 边框颜色
      if (!isNil(props.bordered)) {
        styleObj['--sd-tag-border-color'] = resolvedBackgroundColor.value;
      }

      return styleObj;
    }
    return undefined;
  });
</script>
