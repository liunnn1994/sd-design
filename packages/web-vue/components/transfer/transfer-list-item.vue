<template>
  <DefineItemContent>
    <component
      :is="transferCtx?.slots.item"
      v-if="transferCtx?.slots.item"
      :label="data.label"
      :value="data.value"
    />
    <template v-else>{{ data.label }}</template>
  </DefineItemContent>

  <div :class="cls" v-bind="$attrs" @click="handleClick">
    <span v-if="allowClear || simple" :class="`${prefixCls}-content`">
      <ReuseItemContent />
    </span>
    <Checkbox
      v-else
      :class="[`${prefixCls}-content`, `${prefixCls}-checkbox`]"
      :model-value="transferCtx?.selected"
      :value="data.value"
      :disabled="disabled"
      uninject-group-context
      @change="handleChange"
    >
      <ReuseItemContent />
    </Checkbox>
    <span
      v-if="allowClear && !disabled"
      :class="`${prefixCls}-remove-btn`"
      role="button"
      tabindex="0"
      :aria-label="t('a11y.remove')"
      @click="handleRemove"
      @keydown="handleRemoveKeydown"
    >
      <IconHover>
        <IconClose />
      </IconHover>
    </span>
  </div>
</template>

<script setup lang="ts">
  import { computed, inject, type PropType } from 'vue';

  import { createReusableTemplate } from '@vueuse/core';

  import type { TransferItem } from './interface';

  import IconHover from '../_components/icon-hover.vue';
  import { getPrefixCls } from '../_utils/global-config';
  import { isActivationKey } from '../_utils/keyboard';
  import Checkbox from '../checkbox';
  import IconClose from '../icon/icon-close';
  import { useI18n } from '../locale';
  import { transferInjectionKey } from './context';

  defineOptions({
    name: 'TransferListItem',
    inheritAttrs: false,
  });

  const props = defineProps({
    type: String as PropType<'source' | 'target'>,
    data: {
      type: Object as PropType<TransferItem>,
      required: true,
    },
    allowClear: Boolean,
    disabled: Boolean,
    draggable: Boolean,
    simple: Boolean,
  });

  const { t } = useI18n();
  const prefixCls = getPrefixCls('transfer-list-item');
  const transferCtx = inject(transferInjectionKey, undefined);
  const [DefineItemContent, ReuseItemContent] = createReusableTemplate();

  const cls = computed(() => [
    prefixCls,
    {
      [`${prefixCls}-disabled`]: props.disabled,
      [`${prefixCls}-draggable`]: props.draggable,
    },
  ]);

  const handleClick = () => {
    if (props.simple && !props.disabled) {
      transferCtx?.moveTo([props.data.value], props.type === 'target' ? 'source' : 'target');
    }
  };

  const handleChange = (value: unknown) => {
    transferCtx?.onSelect(value as string[]);
  };

  const handleRemove = () => {
    transferCtx?.moveTo([props.data.value], 'source');
  };

  const handleRemoveKeydown = (event: KeyboardEvent) => {
    if (isActivationKey(event)) {
      event.preventDefault();
      handleRemove();
    }
  };
</script>
