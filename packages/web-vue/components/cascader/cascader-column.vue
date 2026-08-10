<template>
  <DefineOption v-slot="{ item }">
    <CascaderOption
      :option="item"
      :active="selectedPath.includes(item.key) || item.key === activeKey"
      :multiple="multiple"
      :check-strictly="checkStrictly"
    />
  </DefineOption>

  <div :class="`${prefixCls}-panel-column`" :style="{ zIndex: totalLevel - level }" v-bind="$attrs">
    <Scrollbar v-if="column.length === 0" :class="`${prefixCls}-column-content`">
      <div :class="`${prefixCls}-list-empty`">
        <slot v-if="$slots.empty" name="empty" />
        <component
          :is="configCtx.slots.empty"
          v-else-if="configCtx?.slots.empty"
          component="cascader"
        />
        <Empty v-else />
      </div>
    </Scrollbar>
    <VirtualList
      v-else-if="isVirtual"
      :key="column.length"
      ref="virtualListRef"
      v-bind="virtualListProps"
      :items="column"
    >
      <template #item="{ item }">
        <ReuseOption :item="item" />
      </template>
    </VirtualList>
    <Scrollbar v-else :class="`${prefixCls}-column-content`">
      <ul
        role="menu"
        :class="[
          `${prefixCls}-list`,
          {
            [`${prefixCls}-list-multiple`]: Boolean(multiple),
            [`${prefixCls}-list-strictly`]: Boolean(checkStrictly),
          },
        ]"
      >
        <ReuseOption v-for="item in column" :key="item.key" :item="item" />
      </ul>
    </Scrollbar>
  </div>
</template>

<script setup lang="ts">
  import { inject, ref, type PropType } from 'vue';

  import { createReusableTemplate } from '@vueuse/core';

  import type { VirtualListProps } from '../_components/virtual-list/interface';
  import type { CascaderOptionInfo } from './interface';

  import VirtualList from '../_components/virtual-list';
  import { getPrefixCls } from '../_utils/global-config';
  import { configProviderInjectionKey } from '../config-provider/context';
  import Empty from '../empty';
  import Scrollbar from '../scrollbar';
  import CascaderOption from './cascader-option.vue';

  defineOptions({
    name: 'CascaderColumn',
    inheritAttrs: false,
  });

  const props = defineProps({
    column: {
      type: Array as PropType<CascaderOptionInfo[]>,
      required: true,
    },
    level: {
      type: Number,
      default: 0,
    },
    selectedPath: {
      type: Array as PropType<string[]>,
      required: true,
    },
    activeKey: String,
    totalLevel: {
      type: Number,
      required: true,
    },
    multiple: Boolean,
    checkStrictly: Boolean,
    virtualListProps: Object as PropType<VirtualListProps>,
  });

  const prefixCls = getPrefixCls('cascader');
  const configCtx = inject(configProviderInjectionKey, undefined);
  const virtualListRef = ref<InstanceType<typeof VirtualList>>();
  const isVirtual = ref(Boolean(props.virtualListProps));
  const [DefineOption, ReuseOption] = createReusableTemplate<{
    item: CascaderOptionInfo;
  }>();
</script>
