<template>
  <Scrollbar :class="[`${prefixCls}-panel`, `${prefixCls}-search-panel`]">
    <Spin v-if="loading" v-bind="spinProps" />
    <div v-else-if="options.length === 0" :class="`${prefixCls}-list-empty`">
      <slot v-if="$slots.empty" name="empty" />
      <component
        :is="configCtx.slots.empty"
        v-else-if="configCtx?.slots.empty"
        component="cascader"
      />
      <Empty v-else />
    </div>
    <ul
      v-else
      role="menu"
      :class="[
        `${prefixCls}-list`,
        `${prefixCls}-search-list`,
        {
          [`${prefixCls}-list-multiple`]: multiple,
        },
      ]"
    >
      <CascaderOption
        v-for="item in options"
        :key="item.key"
        :class="`${prefixCls}-search-option`"
        :option="item"
        :active="item.key === activeKey"
        :multiple="multiple"
        :check-strictly="checkStrictly"
        :path-label="pathLabel"
        search-option
      />
    </ul>
  </Scrollbar>
</template>

<script setup lang="ts">
  import { inject, type PropType } from 'vue';

  import type { SpinProps } from '../spin';
  import type { CascaderOptionInfo } from './interface';

  import { getPrefixCls } from '../_utils/global-config';
  import { configProviderInjectionKey } from '../config-provider/context';
  import Empty from '../empty';
  import Scrollbar from '../scrollbar';
  import Spin from '../spin';
  import CascaderOption from './cascader-option.vue';

  defineOptions({ name: 'CascaderSearchPanel' });

  defineProps({
    options: {
      type: Array as PropType<CascaderOptionInfo[]>,
      required: true,
    },
    loading: Boolean,
    spinProps: Object as PropType<SpinProps>,
    activeKey: String,
    multiple: Boolean,
    checkStrictly: Boolean,
    pathLabel: Boolean,
  });

  const prefixCls = getPrefixCls('cascader');
  const configCtx = inject(configProviderInjectionKey, undefined);
</script>
