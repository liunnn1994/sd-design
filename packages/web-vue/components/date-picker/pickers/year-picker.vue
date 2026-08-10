<template>
  <Picker v-bind="{ ...props, ...$attrs }" mode="year">
    <template v-for="(_, name) in $slots" #[name]="slotData">
      <slot :name="name" v-bind="slotData ?? {}" />
    </template>
  </Picker>
</template>

<script setup lang="ts">
  import type { PropType } from 'vue';

  import Picker from '../picker.vue';

  defineOptions({
    name: 'YearPicker',
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
      default: 'YYYY',
    },
  });
</script>
