<template>
  <Tooltip v-bind="mergedTooltipProps">
    <component
      :is="renderComponent"
      v-bind="{ ...triggerProps, ...attrs }"
      :disabled="isDisabled"
      :class="componentClass"
      :aria-label="
        (attrs['aria-label'] as string | undefined) ?? (hasTextSlot ? undefined : mergedTooltip)
      "
      @click="handleCopy"
    >
      <template #icon>
        <slot name="icon">
          <IconCheck v-if="copied" :class="`${prefixCls}-feedback`" />
          <IconCopy v-else />
        </slot>
      </template>
      <slot />
    </component>
  </Tooltip>
</template>

<script setup lang="ts">
  import { computed, onBeforeUnmount, onBeforeUpdate, shallowRef, useAttrs, useSlots } from 'vue';

  import copy from '@sdata/web-core/clipboard';
  import { createCopyFoundation, getCopyDisabled } from '@sdata/web-core/copy/foundation';

  import type { CopyComponentType, CopyProps } from './types';

  import { getPrefixCls } from '../_utils/global-config';
  import pick from '../_utils/pick';
  import Button from '../button';
  import IconCheck from '../icon/icon-check';
  import IconCopy from '../icon/icon-copy';
  import Link from '../link';
  import { useI18n } from '../locale';
  import Message from '../message';
  import Tooltip from '../tooltip';

  defineOptions({
    name: 'Copy',
    inheritAttrs: false,
  });

  const props = withDefaults(defineProps<CopyProps>(), {
    content: '',
    tooltip: undefined,
    tooltipProps: undefined,
    clipboardProps: undefined,
    component: 'link',
    textInherit: true,
    successMessage: undefined,
    ellipsis: undefined,
    ellipsisTooltip: undefined,
  });

  const emit = defineEmits<{
    /**
     * @zh 复制成功后触发
     * @en Emitted after content is copied
     */
    copy: [value: string];
  }>();

  const attrs = useAttrs();
  const slots = useSlots();
  const hasTextSlot = shallowRef(Boolean(slots.default));
  onBeforeUpdate(() => {
    hasTextSlot.value = Boolean(slots.default);
  });
  const { t } = useI18n();
  const prefixCls = getPrefixCls('copy');
  const copied = shallowRef(false);
  const componentMap: Record<CopyComponentType, typeof Link | typeof Button> = {
    link: Link,
    button: Button,
  };

  const renderComponent = computed(() => componentMap[props.component]);
  const triggerProps = computed(() =>
    props.component === 'button'
      ? pick(props, [
          'type',
          'shape',
          'status',
          'size',
          'long',
          'loading',
          'loadingFixedWidth',
          'htmlType',
          'autofocus',
          'href',
        ])
      : pick(props, [
          'href',
          'status',
          'hoverable',
          'icon',
          'ellipsis',
          'ellipsisLineClamp',
          'ellipsisExpandTrigger',
          'ellipsisTooltip',
          'iconTooltip',
          'loading',
        ]),
  );
  const componentClass = computed(() => [
    prefixCls,
    { [`${prefixCls}-inherit`]: props.component === 'link' && props.textInherit },
  ]);
  const isDisabled = computed(() => {
    const disabled =
      (props as CopyProps & { disabled?: boolean | string }).disabled ?? attrs.disabled;

    return getCopyDisabled(disabled);
  });
  // 默认 tooltip/successMessage 走 locale，消费方显式传入时优先
  const mergedTooltip = computed(
    () => props.tooltip ?? t(copied.value ? 'copy.copied' : 'copy.copy'),
  );
  const mergedSuccessMessage = computed(() => props.successMessage ?? t('copy.copied'));
  const mergedTooltipProps = computed(() => ({
    ...props.tooltipProps,
    content: props.tooltipProps?.content ?? mergedTooltip.value,
  }));

  const foundation = createCopyFoundation(
    {
      props,
      get isDisabled() {
        return isDisabled.value;
      },
      get copied() {
        return copied.value;
      },
      set copied(value) {
        copied.value = value;
      },
    },
    {
      copy,
      success: () => Message.success(mergedSuccessMessage.value),
      copied: (content) => emit('copy', content),
    },
  );
  const { handleCopy } = foundation;
  onBeforeUnmount(foundation.dispose);
</script>
