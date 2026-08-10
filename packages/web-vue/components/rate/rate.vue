<template>
  <DefineCharacterElement v-slot="{ index }">
    <template v-if="props.grading">
      <IconFaceMehFill v-if="index > displayIndex" />
      <IconFaceFrownFill v-else-if="displayIndex <= 2" />
      <IconFaceMehFill v-else-if="displayIndex <= 3" />
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

  import { createReusableTemplate } from '@vueuse/core';
  import NP from 'number-precision';

  import { useAllowClear } from '../_hooks/use-allow-clear';
  import { useFormItem } from '../_hooks/use-form-item';
  import { useReadonlyTip, useReadonlyTipText } from '../_hooks/use-readonly-tip';
  import { getPrefixCls } from '../_utils/global-config';
  import { isNull, isObject, isString, isUndefined } from '../_utils/is';
  import { KEYBOARD_KEY } from '../_utils/keyboard';
  import IconFaceFrownFill from '../icon/icon-face-frown-fill';
  import IconFaceMehFill from '../icon/icon-face-meh-fill';
  import IconFaceSmileFill from '../icon/icon-face-smile-fill';
  import IconStarFill from '../icon/icon-star-fill';
  import { useI18n } from '../locale';
  import Tooltip from '../tooltip';

  defineOptions({ name: 'Rate', inheritAttrs: false });

  const props = defineProps({
    count: {
      type: Number,
      default: 5,
    },
    modelValue: {
      type: Number,
      default: undefined,
    },
    defaultValue: {
      type: Number,
      default: 0,
    },
    allowHalf: {
      type: Boolean,
      default: false,
    },
    allowClear: {
      type: Boolean,
      default: false,
    },
    grading: {
      type: Boolean,
      default: false,
    },
    readonly: {
      type: [Boolean, String],
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    color: {
      type: [String, Object] as PropType<string | Record<string, string>>,
    },
  });

  const emit = defineEmits({
    'update:modelValue': (_value: number) => true,
    'change': (_value: number) => true,
    'hoverChange': (_value: number) => true,
  });

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

  watch(modelValue, (value) => {
    if (isUndefined(value) || isNull(value)) innerValue.value = 0;
  });

  const computedValue = computed(() => props.modelValue ?? innerValue.value);
  const displayIndex = computed(() => {
    const fixedValue = props.allowHalf
      ? NP.times(NP.round(NP.divide(computedValue.value, 0.5), 0), 0.5)
      : Math.round(computedValue.value);
    return hoverIndex.value || fixedValue;
  });
  const mergedDisabled = computed(() => formDisabled.value || !!props.readonly);
  const indexArray = computed<undefined[]>(() => [...Array(props.grading ? 5 : props.count)]);
  const customColor = computed(() => {
    if (isString(props.color)) return indexArray.value.map(() => props.color as string);
    if (isObject(props.color)) {
      const sortedKeys = Object.keys(props.color)
        .map((key) => Number(key))
        .sort((a, b) => b - a);
      let threshold = sortedKeys.pop() ?? indexArray.value.length;
      return indexArray.value.map((_, index) => {
        if (index + 1 > threshold) threshold = sortedKeys.pop() ?? threshold;
        return (props.color as Record<string, string>)[String(threshold)];
      });
    }
    return undefined;
  });
  const cls = computed(() => [
    prefixCls,
    {
      [`${prefixCls}-readonly`]: props.readonly,
      [`${prefixCls}-disabled`]: formDisabled.value,
    },
  ]);

  const resetHoverIndex = () => {
    if (hoverIndex.value) {
      hoverIndex.value = 0;
      emit('hoverChange', 0);
    }
  };

  const handleMouseEnter = (index: number, isHalf: boolean) => {
    const nextHoverIndex = isHalf && props.allowHalf ? index + 0.5 : index + 1;
    if (nextHoverIndex !== hoverIndex.value) {
      hoverIndex.value = nextHoverIndex;
      emit('hoverChange', nextHoverIndex);
    }
  };

  const handleClick = (index: number, isHalf: boolean) => {
    const nextValue = isHalf && props.allowHalf ? index + 0.5 : index + 1;
    animation.value = true;
    if (nextValue !== computedValue.value) {
      innerValue.value = nextValue;
      emit('update:modelValue', nextValue);
      emit('change', nextValue);
      eventHandlers.value?.onChange?.();
    } else if (mergedAllowClear.value) {
      innerValue.value = 0;
      emit('update:modelValue', 0);
      emit('change', 0);
      eventHandlers.value?.onChange?.();
    }
  };

  const handleAnimationEnd = (index: number) => {
    if (animation.value && index + 1 >= computedValue.value - 1) animation.value = false;
  };

  const handleKeydown = (event: KeyboardEvent) => {
    if (mergedDisabled.value) return;
    const step = props.allowHalf ? 0.5 : 1;
    let next = computedValue.value;
    if (event.key === KEYBOARD_KEY.ARROW_RIGHT || event.key === KEYBOARD_KEY.ARROW_UP) {
      next += step;
    } else if (event.key === KEYBOARD_KEY.ARROW_LEFT || event.key === KEYBOARD_KEY.ARROW_DOWN) {
      next -= step;
    } else if (event.key === KEYBOARD_KEY.HOME) {
      next = 0;
    } else if (event.key === KEYBOARD_KEY.END) {
      next = indexArray.value.length;
    } else {
      return;
    }
    event.preventDefault();
    next = Math.max(0, Math.min(next, indexArray.value.length));
    if (next !== computedValue.value) {
      innerValue.value = next;
      emit('update:modelValue', next);
      emit('change', next);
      eventHandlers.value?.onChange?.();
    }
  };

  const getAriaProps = (index: number, isHalf = false) => ({
    'role': 'radio',
    'aria-checked': index + (isHalf ? 0.5 : 1) <= computedValue.value,
    'aria-setsize': indexArray.value.length,
    'aria-posinset': index + (isHalf ? 0.5 : 1),
  });

  const getInteractionProps = (index: number, isHalf: boolean) =>
    props.allowHalf ? getAriaProps(index, isHalf) : {};

  const getInteractionListeners = (index: number, isHalf: boolean) => {
    if (!mergedDisabled.value) {
      return {
        mouseenter: () => handleMouseEnter(index, isHalf),
        click: () => handleClick(index, isHalf),
      };
    }
    if (props.readonly && !formDisabled.value) return { click: showReadonlyTip };
    return {};
  };

  const getCharacterColor = (index: number, isHalf: boolean) => {
    const parsedDisplayIndex = Math.ceil(displayIndex.value) - 1;
    if (
      customColor.value &&
      ((isHalf && props.allowHalf && index + 0.5 === displayIndex.value) ||
        (!isHalf && index + 1 <= displayIndex.value))
    ) {
      return { color: customColor.value[parsedDisplayIndex] };
    }
    return undefined;
  };
</script>
