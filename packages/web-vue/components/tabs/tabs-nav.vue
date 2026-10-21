<template>
  <DefineAddButton>
    <button
      v-if="mergedEditable && props.showAddButton"
      type="button"
      :class="`${prefixCls}-add-btn`"
      :aria-label="t('a11y.addTab')"
      @click="emit('add', $event)"
    >
      <IconHover>
        <IconPlus />
      </IconHover>
    </button>
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
              v-if="['line', 'capsule'].includes(props.type) && activeTabRef"
              ref="inkRef"
              :active-tab-ref="activeTabRef"
              :direction="props.direction"
              :disabled="false"
              :animation="props.animation"
              :capsule="props.type === 'capsule'"
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

  import { getTabNavigationTarget } from '@sdata/web-core/tabs/foundation';
  import {
    createTabsNavigation,
    getTabMarginSide,
    getTabTargetOffset,
  } from '@sdata/web-core/tabs/navigation';
  import { createReusableTemplate } from '@vueuse/core';

  import type { Direction } from '../_utils/constant';
  import type { ScrollPosition, TabData, TabsType } from './interface';

  import IconHover from '../_components/icon-hover.vue';
  import ResizeObserver from '../_components/resize-observer.vue';
  import { off, on } from '../_utils/dom';
  import { getPrefixCls } from '../_utils/global-config';
  import { isUndefined } from '../_utils/is';
  import { configProviderInjectionKey } from '../config-provider/context';
  import IconPlus from '../icon/icon-plus';
  import { useI18n } from '../locale';
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
      type: [String, Number] as PropType<ScrollPosition>,
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
  const { t } = useI18n();
  const configContext = inject(configProviderInjectionKey, undefined);
  const rtl = computed(() => configContext?.rtl ?? false);
  const wrapperRef = ref<HTMLElement>();
  const listRef = ref<HTMLElement>();
  const tabsRef = ref(new Map<string | number, HTMLElement>());
  const activeTabRef = computed(() => {
    if (!isUndefined(props.activeKey)) return tabsRef.value.get(props.activeKey);
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

  const navigation = createTabsNavigation({
    get offset() {
      return offset.value;
    },
    get max() {
      return maxOffset.value;
    },
    get scrolling() {
      return isScroll.value;
    },
    get wrapperLength() {
      return wrapperLength.value;
    },
    get rtl() {
      return isRtlHorizontal.value;
    },
    hasElements: () => Boolean(wrapperRef.value && listRef.value),
    measureOverflow: isOverflow,
    measureWrapper: getWrapperLength,
    measureMax: getMaxOffset,
    setOffset(value) {
      offset.value = value;
    },
    setScrolling(value) {
      isScroll.value = value;
    },
    setWrapperLength(value) {
      wrapperLength.value = value;
    },
    setMax(value) {
      maxOffset.value = value;
    },
  });
  const getSize = navigation.measure;
  const setOffset = navigation.setOffset;

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
    const marginSide = getTabMarginSide(isHorizontal, isRtlHorizontal.value, props.scrollPosition);
    const tabStyle = window.getComputedStyle(activeTabRef.value);
    const tabMargin = parseFloat(tabStyle[marginSide]) || 0;
    setOffset(
      getTabTargetOffset(
        props.scrollPosition,
        offset.value,
        tabPosition,
        tabSize,
        wrapperSize,
        tabMargin,
      ),
    );
  };

  const handleWheel = navigation.wheel;
  const handleClick = (key: string | number, event: Event) => emit('click', key, event);
  const handleDelete = (key: string | number, event: Event) => {
    emit('delete', key, event);
  };
  const handleButtonClick = navigation.button;
  const focusAndActivate = (key: string | number, event: KeyboardEvent) => {
    const element = tabsRef.value.get(key);
    if (element instanceof HTMLElement) element.focus();
    emit('click', key, event);
  };
  const handleListKeydown = (event: KeyboardEvent) => {
    const target = getTabNavigationTarget(
      props.tabs,
      props.activeKey,
      props.direction,
      isRtlHorizontal.value,
      event.key,
    );
    if (!target) return;
    event.preventDefault();
    focusAndActivate(target.key, event);
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
      tabsRef.value.set(key, component.$el);
    else tabsRef.value.delete(key);
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
