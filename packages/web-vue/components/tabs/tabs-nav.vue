<template>
  <DefineAddButton>
    <div
      v-if="mergedEditable && props.showAddButton"
      :class="`${prefixCls}-add-btn`"
      @click="emit('add', $event)"
    >
      <IconHover>
        <IconPlus />
      </IconHover>
    </div>
  </DefineAddButton>

  <div v-bind="attrs" :class="cls">
    <TabsButton
      v-if="isScroll"
      :type="isRtlHorizontal ? 'next' : 'previous'"
      :direction="props.direction"
      :disabled="offset <= 0"
      @click="handleButtonClick"
    />
    <ResizeObserver @resize="getSize">
      <div ref="wrapperRef" :class="tabCls">
        <ResizeObserver @resize="handleResize">
          <div
            ref="listRef"
            :class="listCls"
            :style="listStyle"
            role="tablist"
            :aria-orientation="props.direction === 'vertical' ? 'vertical' : 'horizontal'"
            @keydown="handleListKeydown"
          >
            <TabsTab
              v-for="tab in props.tabs"
              :key="tab.key"
              :ref="(component) => setTabRef(tab.key, component)"
              :active="tab.key === props.activeKey"
              :tab="tab"
              :editable="props.editable"
              @click="handleClick"
              @delete="handleDelete"
            >
              <VNodeRenderer :content="tab.slots.title?.() ?? tab.title" />
            </TabsTab>
            <TabsNavInk
              v-if="props.type === 'line' && activeTabRef"
              ref="inkRef"
              :active-tab-ref="activeTabRef"
              :direction="props.direction"
              :disabled="false"
              :animation="props.animation"
            />
          </div>
        </ResizeObserver>
        <ReuseAddButton v-if="!isScroll" />
      </div>
    </ResizeObserver>
    <TabsButton
      v-if="isScroll"
      :type="isRtlHorizontal ? 'previous' : 'next'"
      :direction="props.direction"
      :disabled="offset >= maxOffset"
      @click="handleButtonClick"
    />
    <div :class="`${prefixCls}-extra`">
      <ReuseAddButton v-if="isScroll" />
      <slot name="extra" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import {
    computed,
    inject,
    nextTick,
    onMounted,
    onUnmounted,
    ref,
    toRef,
    useAttrs,
    watch,
    type ComponentPublicInstance,
    type PropType,
    type VNodeChild,
  } from 'vue';

  import { createReusableTemplate } from '@vueuse/core';

  import type { Direction } from '../_utils/constant';
  import type { ScrollPosition, TabData, TabsType } from './interface';

  import IconHover from '../_components/icon-hover.vue';
  import ResizeObserver from '../_components/resize-observer.vue';
  import { off, on } from '../_utils/dom';
  import { getPrefixCls } from '../_utils/global-config';
  import { isNumber, isUndefined } from '../_utils/is';
  import { KEYBOARD_KEY } from '../_utils/keyboard';
  import { configProviderInjectionKey } from '../config-provider/context';
  import IconPlus from '../icon/icon-plus';
  import TabsButton from './tabs-button.vue';
  import TabsNavInk from './tabs-nav-ink.vue';
  import TabsTab from './tabs-tab.vue';
  import { updateScrollOffset } from './utils';

  const VNodeRenderer = (_props: { content?: VNodeChild }) => _props.content;

  defineOptions({ name: 'TabsNav', inheritAttrs: false });

  const props = defineProps({
    tabs: {
      type: Array as PropType<TabData[]>,
      required: true,
    },
    direction: {
      type: String as PropType<Direction>,
      required: true,
    },
    type: {
      type: String as PropType<TabsType>,
      required: true,
    },
    activeKey: [String, Number],
    activeIndex: {
      type: Number,
      required: true,
    },
    position: {
      type: String,
      required: true,
    },
    size: {
      type: String,
      required: true,
    },
    showAddButton: {
      type: Boolean,
      default: false,
    },
    editable: {
      type: Boolean,
      default: false,
    },
    animation: {
      type: Boolean,
      required: true,
    },
    headerPadding: {
      type: Boolean,
      default: true,
    },
    scrollPosition: {
      type: String as PropType<ScrollPosition>,
      default: 'auto',
    },
  });

  const emit = defineEmits<{
    click: [key: string | number, event: Event];
    add: [event: Event];
    delete: [key: string | number, event: Event];
  }>();

  defineSlots<{ extra(): unknown }>();

  const attrs = useAttrs();
  const [DefineAddButton, ReuseAddButton] = createReusableTemplate();
  const prefixCls = getPrefixCls('tabs-nav');
  const configContext = inject(configProviderInjectionKey, undefined);
  const rtl = computed(() => configContext?.rtl ?? false);
  const wrapperRef = ref<HTMLElement>();
  const listRef = ref<HTMLElement>();
  const tabsRef = ref<Record<string | number, HTMLElement>>({});
  const activeTabRef = computed(() => {
    if (!isUndefined(props.activeKey)) return tabsRef.value[props.activeKey];
    return undefined;
  });
  const isRtlHorizontal = computed(() => rtl.value && props.direction === 'horizontal');
  const inkRef = ref<InstanceType<typeof TabsNavInk>>();
  const mergedEditable = computed(
    () => props.editable && ['line', 'card', 'card-gutter'].includes(props.type),
  );
  const isScroll = ref(false);
  const wrapperLength = ref(0);
  const maxOffset = ref(0);
  const offset = ref(0);

  const getWrapperLength = () =>
    (props.direction === 'vertical'
      ? wrapperRef.value?.offsetHeight
      : wrapperRef.value?.offsetWidth) ?? 0;

  const getMaxOffset = () => {
    if (!listRef.value || !wrapperRef.value) return 0;
    return props.direction === 'vertical'
      ? listRef.value.offsetHeight - wrapperRef.value.offsetHeight
      : listRef.value.offsetWidth - wrapperRef.value.offsetWidth;
  };

  const isOverflow = () => {
    if (!wrapperRef.value || !listRef.value) return false;
    return props.direction === 'vertical'
      ? listRef.value.offsetHeight > wrapperRef.value.offsetHeight
      : listRef.value.offsetWidth > wrapperRef.value.offsetWidth;
  };

  const getSize = () => {
    isScroll.value = isOverflow();
    if (isScroll.value) {
      wrapperLength.value = getWrapperLength();
      maxOffset.value = getMaxOffset();
      if (offset.value > maxOffset.value) offset.value = maxOffset.value;
    } else {
      offset.value = 0;
    }
  };

  const setOffset = (nextOffset: number) => {
    if (!wrapperRef.value || !listRef.value || nextOffset < 0) nextOffset = 0;
    offset.value = Math.min(nextOffset, maxOffset.value);
  };

  const setActiveTabOffset = () => {
    if (!activeTabRef.value || !wrapperRef.value || !isScroll.value) return;
    updateScrollOffset(wrapperRef.value, props.direction);
    const isHorizontal = props.direction === 'horizontal';
    const sizeProperty = isHorizontal ? 'offsetWidth' : 'offsetHeight';
    const wrapperSize = wrapperRef.value[sizeProperty];
    const tabSize = activeTabRef.value[sizeProperty];
    let tabPosition = 0;
    if (isRtlHorizontal.value) {
      const listWidth = listRef.value?.offsetWidth || 0;
      tabPosition = listWidth - activeTabRef.value.offsetLeft - tabSize;
    } else {
      tabPosition = isHorizontal ? activeTabRef.value.offsetLeft : activeTabRef.value.offsetTop;
    }
    const marginSide = isHorizontal
      ? isRtlHorizontal.value
        ? props.scrollPosition === 'end'
          ? 'marginLeft'
          : 'marginRight'
        : props.scrollPosition === 'end'
          ? 'marginRight'
          : 'marginLeft'
      : props.scrollPosition === 'end'
        ? 'marginBottom'
        : 'marginTop';
    const tabStyle = window.getComputedStyle(activeTabRef.value);
    const tabMargin = parseFloat(tabStyle[marginSide]) || 0;
    let targetOffset = 0;
    switch (props.scrollPosition) {
      case 'auto':
        if (tabPosition < offset.value) targetOffset = tabPosition - tabMargin;
        else if (tabPosition + tabSize > offset.value + wrapperSize)
          targetOffset = tabPosition + tabSize - wrapperSize + tabMargin;
        break;
      case 'center':
        targetOffset = tabPosition + (tabSize - wrapperSize + tabMargin) / 2;
        break;
      case 'start':
        targetOffset = tabPosition - tabMargin;
        break;
      case 'end':
        targetOffset = tabPosition + tabSize - wrapperSize + tabMargin;
        break;
      default:
        if (isNumber(props.scrollPosition)) targetOffset = tabPosition - props.scrollPosition;
    }
    setOffset(targetOffset);
  };

  const handleWheel = (event: WheelEvent) => {
    if (!isScroll.value) return;
    event.preventDefault();
    const { deltaX, deltaY } = event;
    setOffset(offset.value + (Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : deltaY));
  };
  const handleClick = (key: string | number, event: Event) => emit('click', key, event);
  const handleDelete = (key: string | number, event: Event) => {
    emit('delete', key, event);
    nextTick(() => delete tabsRef.value[key]);
  };
  const handleButtonClick = (type: string) => {
    const scrollDirection = (type === 'previous') !== isRtlHorizontal.value ? -1 : 1;
    setOffset(offset.value + scrollDirection * wrapperLength.value);
  };
  const focusAndActivate = (key: string | number, event: KeyboardEvent) => {
    const element = tabsRef.value[key];
    if (element instanceof HTMLElement) element.focus();
    emit('click', key, event);
  };
  const handleListKeydown = (event: KeyboardEvent) => {
    const enabled = props.tabs.filter((tab) => !tab.disabled);
    if (!enabled.length) return;
    const length = enabled.length;
    const currentIndex = Math.max(
      0,
      enabled.findIndex((tab) => tab.key === props.activeKey),
    );
    let nextIndex = currentIndex;
    const { key } = event;
    if (props.direction === 'vertical') {
      if (key === KEYBOARD_KEY.ARROW_DOWN) nextIndex = currentIndex + 1;
      else if (key === KEYBOARD_KEY.ARROW_UP) nextIndex = currentIndex - 1;
      else if (key === KEYBOARD_KEY.HOME) nextIndex = 0;
      else if (key === KEYBOARD_KEY.END) nextIndex = length - 1;
      else return;
    } else {
      if (key === KEYBOARD_KEY.ARROW_RIGHT)
        nextIndex = isRtlHorizontal.value ? currentIndex - 1 : currentIndex + 1;
      else if (key === KEYBOARD_KEY.ARROW_LEFT)
        nextIndex = isRtlHorizontal.value ? currentIndex + 1 : currentIndex - 1;
      else if (key === KEYBOARD_KEY.HOME) nextIndex = 0;
      else if (key === KEYBOARD_KEY.END) nextIndex = length - 1;
      else return;
    }
    event.preventDefault();
    nextIndex = ((nextIndex % length) + length) % length;
    focusAndActivate(enabled[nextIndex].key, event);
  };

  const handleResize = () => {
    getSize();
    inkRef.value?.$forceUpdate();
  };

  watch(toRef(props, 'tabs'), () => nextTick(getSize));
  watch([toRef(props, 'activeIndex'), toRef(props, 'scrollPosition'), rtl], () => {
    setTimeout(() => {
      setActiveTabOffset();
      inkRef.value?.getInkStyle();
    }, 0);
  });
  onMounted(() => {
    getSize();
    if (wrapperRef.value) on(wrapperRef.value, 'wheel', handleWheel, { passive: false });
  });
  onUnmounted(() => {
    if (wrapperRef.value) off(wrapperRef.value, 'wheel', handleWheel);
  });

  const setTabRef = (key: string | number, component: Element | ComponentPublicInstance | null) => {
    if (component && '$el' in component && component.$el instanceof HTMLElement)
      tabsRef.value[key] = component.$el;
  };
  const cls = computed(() => [
    prefixCls,
    `${prefixCls}-${props.direction}`,
    `${prefixCls}-${props.position}`,
    `${prefixCls}-size-${props.size}`,
    `${prefixCls}-type-${props.type}`,
  ]);
  const listCls = computed(() => [
    `${prefixCls}-tab-list`,
    {
      [`${prefixCls}-tab-list-no-padding`]:
        !props.headerPadding &&
        ['line', 'text'].includes(props.type) &&
        props.direction === 'horizontal',
    },
  ]);
  const listStyle = computed(() => ({
    transform:
      props.direction === 'vertical'
        ? `translateY(${-offset.value}px)`
        : `translateX(${rtl.value ? offset.value : -offset.value}px)`,
  }));
  const tabCls = computed(() => [
    `${prefixCls}-tab`,
    { [`${prefixCls}-tab-scroll`]: isScroll.value },
  ]);
</script>
