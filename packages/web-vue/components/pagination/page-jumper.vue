<template>
  <span :class="cls">
    <span v-if="!simple" :class="[`${prefixCls}-prepend`, `${prefixCls}-text-goto`]">
      <slot name="jumper-prepend">{{ t('pagination.goto') }}</slot>
    </span>
    <input-number
      v-model="inputValue"
      :class="`${prefixCls}-input`"
      :min="1"
      :max="jumperMax"
      :size="size"
      :disabled="disabled"
      hide-button
      :formatter="handleFormatter"
      @change="handleChange"
    />
    <span v-if="$slots['jumper-append']" :class="`${prefixCls}-append`"
      ><slot name="jumper-append"
    /></span>
    <template v-if="simple">
      <span :class="`${prefixCls}-separator`">/</span>
      <span :class="`${prefixCls}-total-page`">{{ pages }}</span>
    </template>
  </span>
</template>

<script setup lang="ts">
  import { computed, nextTick, PropType, ref, watch } from 'vue';

  import { createPageJumperFoundation, formatPageJumper } from '@sdata/web-core/pagination/jumper';

  import type { Size } from '../_utils/constant';
  import type { InputNumberValue } from '../input-number';

  import { getPrefixCls } from '../_utils/global-config';
  import InputNumber from '../input-number';
  import { useI18n } from '../locale';

  defineOptions({ name: 'PageJumper' });

  const props = defineProps({
    current: {
      type: Number,
      required: true,
    },
    simple: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    pages: {
      type: Number,
      required: true,
    },
    size: {
      type: String as PropType<Size>,
    },
    onChange: {
      type: Function as PropType<(value: number) => void>,
    },
  });

  const emit = defineEmits<{ change: [_value: number] }>();

  const prefixCls = getPrefixCls('pagination-jumper');
  const { t } = useI18n();
  const inputValue = ref<Exclude<InputNumberValue, null>>(props.simple ? props.current : undefined);

  // total=0 时 pages=0，min=1/max=0 是不可能区间；钳到至少 1，保证 jumper 始终可用
  const jumperMax = computed(() => Math.max(props.pages, 1));

  const handleFormatter = formatPageJumper;
  const foundation = createPageJumperFoundation({
    get simple() {
      return props.simple;
    },
    get value() {
      return inputValue.value;
    },
    setValue: (value) => {
      inputValue.value = value;
    },
    onChange: (value) => emit('change', value),
    defer: (callback) => {
      void nextTick(callback);
    },
  });
  const handleChange = foundation.change;
  watch(() => props.current, foundation.sync);

  const cls = computed(() => [
    prefixCls,
    {
      [`${prefixCls}-simple`]: props.simple,
    },
  ]);
</script>
