<template>
  <DefineContent>
    <div :class="[`${prefixCls}-content`, { [`${prefixCls}-content-hide`]: props.hideContent }]">
      <div
        :class="[
          `${prefixCls}-content-list`,
          { [`${prefixCls}-content-animation`]: props.animation },
        ]"
        :style="contentStyle"
      >
        <VNodeRenderer :content="getChildren()" />
      </div>
    </div>
  </DefineContent>

  <div v-bind="attrs" :class="cls">
    <ReuseContent v-if="mergedPosition === 'bottom'" />
    <TabsNav
      :tabs="sortedTabs"
      :active-key="computedActiveKey"
      :active-index="activeIndex"
      :direction="mergedDirection"
      :position="mergedPosition"
      :editable="props.editable"
      :animation="props.animation"
      :show-add-button="props.showAddButton"
      :header-padding="props.headerPadding"
      :scroll-position="props.scrollPosition"
      :size="mergedSize"
      :type="props.type"
      @click="handleClick"
      @add="handleAdd"
      @delete="handleDelete"
    >
      <template #extra>
        <slot name="extra" />
      </template>
    </TabsNav>
    <ReuseContent v-if="mergedPosition !== 'bottom'" />
  </div>
</template>

<script setup lang="ts">
  import {
    computed,
    getCurrentInstance,
    inject,
    nextTick,
    provide,
    reactive,
    ref,
    toRef,
    useAttrs,
    useSlots,
    type PropType,
    type VNodeChild,
  } from 'vue';

  import { createReusableTemplate } from '@vueuse/core';

  import type { Direction, Size } from '../_utils/constant';
  import type { ScrollbarProps } from '../scrollbar';
  import type {
    ScrollPosition,
    TabData,
    TabsPosition,
    TabsType,
    TabTriggerEvent,
  } from './interface';

  import { useChildrenComponents } from '../_hooks/use-children-components';
  import { useScrollbar } from '../_hooks/use-scrollbar';
  import { useSize } from '../_hooks/use-size';
  import { getPrefixCls } from '../_utils/global-config';
  import { isUndefined } from '../_utils/is';
  import { configProviderInjectionKey } from '../config-provider/context';
  import { tabsInjectionKey } from './context';
  import TabsNav from './tabs-nav.vue';

  const VNodeRenderer = (_props: { content?: VNodeChild }) => _props.content;

  defineOptions({ name: 'Tabs', inheritAttrs: false });

  const props = defineProps({
    /**
     * @zh 当前激活的标签页 key（受控）
     * @en Key of the active tab (controlled)
     */
    activeKey: {
      type: [String, Number],
      default: undefined,
    },
    /**
     * @zh 默认激活的标签页 key（非受控）
     * @en Key of the initially active tab (uncontrolled state)
     */
    defaultActiveKey: {
      type: [String, Number],
      default: undefined,
    },
    /**
     * @zh 标签页的位置
     * @en Position of the tab bar
     */
    position: {
      type: String as PropType<TabsPosition>,
      default: 'top',
    },
    /**
     * @zh 尺寸
     * @en Size of the tabs
     */
    size: String as PropType<Size>,
    /**
     * @zh 标签页的类型
     * @en Type of the tabs
     */
    type: {
      type: String as PropType<TabsType>,
      default: 'line',
    },
    /**
     * @zh 水平/垂直方向
     * @en Horizontal or vertical direction
     */
    direction: {
      type: String as PropType<Direction>,
      default: 'horizontal',
    },
    /**
     * @zh 是否支持添加和关闭标签页
     * @en Whether tabs can be added and closed
     */
    editable: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 是否显示添加按钮
     * @en Whether to show the add button
     */
    showAddButton: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 隐藏时是否销毁内容
     * @en Whether tab content is destroyed when hidden
     */
    destroyOnHide: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 是否懒加载标签页内容
     * @en Whether tab content is lazy loaded
     */
    lazyLoad: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 标签页的对齐方式
     * @en Alignment of the tab items
     */
    justify: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 切换动画类型
     * @en Transition used when switching tabs
     */
    animation: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 标签栏的内边距
     * @en Padding of the tab bar
     */
    headerPadding: {
      type: Boolean,
      default: true,
    },
    /**
     * @zh 鼠标悬停时是否自动切换
     * @en Whether hovering an item switches to it
     */
    autoSwitch: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 是否只渲染标签栏
     * @en Whether to render the tab bar only
     */
    hideContent: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 标签页的触发方式
     * @en Trigger behaviour of the tabs
     */
    trigger: {
      type: String as PropType<TabTriggerEvent>,
      default: 'click',
    },
    /**
     * @zh 初始滚动位置
     * @en Initial scroll position of the tab bar
     */
    scrollPosition: {
      type: [String, Number] as PropType<ScrollPosition>,
      default: 'auto',
    },
    /**
     * @zh 是否撑满父容器高度
     * @en Whether the tabs fill the parent height
     */
    fullHeight: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 滚动条配置
     * @en Scrollbar configuration
     */
    scrollbar: {
      type: [Boolean, Object] as PropType<boolean | ScrollbarProps>,
      default: true,
    },
  });

  const emit = defineEmits<{
    'update:activeKey': [_key: string | number];
    /**
     * @zh 当前标签页变化时触发
     * @en Trigger when the active tab changes
     */
    'change': [_key: string | number];
    /**
     * @zh 点击标签页时触发
     * @en Trigger when a tab is clicked
     */
    'tabClick': [_key: string | number, _event: Event];
    /**
     * @zh 点击添加按钮时触发
     * @en Trigger when the add button is clicked
     */
    'add': [_event: Event];
    /**
     * @zh 关闭标签页时触发
     * @en Trigger when a tab is closed
     */
    'delete': [_key: string | number, _event: Event];
  }>();

  defineSlots<{
    default(): unknown;
    extra(): unknown;
  }>();

  const attrs = useAttrs();
  const slots = useSlots();
  const [DefineContent, ReuseContent] = createReusableTemplate();
  const prefixCls = getPrefixCls('tabs');
  const tabsId = `${prefixCls}-${getCurrentInstance()!.uid}`;
  const { mergedSize } = useSize(toRef(props, 'size'));
  const mergedPosition = computed(() => (props.direction === 'vertical' ? 'left' : props.position));
  const mergedDirection = computed(() =>
    ['left', 'right'].includes(mergedPosition.value) ? 'vertical' : 'horizontal',
  );
  const { children, components } = useChildrenComponents('TabPane');
  const tabMap = reactive(new Map<number, TabData>());
  const sortedTabs = computed(() => {
    const tabData: TabData[] = [];
    components.value.forEach((id) => {
      const tab = tabMap.get(id);
      if (tab) tabData.push(tab);
    });
    return tabData;
  });
  const tabKeys = computed(() => sortedTabs.value.map((item) => item.key));
  const innerActiveKey = ref(props.defaultActiveKey);
  const computedActiveKey = computed(() => {
    const activeKey = props.activeKey ?? innerActiveKey.value;
    return isUndefined(activeKey) ? tabKeys.value[0] : activeKey;
  });
  const activeIndex = computed(() => {
    const index = tabKeys.value.indexOf(computedActiveKey.value);
    return index === -1 ? 0 : index;
  });
  const configContext = inject(configProviderInjectionKey, undefined);
  const rtl = computed(() => configContext?.rtl ?? false);
  // 用 transform 代替 margin 做滑动位移：transform 不参与布局，动画期间
  // 由合成器处理，重型面板不会逐帧 reflow。RTL 布局下面板向左溢出，滑动方向相反。
  const contentStyle = computed(() => ({
    transform: `translateX(${rtl.value ? '' : '-'}${activeIndex.value * 100}%)`,
  }));
  const { scrollbarProps } = useScrollbar(toRef(props, 'scrollbar'));
  const paneScrollbar = computed<ScrollbarProps | false>(() =>
    props.fullHeight && props.scrollbar !== false ? scrollbarProps.value : false,
  );

  const addItem = (id: number, data: TabData) => {
    tabMap.set(id, data);
  };
  const removeItem = (id: number) => {
    tabMap.delete(id);
  };

  provide(
    tabsInjectionKey,
    reactive({
      lazyLoad: toRef(props, 'lazyLoad'),
      destroyOnHide: toRef(props, 'destroyOnHide'),
      activeKey: computedActiveKey,
      addItem,
      removeItem,
      trigger: toRef(props, 'trigger'),
      scrollbar: paneScrollbar,
      tabsId,
    }),
  );

  const handleChange = (key: string | number) => {
    if (key !== computedActiveKey.value) {
      innerActiveKey.value = key;
      emit('update:activeKey', key);
      emit('change', key);
    }
  };
  const handleClick = (key: string | number, event: Event) => {
    handleChange(key);
    emit('tabClick', key, event);
  };
  const handleAdd = (event: Event) => {
    emit('add', event);
    if (props.autoSwitch) {
      nextTick(() => handleChange(tabKeys.value[tabKeys.value.length - 1]));
    }
  };
  const handleDelete = (key: string | number, event: Event) => emit('delete', key, event);

  const cls = computed(() => [
    prefixCls,
    `${prefixCls}-${mergedDirection.value}`,
    `${prefixCls}-${mergedPosition.value}`,
    `${prefixCls}-type-${props.type}`,
    `${prefixCls}-size-${mergedSize.value}`,
    {
      [`${prefixCls}-justify`]: props.justify,
      [`${prefixCls}-full-height`]: props.fullHeight,
      [`${prefixCls}-rtl`]: rtl.value,
    },
  ]);

  const getChildren = () => {
    children.value = slots.default?.();
    return children.value;
  };
</script>
