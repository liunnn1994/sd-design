<template>
  <TransitionGroup
    tag="div"
    name="cascader-slide"
    :class="[
      `${prefixCls}-panel`,
      {
        [`${prefixCls}-dropdown-panel`]: dropdown,
      },
    ]"
  >
    <div
      v-if="loading"
      key="panel-column-loading"
      :class="[`${prefixCls}-panel-column`, `${prefixCls}-panel-column-loading`]"
    >
      <Spin v-bind="spinProps" />
    </div>
    <div
      v-else-if="displayColumns.length === 0"
      key="panel-column-empty"
      :class="`${prefixCls}-panel-column`"
    >
      <div :class="`${prefixCls}-list-empty`">
        <slot v-if="$slots.empty" name="empty" />
        <component
          :is="configCtx.slots.empty"
          v-else-if="configCtx?.slots.empty"
          component="cascader"
        />
        <Empty v-else />
      </div>
    </div>
    <CascaderColumn
      v-for="(column, index) in displayColumns"
      v-else
      :key="`column-${index}`"
      :column="column"
      :level="index"
      :selected-path="selectedPath"
      :active-key="activeKey"
      :total-level="totalLevel"
      :multiple="multiple"
      :check-strictly="checkStrictly"
      :virtual-list-props="virtualListProps"
    >
      <template v-if="$slots.empty" #empty>
        <slot name="empty" />
      </template>
    </CascaderColumn>
  </TransitionGroup>
</template>

<script setup lang="ts">
  import { inject, type PropType } from 'vue';

  import type { VirtualListProps } from '../_components/virtual-list/interface';
  import type { SpinProps } from '../spin';
  import type { CascaderOptionInfo } from './interface';

  import { getPrefixCls } from '../_utils/global-config';
  import { configProviderInjectionKey } from '../config-provider/context';
  import Empty from '../empty';
  import Spin from '../spin';
  import CascaderColumn from './cascader-column.vue';

  defineOptions({ name: 'BaseCascaderPanel' });

  defineProps({
    displayColumns: {
      type: Array as PropType<CascaderOptionInfo[][]>,
      required: true,
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
    loading: Boolean,
    spinProps: Object as PropType<SpinProps>,
    dropdown: Boolean,
    virtualListProps: Object as PropType<VirtualListProps>,
  });

  const prefixCls = getPrefixCls('cascader');
  const configCtx = inject(configProviderInjectionKey, undefined);
</script>
