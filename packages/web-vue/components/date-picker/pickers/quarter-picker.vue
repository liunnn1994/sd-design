<template>
  <Picker v-bind="{ ...props, ...$attrs }" mode="quarter">
    <template v-for="(_, name) in $slots" #[name]="slotData">
      <slot :name="name" v-bind="slotData ?? {}" />
    </template>
  </Picker>
</template>

<script setup lang="ts">
  import type { PropType } from 'vue';

  import Picker from '../picker.vue';

  defineOptions({
    name: 'QuarterPicker',
    inheritAttrs: false,
  });

  const props = defineProps({
    /**
     * @zh 绑定值
     * @en Value
     */
    modelValue: {
      type: [Object, String, Number] as PropType<Date | string | number>,
    },
    /**
     * @zh 默认值
     * @en Default value
     */
    defaultValue: {
      type: [Object, String, Number] as PropType<Date | string | number>,
    },
    /**
     * @zh 展示日期的格式，参考[字符串解析格式](#字符串解析格式)
     * @en Display the format of the date, refer to [String Parsing Format](#String Parsing Format)
     */
    format: {
      type: String,
      default: 'YYYY-[Q]Q',
    },
    /**
     * @zh 值的格式，对 `value` `defaultValue` `pickerValue` `defaultPickerValue` 以及事件中的返回值生效，支持设置为时间戳，Date 和字符串（参考[字符串解析格式](#字符串解析格式)）。
     * @en The format of the value, valid for `value` `defaultValue` `pickerValue` `defaultPickerValue` and the return value in the event, supports setting as timestamp, Date and string (refer to [String parsing format](#string-parsing-format) ).
     * @version 2.16.0
     */
    valueFormat: {
      type: String,
      default: 'YYYY-MM',
    },
  });
</script>
