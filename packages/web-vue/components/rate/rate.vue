<template>
  <DefineCharacterElement v-slot="{ index }">
    <template v-if="props.grading">
      <IconFaceMehFill v-if="foundation.getGradingFace(index) === 'inactive-meh'" />
      <IconFaceFrownFill v-else-if="foundation.getGradingFace(index) === 'frown'" />
      <IconFaceMehFill v-else-if="foundation.getGradingFace(index) === 'meh'" />
      <IconFaceSmileFill v-else />
    </template>
    <slot v-else name="character" :index="index">
      <IconStarFill />
    </slot>
  </DefineCharacterElement>

  <Tooltip v-bind="attrs" :popup-visible="tipVisible" :content="readonlyTipText" position="top">
    <div
      :class="cls"
      role="radiogroup"
      :aria-label="t('a11y.rating')"
      :tabindex="mergedDisabled ? undefined : 0"
      @mouseleave="resetHoverIndex"
      @keydown="handleKeydown"
    >
      <div
        v-for="(_, index) in indexArray"
        :key="index"
        :class="[
          `${prefixCls}-character`,
          {
            [`${prefixCls}-character-half`]: props.allowHalf && index + 0.5 === displayIndex,
            [`${prefixCls}-character-full`]: index + 1 <= displayIndex,
            [`${prefixCls}-character-scale`]: animation && index + 1 < computedValue,
          },
        ]"
        :style="animation ? { animationDelay: `${50 * index}ms` } : undefined"
        v-bind="!props.allowHalf ? getAriaProps(index) : undefined"
        @animationend="handleAnimationEnd(index)"
      >
        <div
          :class="`${prefixCls}-character-left`"
          :style="getCharacterColor(index, true)"
          v-bind="getInteractionProps(index, true)"
          v-on="getInteractionListeners(index, true)"
        >
          <ReuseCharacterElement :index="index" />
        </div>
        <div
          :class="`${prefixCls}-character-right`"
          :style="getCharacterColor(index, false)"
          v-bind="getInteractionProps(index, false)"
          v-on="getInteractionListeners(index, false)"
        >
          <ReuseCharacterElement :index="index" />
        </div>
      </div>
    </div>
  </Tooltip>
</template>

<script setup lang="ts">
  import { computed, ref, toRef, useAttrs, watch } from 'vue';
  import type { PropType } from 'vue';

  import { createRateFoundation } from '@sdata/web-core/rate/foundation';
  import { createReusableTemplate } from '@vueuse/core';

  import { useAllowClear } from '../_hooks/use-allow-clear';
  import { useFormItem } from '../_hooks/use-form-item';
  import { useReadonlyTip, useReadonlyTipText } from '../_hooks/use-readonly-tip';
  import { getPrefixCls } from '../_utils/global-config';
  import IconFaceFrownFill from '../icon/icon-face-frown-fill';
  import IconFaceMehFill from '../icon/icon-face-meh-fill';
  import IconFaceSmileFill from '../icon/icon-face-smile-fill';
  import IconStarFill from '../icon/icon-star-fill';
  import { useI18n } from '../locale';
  import Tooltip from '../tooltip';

  defineOptions({ name: 'Rate', inheritAttrs: false });

  const props = defineProps({
    /**
     * @zh 评分的总数量
     * @en Total number of rating items
     */
    count: {
      type: Number,
      default: 5,
    },
    /**
     * @zh 绑定值
     * @en Value of the rating
     * @vModel
     */
    modelValue: {
      type: Number,
      default: undefined,
    },
    /**
     * @zh 默认评分（非受控状态）
     * @en Default rating (uncontrolled state)
     */
    defaultValue: {
      type: Number,
      default: 0,
    },
    /**
     * @zh 是否允许半选
     * @en Whether half-star selection is allowed
     */
    allowHalf: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 是否允许清除评分
     * @en Whether the rating can be cleared
     */
    allowClear: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 是否分级显示颜色
     * @en Whether to grade the star colors
     */
    grading: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 是否只读
     * @en Whether the rating is readonly
     */
    readonly: {
      type: [Boolean, String],
      default: false,
    },
    /**
     * @zh 是否禁用
     * @en Whether the rating is disabled
     */
    disabled: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 评分颜色。传入对象时可按分值指定颜色
     * @en Rating color. Pass an object to color each score
     */
    color: {
      type: [String, Object] as PropType<string | Record<string, string>>,
    },
  });

  const emit = defineEmits<{
    'update:modelValue': [_value: number];
    /**
     * @zh 评分变化时触发
     * @en Trigger when the rating changes
     */
    'change': [_value: number];
    /**
     * @zh 鼠标悬停的评分变化时触发
     * @en Trigger when the hovered rating changes
     */
    'hoverChange': [_value: number];
  }>();

  defineSlots<{
    character(props: { index: number }): unknown;
  }>();

  const attrs = useAttrs();
  const [DefineCharacterElement, ReuseCharacterElement] = createReusableTemplate<{
    index: number;
  }>();
  const { t } = useI18n();
  const prefixCls = getPrefixCls('rate');
  const modelValue = toRef(props, 'modelValue');
  const { mergedDisabled: formDisabled, eventHandlers } = useFormItem({
    disabled: toRef(props, 'disabled'),
  });
  const { mergedAllowClear } = useAllowClear(toRef(props, 'allowClear'));
  const { tipVisible, show: showReadonlyTip } = useReadonlyTip(
    toRef(props, 'readonly'),
    formDisabled,
  );
  const readonlyTipText = useReadonlyTipText(toRef(props, 'readonly'));
  const innerValue = ref(props.defaultValue);
  const animation = ref(false);
  const hoverIndex = ref(0);

  const foundation = createRateFoundation({
    get options() {
      return props;
    },
    get inner() {
      return innerValue.value;
    },
    get value() {
      return computedValue.value;
    },
    get display() {
      return displayIndex.value;
    },
    get indices() {
      return indexArray.value;
    },
    get colors() {
      return customColor.value;
    },
    get hover() {
      return hoverIndex.value;
    },
    get animation() {
      return animation.value;
    },
    isDisabled: () => mergedDisabled.value,
    isFormDisabled: () => formDisabled.value,
    allowClear: () => mergedAllowClear.value,
    setInner: (value) => {
      innerValue.value = value;
    },
    setHover: (value) => {
      hoverIndex.value = value;
    },
    setAnimation: (value) => {
      animation.value = value;
    },
    onUpdate: (value) => emit('update:modelValue', value),
    onChange: (value) => emit('change', value),
    onHover: (value) => emit('hoverChange', value),
    onFormChange: () => eventHandlers.value?.onChange?.(),
  });
  watch(modelValue, foundation.syncModel);
  const computedValue = computed(foundation.getValue);
  const displayIndex = computed(foundation.getDisplay);
  const mergedDisabled = computed(() => formDisabled.value || !!props.readonly);
  const indexArray = computed(foundation.getIndices);
  const customColor = computed(foundation.getColors);
  const cls = computed(() => [
    prefixCls,
    {
      [`${prefixCls}-readonly`]: props.readonly,
      [`${prefixCls}-disabled`]: formDisabled.value,
    },
  ]);

  const resetHoverIndex = foundation.resetHover;
  watch(mergedDisabled, foundation.syncDisabled);
  const handleAnimationEnd = foundation.animationEnd;
  const handleKeydown = foundation.keydown;
  const getAriaProps = foundation.getAriaProps;
  const getInteractionProps = foundation.getInteractionProps;
  const getCharacterColor = foundation.getCharacterColor;
  const getInteractionListeners = (index: number, isHalf: boolean) => {
    const mode = foundation.getInteractionMode();
    if (mode === 'edit')
      return {
        mouseenter: () => foundation.mouseEnter(index, isHalf),
        click: () => foundation.click(index, isHalf),
      };
    if (mode === 'readonly-tip') return { click: showReadonlyTip };
    return {};
  };
</script>
