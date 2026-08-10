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

  import type { RangePanelProps } from './interface';

  import { isUndefined } from '../_utils/is';
  import Panel from './panel.vue';
  import { isValidRangeValue } from './utils';

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

  const onSelect = (selectedValue: Dayjs) => {
    const newValue = isUndefined(props.value) ? [] : [...props.value];
    newValue[localDisplayIndex.value] = selectedValue;
    emit('select', newValue);
  };

  const onConfirm = () => {
    if (!isValidRangeValue(props.value)) {
      const newIndex = (localDisplayIndex.value + 1) % 2;
      localDisplayIndex.value = newIndex;
      emit('display-index-change', newIndex);
      emit('update:displayIndex', newIndex);
    } else {
      emit('confirm', props.value);
    }
  };
</script>
