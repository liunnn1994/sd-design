import type { ComponentPublicInstance, Ref } from 'vue';
import { nextTick, provide, reactive, ref, watch } from 'vue';

import { createSelectNavigation } from '@sdata/web-core/select/navigation';

import { VirtualListRef } from '../../_components/virtual-list/interface';
import { getRelativeRect } from '../../_utils/dom';
import { KEYBOARD_KEY, getKeyDownHandler } from '../../_utils/keyboard';
import { selectInjectionKey } from '../context';
import { FilterOption, SelectOption, SelectFieldNames } from '../interface';
import { useOptions } from './use-options';

export const useSelect = ({
  multiple,
  options,
  extraOptions,
  inputValue,
  filterOption,
  showExtraOptions,
  component,
  valueKey,
  fieldNames,
  loading,
  popupVisible,
  valueKeys,
  dropdownRef,
  optionRefs,
  virtualListRef,
  onSelect,
  onPopupVisibleChange,
  enterToOpen = true,
  defaultActiveFirstOption,
}: {
  multiple?: Ref<boolean>;
  options?: Ref<SelectOption[]>;
  extraOptions?: Ref<SelectOption[]>;
  inputValue?: Ref<string>;
  filterOption?: Ref<FilterOption>;
  showExtraOptions?: Ref<boolean>;
  component?: Ref<'li' | 'div'>;
  valueKey?: Ref<string>;
  fieldNames?: Ref<SelectFieldNames | undefined>;
  loading?: Ref<boolean>;
  popupVisible: Ref<boolean>;
  valueKeys: Ref<string[]>;
  dropdownRef?: Ref<ComponentPublicInstance | undefined>;
  optionRefs?: Ref<Record<string | number, HTMLElement>>;
  virtualListRef?: Ref<VirtualListRef>;
  onSelect: (key: string, ev: Event) => void;
  onPopupVisibleChange: (visible: boolean) => void;
  enterToOpen?: boolean;
  defaultActiveFirstOption?: Ref<boolean>;
}) => {
  const { validOptions, optionInfoMap, validOptionInfos, enabledOptionKeys } = useOptions({
    options,
    extraOptions,
    inputValue,
    filterOption,
    showExtraOptions,
    valueKey,
    fieldNames,
  });

  const activeKey = ref<string | undefined>();

  const setActiveKey = (key?: string) => {
    activeKey.value = key;
  };

  const scrollIntoView = (key: string) => {
    if (virtualListRef?.value) {
      virtualListRef.value.scrollTo({ key });
    }
    const optionInfo = optionInfoMap.get(key);
    const wrapperEle = (dropdownRef?.value as { wrapperRef?: HTMLElement } | undefined)?.wrapperRef;
    const optionEle = (optionRefs?.value[key] ?? optionInfo?.ref) as HTMLElement | undefined;

    if (!wrapperEle || !optionEle) {
      return;
    }
    if (wrapperEle.scrollHeight === wrapperEle.offsetHeight) {
      return;
    }
    const optionRect = getRelativeRect(optionEle, wrapperEle);
    const wrapperScrollTop = wrapperEle.scrollTop;

    if (optionRect.top < 0) {
      wrapperEle.scrollTo(0, wrapperScrollTop + optionRect.top);
    } else if (optionRect.bottom < 0) {
      wrapperEle.scrollTo(0, wrapperScrollTop - optionRect.bottom);
    }
  };

  const navigation = createSelectNavigation<Event>({
    getEnabledKeys: () => enabledOptionKeys.value,
    getActiveKey: () => activeKey.value,
    getValueKeys: () => valueKeys.value,
    getDefaultActiveFirst: () => defaultActiveFirstOption?.value,
    getLoading: () => loading?.value,
    getPopupVisible: () => popupVisible.value,
    getEnterToOpen: () => enterToOpen,
    setActiveKey,
    scrollIntoView,
    select: onSelect,
    setPopupVisible: onPopupVisibleChange,
    afterRender: (task) => {
      void nextTick(task);
    },
  });
  watch(enabledOptionKeys, navigation.enabledKeysChanged);
  watch(
    popupVisible,
    (visible) => {
      if (visible) navigation.opened();
    },
    { immediate: true },
  );
  const getNextActiveKey = navigation.getNextActiveKey;
  const handleKeyDown = getKeyDownHandler(
    new Map([
      [
        KEYBOARD_KEY.ENTER,
        (e: Event) => navigation.keydown('Enter', e, (e as KeyboardEvent).isComposing),
      ],
      [KEYBOARD_KEY.ESC, (e: Event) => navigation.keydown('Escape', e)],
      [KEYBOARD_KEY.ARROW_DOWN, (e: Event) => navigation.keydown('ArrowDown', e)],
      [KEYBOARD_KEY.ARROW_UP, (e: Event) => navigation.keydown('ArrowUp', e)],
    ]),
  );

  provide(
    selectInjectionKey,
    reactive({
      multiple,
      valueKey,
      inputValue,
      filterOption,
      component,
      valueKeys,
      activeKey,
      setActiveKey,
      onSelect,
    }),
  );

  return {
    validOptions,
    optionInfoMap,
    validOptionInfos,
    enabledOptionKeys,
    activeKey,
    setActiveKey,
    getNextActiveKey,
    scrollIntoView,
    handleKeyDown,
  };
};
