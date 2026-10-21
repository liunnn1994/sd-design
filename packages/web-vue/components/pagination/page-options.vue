<template>
  <span :class="prefixCls">
    <Select
      :model-value="modelValue"
      :options="options"
      :size="size"
      v-bind="selectProps"
      :disabled="disabled || selectProps?.disabled"
      :allow-clear="false"
      @change="handleChange"
    />
  </span>
</template>

<script setup lang="ts">
  import { computed, PropType } from 'vue';

  import { createPageOptionsFoundation } from '@sdata/web-core/pagination/items';

  import type { Size } from '../_utils/constant';
  import type { SelectOption } from '../select/interface';
  import type { PaginationSelectProps } from './interface';

  import { getPrefixCls } from '../_utils/global-config';
  import { useI18n } from '../locale';
  import Select from '../select';

  defineOptions({ name: 'PageOptions' });

  const props = defineProps({
    sizeOptions: {
      type: Array as PropType<number[]>,
      required: true,
    },
    pageSize: Number as PropType<number | undefined>,
    disabled: Boolean,
    size: {
      type: String as PropType<Size>,
    },
    onChange: {
      type: Function as PropType<(value: number) => void>,
    },
    selectProps: {
      type: Object as PropType<PaginationSelectProps>,
    },
  });

  const emit = defineEmits<{ change: [_value: number] }>();

  const prefixCls = getPrefixCls('pagination-options');
  const { t } = useI18n();
  const foundation = createPageOptionsFoundation(
    props,
    () => t('pagination.countPerPage'),
    (value) => emit('change', value),
  );
  const modelValue = computed<number | undefined>(foundation.getModelValue);
  const options = computed<SelectOption[]>(foundation.getOptions);
  const { handleChange } = foundation;
</script>
