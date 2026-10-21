<template>
  <Panel v-bind="$attrs" is-range :value="displayValue" @select="onSelect" @confirm="onConfirm">
    <template v-for="(_, name) in $slots" #[name]="slotData">
      <slot :name="name" v-bind="slotData ?? {}" />
    </template>
  </Panel>
</template>

<script setup lang="ts">
  import type { Dayjs } from 'dayjs';

  import { computed, type PropType, ref, watch } from 'vue';

  import { createTimeRangePanel } from '@sdata/web-core/time-picker/panel';

  import type { RangePanelProps } from './interface';

  import Panel from './panel.vue';

  defineOptions({
    name: 'TimePickerRangePanel',
    inheritAttrs: false,
  });

  const props = defineProps({
    value: {
      type: Array as PropType<RangePanelProps['value']>,
    },
    displayIndex: {
      type: Number,
      default: 0,
    },
  });

  const emit = defineEmits<{
    'select': [value: Array<Dayjs | undefined>];
    'confirm': [value: RangePanelProps['value']];
    'update:displayIndex': [value: number];
    'display-index-change': [value: number];
  }>();

  const localDisplayIndex = ref(props.displayIndex);
  watch(
    () => props.displayIndex,
    (displayIndex) => {
      localDisplayIndex.value = displayIndex;
    },
  );

  const displayValue = computed(() => props.value?.[localDisplayIndex.value]);

  const { select: onSelect, confirm: onConfirm } = createTimeRangePanel({
    getValue: () => props.value,
    getIndex: () => localDisplayIndex.value,
    setIndex: (index) => {
      localDisplayIndex.value = index;
    },
    onSelect: (value) => emit('select', value),
    onConfirm: (value) => emit('confirm', value),
    onIndexChange: (index) => emit('display-index-change', index),
    onUpdateIndex: (index) => emit('update:displayIndex', index),
  });
</script>
