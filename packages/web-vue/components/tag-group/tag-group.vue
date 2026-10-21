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
    <Popover v-if="hiddenOptions.length > 0" :trigger="['hover', 'focus']">
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
              tabindex="0"
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

  import {
    createTagGroupFoundation,
    OVERFLOW_COUNTER_VALUE,
  } from '@sdata/web-core/tag-group/foundation';
  import { createReusableTemplate } from '@vueuse/core';

  import type { EllipsisTooltipProps } from '../ellipsis';
  import type { TagGroupObjectOption, TagGroupProps } from './interface';

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

  const foundation = createTagGroupFoundation<EllipsisTooltipProps>({
    get options() {
      return props.options;
    },
    get fieldNames() {
      return props.fieldNames;
    },
    get maxCount() {
      return props.maxCount;
    },
    get normalizedOptions(): NormalizedTagGroupOption[] {
      return normalizedOptions.value;
    },
    get visibleCount(): number {
      return visibleCount.value;
    },
  });
  const normalizedOptions = computed<NormalizedTagGroupOption[]>(foundation.getNormalizedOptions);
  const visibleCount = computed(foundation.getVisibleCount);
  const visibleOptions = computed(foundation.getVisibleOptions);
  const hiddenOptions = computed(foundation.getHiddenOptions);
  const { resolveOptionLabel } = foundation;
</script>
