<template>
  <DefineItem v-slot="{ option, index, itemTag }">
    <component
      :is="itemTag"
      :class="`${prefixCls}-item`"
      :role="itemTag === 'span' ? 'listitem' : undefined"
    >
      <slot
        name="item"
        :data="option.raw"
        :option="option.raw"
        :label="resolveOptionLabel(option)"
        :value="option.value"
        :index="index"
        :item-class="`${prefixCls}-item-content`"
        :item-style="undefined"
        :is-overflow="false"
        :measure="false"
      >
        <Tag
          v-bind="option.itemProps"
          :class="`${prefixCls}-item-content`"
          :visible="true"
          :nowrap="true"
        >
          <slot v-if="$slots.label" name="label" :data="option.raw" :option="option.raw" />
          <template v-else>{{ resolveOptionLabel(option) }}</template>
        </Tag>
      </slot>
    </component>
  </DefineItem>

  <DefineCounter v-slot="{ hiddenOptions, itemTag }">
    <Popover v-if="hiddenOptions.length > 0">
      <template #default>
        <component
          :is="itemTag"
          :class="[`${prefixCls}-item`, `${prefixCls}-item-counter`]"
          :role="itemTag === 'span' ? 'listitem' : undefined"
        >
          <slot
            name="counter"
            :label="`+${hiddenOptions.length}`"
            :value="`${OVERFLOW_COUNTER_VALUE}-${hiddenOptions.length}`"
            :hidden-count="hiddenOptions.length"
            :measure="false"
            :counter-class="`${prefixCls}-counter-content`"
          >
            <Tag
              :class="`${prefixCls}-counter-content`"
              :visible="true"
              :nowrap="true"
              :ellipsis="false"
              v-text="`+${hiddenOptions.length}`"
            />
          </slot>
        </component>
      </template>
      <template #content>
        <ul :class="`${prefixCls}-popover`">
          <ReuseItem
            v-for="(option, index) in hiddenOptions"
            :key="`hidden-${option.key}`"
            :option="option"
            :index="visibleCount + index"
            item-tag="li"
          />
        </ul>
      </template>
    </Popover>
  </DefineCounter>

  <span :class="cls">
    <slot v-if="normalizedOptions.length === 0" />
    <WrapClamp
      v-else-if="isResponsiveMaxCount"
      :items="normalizedOptions"
      item-key="key"
      :max-lines="1"
      as="div"
      role="list"
      :class="`${prefixCls}-inner`"
    >
      <template #item="{ item, index }">
        <ReuseItem :option="item" :index="index" item-tag="span" />
      </template>
      <template #after="{ hiddenItems }">
        <ReuseCounter :key="hiddenItems.length" :hidden-options="hiddenItems" item-tag="span" />
      </template>
    </WrapClamp>
    <ul v-else :class="`${prefixCls}-inner`">
      <ReuseItem
        v-for="(option, index) in visibleOptions"
        :key="option.key"
        :option="option"
        :index="index"
        item-tag="li"
      />
      <ReuseCounter :key="hiddenOptions.length" :hidden-options="hiddenOptions" item-tag="li" />
    </ul>
  </span>
</template>

<script setup lang="ts">
  import { computed } from 'vue';

  import { createReusableTemplate } from '@vueuse/core';
  import { isFunction, isString } from 'es-toolkit';
  import { isNumber } from 'es-toolkit/compat';

  import type {
    TagGroupObjectOption,
    TagGroupOption,
    TagGroupOptionLabel,
    TagGroupProps,
  } from './interface';

  import { getPrefixCls } from '../_utils/global-config';
  import { WrapClamp } from '../clamp';
  import Popover from '../popover';
  import Tag from '../tag';

  defineOptions({ name: 'TagGroup' });

  type NormalizedTagGroupOption = {
    key: string;
    label: string | number;
    value: string | number;
    raw: TagGroupObjectOption;
    itemProps: Record<string, unknown>;
  };
  type OptionFieldRecord = Record<string, unknown>;

  const OVERFLOW_COUNTER_VALUE = '__sd_tag_group_more__';
  const props = withDefaults(defineProps<TagGroupProps>(), {
    maxCount: 'responsive',
    options: () => [],
    fieldNames: () => ({}),
  });
  const prefixCls = getPrefixCls('tag-group');
  const [DefineItem, ReuseItem] = createReusableTemplate<{
    option: NormalizedTagGroupOption;
    index: number;
    itemTag: 'li' | 'span';
  }>();
  const [DefineCounter, ReuseCounter] = createReusableTemplate<{
    hiddenOptions: readonly NormalizedTagGroupOption[];
    itemTag: 'li' | 'span';
  }>();
  const isResponsiveMaxCount = computed(() => props.maxCount === 'responsive');
  const cls = computed(() => [
    prefixCls,
    {
      [`${prefixCls}-responsive`]: isResponsiveMaxCount.value,
      [`${prefixCls}-empty`]: props.options.length === 0,
    },
  ]);

  function resolveOptionField<T extends keyof TagGroupObjectOption>(
    option: TagGroupObjectOption,
    field: string,
    fallbackField: T,
  ) {
    const optionRecord = option as OptionFieldRecord;
    return (optionRecord[field] ?? option[fallbackField]) as TagGroupObjectOption[T];
  }
  function normalizeItemProps(
    option: TagGroupObjectOption,
    labelField: string,
    valueField: string,
  ) {
    if (
      option.itemProps &&
      typeof option.itemProps === 'object' &&
      !Array.isArray(option.itemProps)
    ) {
      return option.itemProps;
    }
    return Object.fromEntries(
      Object.entries(option as OptionFieldRecord).filter(
        ([key]) => key !== labelField && key !== valueField && key !== 'itemProps',
      ),
    );
  }
  function normalizeOption(option: TagGroupOption, index: number): NormalizedTagGroupOption {
    const { label = 'label', value = 'value' } = props.fieldNames;
    if (isString(option) || isNumber(option)) {
      return {
        key: `${String(option)}-${index}`,
        label: option,
        value: option,
        raw: { label: option, value: option },
        itemProps: {},
      };
    }
    const normalizedLabel = resolveOptionField(option, label, 'label') as TagGroupOptionLabel;
    const normalizedValue = resolveOptionField(option, value, 'value') as string | number;
    return {
      key: `${String(normalizedValue)}-${index}`,
      label: isFunction(normalizedLabel) ? normalizedLabel() : normalizedLabel,
      value: normalizedValue,
      raw: { ...option, label: normalizedLabel, value: normalizedValue },
      itemProps: normalizeItemProps(option, label, value),
    };
  }
  const normalizedOptions = computed(() =>
    props.options.map((option, index) => normalizeOption(option, index)),
  );
  const visibleCount = computed(() => {
    if (typeof props.maxCount === 'number' && props.maxCount > 0) {
      return Math.min(props.maxCount, normalizedOptions.value.length);
    }
    return normalizedOptions.value.length;
  });
  const visibleOptions = computed(() => normalizedOptions.value.slice(0, visibleCount.value));
  const hiddenOptions = computed(() => normalizedOptions.value.slice(visibleCount.value));
  const resolveOptionLabel = (option: NormalizedTagGroupOption) => {
    const label = option.raw.label;
    return isFunction(label) ? label() : option.label;
  };
</script>
