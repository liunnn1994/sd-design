import { computed, nextTick, Ref, ref, watch } from 'vue';

import { createLegacyInputFoundation } from '@sdata/web-core/text-input/legacy';

import { EmitFn } from '../_utils/types';
import { FormItemEventHandler } from '../form/interface';

export const useInput = ({
  defaultValue,
  modelValue,
  emit,
  eventName = 'input',
  updateEventName = 'update:modelValue',
  eventHandlers,
}: {
  defaultValue?: Ref<string>;
  modelValue?: Ref<string>;
  emit: EmitFn<string>;
  eventName?: string;
  updateEventName?: string;
  eventHandlers?: Ref<FormItemEventHandler>;
}) => {
  const inputRef = ref<HTMLInputElement>();

  const _value = ref(defaultValue?.value ?? '');
  const _focused = ref(false);

  const isComposition = ref(false);
  const compositionValue = ref('');

  const foundation = createLegacyInputFoundation(
    {
      get input() {
        return inputRef.value;
      },
      get modelValue() {
        return modelValue?.value;
      },
      get computedValue() {
        return computedValue.value;
      },
      get eventHandlers() {
        return eventHandlers?.value;
      },
      get value() {
        return _value.value;
      },
      set value(value) {
        _value.value = value;
      },
      get focused() {
        return _focused.value;
      },
      set focused(value) {
        _focused.value = value;
      },
      get isComposition() {
        return isComposition.value;
      },
      set isComposition(value) {
        isComposition.value = value;
      },
      get compositionValue() {
        return compositionValue.value;
      },
      set compositionValue(value) {
        compositionValue.value = value;
      },
    },
    { emit, afterRender: nextTick, eventName, updateEventName },
  );
  const computedValue = computed(foundation.getValue);
  const {
    handleInput,
    handleComposition,
    handleFocus,
    handleBlur,
    handleKeyDown,
    handleMousedown,
  } = foundation;
  watch(computedValue, foundation.syncInput);

  return {
    inputRef,
    _value,
    _focused,
    isComposition,
    compositionValue,
    computedValue,
    handleInput,
    handleComposition,
    handleFocus,
    handleBlur,
    handleKeyDown,
    handleMousedown,
  };
};
