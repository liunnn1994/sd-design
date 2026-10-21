<template>
  <div
    ref="itemRef"
    :class="cls"
    role="listitem"
    :aria-current="stepNumber === stepsCtx?.current ? 'step' : undefined"
    :aria-disabled="props.disabled || undefined"
    :tabindex="stepsCtx?.changeable && !props.disabled ? 0 : undefined"
    @click="handleClick"
    @keydown="onKeydown"
  >
    <div v-if="showTail" :class="`${prefixCls}-tail`" />
    <div v-if="type !== 'arrow'" :class="`${prefixCls}-node`">
      <slot name="node" :step="stepNumber" :status="computedStatus">
        <div v-if="type !== 'dot'" :class="iconCls">
          <slot name="icon" :step="stepNumber" :status="computedStatus">
            <icon-check v-if="computedStatus === 'finish'" />
            <icon-close v-else-if="computedStatus === 'error'" />
            <template v-else>{{ stepNumber }}</template>
          </slot>
        </div>
      </slot>
    </div>
    <div :class="`${prefixCls}-content`">
      <div :class="`${prefixCls}-title`">
        <slot>{{ title }}</slot>
      </div>
      <div v-if="description || $slots.description" :class="`${prefixCls}-description`">
        <slot name="description">
          {{ description }}
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import {
    computed,
    getCurrentInstance,
    inject,
    onBeforeUnmount,
    PropType,
    reactive,
    ref,
  } from 'vue';

  import { createStep } from '@sdata/web-core/steps/foundation';

  import { useIndex } from '../_hooks/use-index';
  import { getPrefixCls } from '../_utils/global-config';
  import IconCheck from '../icon/icon-check';
  import IconClose from '../icon/icon-close';
  import { stepsInjectionKey } from './context';
  import { StepStatus } from './interface';

  defineOptions({ name: 'Step' });

  const props = defineProps({
    /**
     * @zh 步骤的标题
     * @en Title of the step
     */
    title: String,
    /**
     * @zh 步骤的描述信息
     * @en Description of the step
     */
    description: String,
    /**
     * @zh 步骤的状态
     * @en Status of the step
     * @values 'wait', 'process', 'finish', 'error'
     */
    status: {
      type: String as PropType<StepStatus>,
    },
    /**
     * @zh 是否禁用
     * @en Whether to disable
     */
    disabled: {
      type: Boolean,
      default: false,
    },
  });

  /**
   * @zh 节点
   * @en Node
   * @slot node
   * @binding {number} step
   * @binding {string} status
   */
  /**
   * @zh 图标
   * @en Icon
   * @slot icon
   * @binding {number} step
   * @binding {string} status
   */
  /**
   * @zh 描述内容
   * @en Description
   * @slot description
   */

  const prefixCls = getPrefixCls('steps-item');
  const instance = getCurrentInstance();
  const iconCls = getPrefixCls('steps-icon');

  const stepsCtx = inject(stepsInjectionKey, undefined);

  const type = computed(() => stepsCtx?.type ?? 'default');

  const itemRef = ref<HTMLElement>();
  const { computedIndex } = useIndex({
    itemRef,
    selector: `.${prefixCls}`,
    parentClassName: stepsCtx?.parentCls,
  });
  const stepNumber = computed(() => computedIndex.value + 1);

  const foundation = createStep({
    props,
    context: stepsCtx,
    get step() {
      return stepNumber.value;
    },
  });
  const computedStatus = computed(foundation.status);
  const nextStepError = computed(foundation.nextError);

  if (instance) {
    stepsCtx?.addItem(
      instance.uid,
      reactive({
        step: stepNumber,
        status: computedStatus,
      }),
    );
  }

  onBeforeUnmount(() => {
    if (instance) {
      stepsCtx?.removeItem(instance.uid);
    }
  });

  const showTail = computed(foundation.showTail);
  const handleClick = foundation.click;
  const onKeydown = foundation.keydown;

  const cls = computed(() => [
    prefixCls,
    `${prefixCls}-${computedStatus.value}`,
    {
      [`${prefixCls}-active`]: stepNumber.value === stepsCtx?.current,
      [`${prefixCls}-next-error`]: nextStepError.value,
      [`${prefixCls}-disabled`]: props.disabled,
    },
  ]);
</script>
