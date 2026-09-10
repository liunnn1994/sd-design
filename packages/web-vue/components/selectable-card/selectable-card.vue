<template>
  <div
    :class="classes"
    :style="rootStyle"
    :data-selected="isSelected"
    :data-variant="variant"
    @click="handleCardClick"
  >
    <input
      :id="inputId"
      :class="`${prefixCls}-input`"
      type="checkbox"
      :aria-label="label"
      :checked="isSelected"
      :disabled="isDisabled"
      @change="handleInputChange"
    />
    <div :class="`${prefixCls}-body`">
      <div v-if="$slots.figure" :class="`${prefixCls}-figure`">
        <slot name="figure" />
      </div>
      <div :class="`${prefixCls}-content`">
        <div v-if="$slots.title || title" :class="`${prefixCls}-title`">
          <slot name="title">{{ title }}</slot>
        </div>
        <div v-if="$slots.value || value" :class="`${prefixCls}-value`">
          <slot name="value">{{ value }}</slot>
        </div>
        <div v-if="$slots.description || description" :class="`${prefixCls}-description`">
          <slot name="description">{{ description }}</slot>
        </div>
        <div v-if="$slots.default" :class="`${prefixCls}-default`">
          <slot />
        </div>
        <div v-if="$slots.actions" :class="`${prefixCls}-actions`">
          <slot name="actions" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import type { CSSProperties } from 'vue';
  import { computed, useId } from 'vue';

  import type { SelectableCardProps, SelectableCardSizeValue } from './types';

  import { getPrefixCls } from '../_utils/global-config';

  defineOptions({ name: 'SelectableCard' });

  const {
    label,
    isSelected,
    isDisabled = false,
    color = 'sdblue',
    variant = 'outline',
    size = 'medium',
    layout = 'vertical',
    align = 'start',
    padding,
    title,
    value,
    description,
    width,
    height,
    maxWidth,
  } = defineProps<SelectableCardProps>();

  const emit = defineEmits<{
    /** @zh 选择状态变化时触发 @en Emitted when the selection state changes */
    change: [isSelected: boolean];
  }>();

  defineSlots<{
    /** @zh 自定义补充内容 @en Custom supplementary content */
    default?: () => unknown;
    /** @zh 图标或图片 @en Icon or image */
    figure?: () => unknown;
    /** @zh 标题 @en Title */
    title?: () => unknown;
    /** @zh 主要值 @en Primary value */
    value?: () => unknown;
    /** @zh 描述 @en Description */
    description?: () => unknown;
    /** @zh 操作区域 @en Actions */
    actions?: () => unknown;
  }>();

  const prefixCls = getPrefixCls('selectable-card');
  const inputId = `selectable-card-${useId()}`;

  const classes = computed(() => [
    prefixCls,
    `${prefixCls}--color-${color}`,
    `${prefixCls}--${variant}`,
    `${prefixCls}--size-${size}`,
    `${prefixCls}--layout-${layout}`,
    `${prefixCls}--align-${align}`,
    {
      [`${prefixCls}--selected`]: isSelected,
      [`${prefixCls}--disabled`]: isDisabled,
    },
  ]);

  function toCssSize(value: SelectableCardSizeValue | undefined, spacing = false) {
    if (value === undefined) return undefined;
    return typeof value === 'number' ? `${spacing ? value * 4 : value}px` : value;
  }

  const rootStyle = computed<CSSProperties>(() => ({
    padding: toCssSize(padding, true),
    width: toCssSize(width),
    height: toCssSize(height),
    maxWidth: toCssSize(maxWidth),
  }));

  function toggle() {
    if (!isDisabled) emit('change', !isSelected);
  }

  function handleCardClick(event: MouseEvent) {
    if (isDisabled) return;

    const target = event.target as HTMLElement;
    if (target.closest('a, button, input, select, textarea, [role="button"]')) return;

    toggle();
  }

  function handleInputChange() {
    toggle();
  }
</script>
