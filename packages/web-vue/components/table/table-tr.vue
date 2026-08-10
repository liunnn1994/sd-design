<template>
  <RenderTr />
</template>

<script setup lang="ts">
  import type { VNode } from 'vue';
  import { computed, createVNode } from 'vue';

  import type { TableDataWithRaw } from './interface';

  import { getPrefixCls } from '../_utils/global-config';

  defineOptions({ name: 'Tr' });

  const props = withDefaults(
    defineProps<{
      expand?: boolean;
      empty?: boolean;
      checked?: boolean;
      rowIndex?: number;
      record?: TableDataWithRaw;
    }>(),
    {
      expand: false,
      empty: false,
      checked: false,
      record: () => ({}) as TableDataWithRaw,
    },
  );
  const slots = defineSlots<{
    default?: () => VNode[];
    tr?: (props: { rowIndex?: number; record?: unknown }) => VNode[];
  }>();
  const prefixCls = getPrefixCls('table');
  const cls = computed(() => [
    `${prefixCls}-tr`,
    {
      [`${prefixCls}-tr-expand`]: props.expand,
      [`${prefixCls}-tr-empty`]: props.empty,
      [`${prefixCls}-tr-checked`]: props.checked,
    },
  ]);
  const RenderTr = () =>
    createVNode(
      slots.tr?.({ rowIndex: props.rowIndex, record: props.record.raw })[0] ?? 'div',
      { class: cls.value, role: 'row' },
      { default: slots.default },
    );
</script>
