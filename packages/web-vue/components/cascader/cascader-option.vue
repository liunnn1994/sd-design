<template>
  <DefineEllipsis v-slot="{ label }">
    <template v-if="cascaderCtx.ellipsis === false">{{ label }}</template>
    <PerformantEllipsis v-else-if="cascaderCtx.ellipsis === 'performant-ellipsis'">
      {{ label }}
    </PerformantEllipsis>
    <Ellipsis v-else>{{ label }}</Ellipsis>
  </DefineEllipsis>

  <li v-bind="$attrs">
    <button
      type="button"
      :disabled="option.disabled"
      :aria-haspopup="!option.isLeaf"
      :aria-expanded="!option.isLeaf && active"
      :title="option.label"
      :class="cls"
      @mouseenter="handleMouseenter"
      @mouseleave="handleMouseleave"
      @click="handleClick"
    >
      <Checkbox
        v-if="multiple"
        :model-value="checkedStatus.checked"
        :indeterminate="checkedStatus.indeterminate"
        :disabled="option.disabled || option.selectionDisabled"
        uninject-group-context
        @change="handleCheckboxChange"
        @click.stop
      />
      <Radio
        v-if="checkStrictly && !multiple"
        :model-value="cascaderCtx.valueMap?.has(option.key)"
        :disabled="option.disabled"
        uninject-group-context
        @change="handleRadioChange"
        @click.stop
      />
      <div :class="`${prefixCls}-label`">
        <ReuseEllipsis v-if="pathLabel" :label="pathOptionLabel" />
        <component
          :is="cascaderCtx.slots.option"
          v-else-if="cascaderCtx.slots?.option"
          :data="option"
        />
        <ReuseEllipsis v-else :label="option.label" />
        <IconLoading v-if="isLoading" />
        <IconRight v-else-if="!searchOption && !option.isLeaf" />
      </div>
    </button>
  </li>
</template>

<script setup lang="ts">
  import { computed, inject, ref, toRef, type PropType } from 'vue';

  import { createReusableTemplate } from '@vueuse/core';

  import type { CascaderOption, CascaderOptionInfo } from './interface';

  import { getPrefixCls } from '../_utils/global-config';
  import { isFunction } from '../_utils/is';
  import Checkbox from '../checkbox';
  import Ellipsis, { PerformantEllipsis } from '../ellipsis';
  import IconLoading from '../icon/icon-loading';
  import IconRight from '../icon/icon-right';
  import Radio from '../radio';
  import { type CascaderContext, cascaderInjectionKey } from './context';
  import { getCheckedStatus, getOptionLabel } from './utils';

  defineOptions({
    name: 'CascaderOption',
    inheritAttrs: false,
  });

  const props = defineProps({
    option: {
      type: Object as PropType<CascaderOptionInfo>,
      required: true,
    },
    active: Boolean,
    multiple: Boolean,
    checkStrictly: Boolean,
    searchOption: Boolean,
    pathLabel: Boolean,
  });

  const option = toRef(props, 'option');
  const prefixCls = getPrefixCls('cascader-option');
  const cascaderCtx = inject<Partial<CascaderContext>>(cascaderInjectionKey, {});
  const isLoading = ref(false);
  const [DefineEllipsis, ReuseEllipsis] = createReusableTemplate<{ label: string }>();
  const cls = computed(() => [
    prefixCls,
    {
      [`${prefixCls}-active`]: props.active,
      [`${prefixCls}-disabled`]: option.value.disabled,
    },
  ]);
  const checkedStatus = computed(() => {
    if (props.checkStrictly) {
      return {
        checked: cascaderCtx.valueMap?.has(option.value.key),
        indeterminate: false,
      };
    }
    return getCheckedStatus(option.value, cascaderCtx.valueMap);
  });
  const pathOptionLabel = computed(
    () =>
      cascaderCtx.formatLabel?.(option.value.path.map((item) => item.raw)) ??
      getOptionLabel(option.value, { separator: cascaderCtx.separator }),
  );

  function handlePathChange() {
    if (isFunction(cascaderCtx.loadMore) && !option.value.isLeaf) {
      const { isLeaf, children, key } = option.value;
      if (!isLeaf && !children) {
        isLoading.value = true;
        new Promise<CascaderOption[] | undefined>((resolve) => {
          cascaderCtx.loadMore?.(option.value.raw, resolve);
        }).then((children) => {
          isLoading.value = false;
          if (children) {
            cascaderCtx.addLazyLoadOptions?.(children, key);
          }
        });
      }
    }
    cascaderCtx.setSelectedPath?.(option.value.key);
  }

  function handleMouseenter() {
    if (option.value.disabled) return;
    cascaderCtx.setActiveKey?.(option.value.key);
    if (cascaderCtx.expandTrigger === 'hover') {
      handlePathChange();
    }
  }

  function handleMouseleave() {
    if (!option.value.disabled) {
      cascaderCtx.setActiveKey?.();
    }
  }

  function handleClick() {
    if (option.value.disabled) return;
    if (cascaderCtx.expandTrigger !== 'hover') {
      handlePathChange();
    }
    if (option.value.isLeaf && !props.multiple) {
      cascaderCtx.onClickOption?.(option.value);
    }
  }

  function handleCheckboxChange(_value: unknown, event: Event) {
    event.stopPropagation();
    handlePathChange();
    cascaderCtx.onClickOption?.(option.value, !checkedStatus.value.checked);
  }

  function handleRadioChange(_value: unknown, event: Event) {
    event.stopPropagation();
    handlePathChange();
    cascaderCtx.onClickOption?.(option.value, true);
  }
</script>
