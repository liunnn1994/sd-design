<template>
  <div role="list" :aria-label="t('a11y.steps')" :class="cls">
    <slot />
  </div>
</template>

<script setup lang="ts">
  import { computed, PropType, provide, reactive, ref, toRefs } from 'vue';

  import { createSteps } from '@sdata/web-core/steps/foundation';

  import { Direction } from '../_utils/constant';
  import { getPrefixCls } from '../_utils/global-config';
  import { useI18n } from '../locale';
  import { stepsInjectionKey } from './context';
  import { StepData, StepStatus, StepsType } from './interface';

  defineOptions({ name: 'Steps' });

  const props = defineProps({
    /**
     * @zh 步骤条的类型
     * @en The type of the steps
     * @values 'default', 'arrow', 'dot', 'navigation'
     */
    type: {
      type: String as PropType<StepsType>,
      default: 'default',
    },
    /**
     * @zh 步骤条的显示方向
     * @en The direction of the steps
     * @values 'horizontal', 'vertical'
     */
    direction: {
      type: String as PropType<Direction>,
      default: 'horizontal',
    },
    /**
     * @zh 标签描述文字放置的位置
     * @en The location where the label description is placed.
     * @values 'horizontal', 'vertical'
     */
    labelPlacement: {
      type: String as PropType<Direction>,
      default: 'horizontal',
    },
    /**
     * @zh 当前步骤数
     * @en Number of current step
     * @vModel
     */
    current: {
      type: Number,
      default: undefined,
    },
    /**
     * @zh 默认的步骤数（非受控状态）
     * @en The default number of step (uncontrolled state)
     */
    defaultCurrent: {
      type: Number,
      default: 1,
    },
    /**
     * @zh 当前步骤的状态
     * @en The status of the current step
     * @values 'wait', 'process', 'finish', 'error'
     */
    status: {
      type: String as PropType<StepStatus>,
      default: 'process',
    },
    /**
     * @zh 是否使用无连接线样式
     * @en Whether to use the connectionless style
     */
    lineLess: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 是否使用小型步骤条
     * @en Whether to use a small step bar
     */
    small: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 是否可以点击切换
     * @en Whether you can click to switch
     */
    changeable: {
      type: Boolean,
      default: false,
    },
  });

  const emit = defineEmits<{
    'update:current': [_step: number];
    /**
     * @zh 步骤数发生改变时触发
     * @en Triggered when the number of steps changes
     * @param {number} step
     * @param {Event} ev
     */
    'change': [_step: number, _ev: Event];
  }>();

  const { type, lineLess } = toRefs(props);
  const { t } = useI18n();

  const prefixCls = getPrefixCls('steps');
  const _current = ref(props.defaultCurrent);
  const computedCurrent = computed(() => props.current ?? _current.value);

  const stepMap = reactive(new Map<number, StepData>());
  const foundation = createSteps({
    props,
    get current() {
      return computedCurrent.value;
    },
    registry: stepMap,
    setInner(value) {
      _current.value = value;
    },
    onUpdate: (step) => emit('update:current', step),
    onChange: (step, event) => emit('change', step, event),
  });
  const computedDirection = computed(foundation.direction);
  const computedLabelPlacement = computed(foundation.labelPlacement);
  const getStatus = foundation.status;
  const handleClick = foundation.click;
  const errorSteps = computed(foundation.errors);
  const addItem = foundation.add;
  const removeItem = foundation.remove;

  const cls = computed(() => [
    prefixCls,
    `${prefixCls}-${computedDirection.value}`,
    `${prefixCls}-label-${computedLabelPlacement.value}`,
    `${prefixCls}-mode-${type.value}`,
    {
      [`${prefixCls}-changeable`]: props.changeable,
      [`${prefixCls}-size-small`]: props.small && props.type !== 'dot',
      [`${prefixCls}-line-less`]: lineLess.value,
    },
  ]);

  provide(
    stepsInjectionKey,
    reactive({
      type,
      direction: computedDirection,
      labelPlacement: computedLabelPlacement,
      lineLess,
      current: computedCurrent,
      errorSteps,
      changeable: computed(() => props.changeable),
      getStatus,
      addItem,
      removeItem,
      onClick: handleClick,
      parentCls: prefixCls,
    }),
  );
</script>
