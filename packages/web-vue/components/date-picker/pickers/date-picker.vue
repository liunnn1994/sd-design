<template>
  <Picker v-bind="{ ...props, ...$attrs }" mode="date">
    <template v-for="(_, name) in $slots" #[name]="slotData">
      <slot :name="name" v-bind="slotData ?? {}" />
    </template>
  </Picker>
</template>

<script setup lang="ts">
  import type { PropType } from 'vue';

  import type { TimePickerProps } from '../../time-picker/interface';
  import type { DisabledTimeProps, WeekStart } from '../interface';

  import Picker from '../picker.vue';

  defineOptions({
    name: 'DatePicker',
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
     * @en Display the format of the date, refer to [String Parsing Format](#string-parsing-format)
     */
    format: {
      type: [String, Function] as PropType<string | ((current: Date) => string)>,
    },
    /**
     * @zh 每周的第一天开始于周几，0 - 周日，1 - 周一，以此类推。
     * @en The first day of the week starts on the day of the week, 0-Sunday, 1-Monday, and so on.
     * @type 0 | 1 | 2 | 3 | 4 | 5 | 6
     * @version 2-6 from 2.21.0
     */
    dayStartOfWeek: {
      type: Number as PropType<WeekStart>,
      default: 0,
    },
    /**
     * @zh 是否增加时间选择
     * @en Whether to increase time selection
     */
    showTime: Boolean,
    /**
     * @zh 时间显示的参数，参考 [TimePickerProps](/vue/component/time-picker)
     * @en Time display parameters, refer to [TimePickerProps](/vue/component/time-picker)
     */
    timePickerProps: Object as PropType<Partial<TimePickerProps>>,
    /**
     * @zh 是否禁用
     * @en Whether to disable
     */
    disabled: Boolean,
    /**
     * @zh 不可选取的日期
     * @en Unselectable date
     */
    disabledDate: Function as PropType<(current?: Date) => boolean>,
    /**
     * @zh 不可选取的时间
     * @en Unselectable time
     */
    disabledTime: Function as PropType<(current: Date) => DisabledTimeProps>,
    /**
     * @zh 是否显示 `showTime` 时，选择当前时间的按钮
     * @en Whether to display `showTime`, select the button of the current time
     */
    showNowBtn: {
      type: Boolean,
      default: true,
    },
    /**
     * @zh 宽度是否适应文字内容
     * @en Whether the width adapts to the text content
     */
    fitWidth: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 最大宽度是否限制为父容器宽度
     * @en Whether the maximum width is limited to the parent container width
     */
    maxWFull: {
      type: Boolean,
      default: true,
    },
  });
</script>
