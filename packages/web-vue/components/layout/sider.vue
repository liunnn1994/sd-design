<template>
  <aside
    ref="rootEl"
    :class="siderCls"
    :style="divStyle"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <template v-if="temporary">
      <Drawer
        v-bind="mergedDrawerProps"
        :visible="!mergedCollapsed"
        @update:visible="onDrawerVisibleChange"
      >
        <div v-if="$slots.header" :class="`${prefixCls}-header`">
          <slot name="header" />
        </div>
        <div
          v-if="useNativeScrollbar"
          :class="[`${prefixCls}-children`, `${prefixCls}-children-scroll`]"
        >
          <slot />
        </div>
        <Scrollbar v-else :outer-class="`${prefixCls}-children`" v-bind="scrollbarProps">
          <slot />
        </Scrollbar>
      </Drawer>
      <span
        v-if="renderTrigger"
        :class="`${prefixCls}-temporary-trigger`"
        role="button"
        tabindex="0"
        :aria-expanded="!mergedCollapsed"
        aria-label="Toggle sidebar"
        @click="toggle"
        @keydown="handleTriggerKeydown"
      >
        <slot name="trigger">
          <IconMenu />
        </slot>
      </span>
    </template>
    <!-- rail 模式：aside 流内恒占 railWidth（不随 hover 变化），内容渲染进 overlay 容器。
         hover 时 overlay 切绝对定位并展开到全宽，浮于内容上方，右侧内容零重排。 -->
    <template v-else-if="rail">
      <div :class="railOverlayCls" :style="railOverlayStyle">
        <div v-if="$slots.header" :class="`${prefixCls}-header`">
          <slot name="header" />
        </div>
        <div
          v-if="useNativeScrollbar"
          :class="[`${prefixCls}-children`, `${prefixCls}-children-scroll`]"
        >
          <slot />
        </div>
        <Scrollbar v-else :outer-class="`${prefixCls}-children`" v-bind="scrollbarProps">
          <slot />
        </Scrollbar>
      </div>
    </template>
    <template v-else>
      <div v-if="$slots.header" :class="`${prefixCls}-header`">
        <slot name="header" />
      </div>
      <div
        v-if="useNativeScrollbar"
        :class="[`${prefixCls}-children`, `${prefixCls}-children-scroll`]"
      >
        <slot />
      </div>
      <Scrollbar v-else :outer-class="`${prefixCls}-children`" v-bind="scrollbarProps">
        <slot />
      </Scrollbar>
      <template v-if="renderTrigger">
        <span
          v-if="hasZeroWidth"
          :class="[
            `${prefixCls}-zero-width-trigger`,
            `${prefixCls}-zero-width-trigger-${reverseArrow ? 'right' : 'left'}`,
          ]"
          :style="zeroWidthTriggerStyle"
          role="button"
          tabindex="0"
          :aria-expanded="!mergedCollapsed"
          aria-label="Toggle sidebar"
          @click="toggle"
          @keydown="handleTriggerKeydown"
        >
          <slot name="trigger">
            <IconMenu />
          </slot>
        </span>
        <div
          v-else
          :class="`${prefixCls}-trigger`"
          :style="{ width: siderWidth }"
          role="button"
          tabindex="0"
          :aria-expanded="!mergedCollapsed"
          aria-label="Toggle sidebar"
          @click="toggle"
          @keydown="handleTriggerKeydown"
        >
          <slot name="trigger">
            <component :is="defaultTriggerComponent" />
          </slot>
        </div>
      </template>
    </template>
  </aside>
</template>

<script setup lang="ts">
  import {
    computed,
    inject,
    onMounted,
    onUnmounted,
    provide,
    reactive,
    ref,
    toRef,
    watch,
    type CSSProperties,
    type PropType,
  } from 'vue';

  import type { SiderBreakpoint } from '../_utils/responsive-observe';
  import type { CollapseType, SiderTemporaryDrawerProps } from './interface';

  import { useScrollbar } from '../_hooks/use-scrollbar';
  import { useThemeMode } from '../_hooks/use-theme-mode';
  import { getPrefixCls } from '../_utils/global-config';
  import { isActivationKey } from '../_utils/keyboard';
  import { configProviderInjectionKey } from '../config-provider/context';
  import Drawer from '../drawer';
  import IconLeft from '../icon/icon-left';
  import IconMenu from '../icon/icon-menu';
  import IconRight from '../icon/icon-right';
  import Scrollbar, { type ScrollbarProps } from '../scrollbar';
  import { LayoutContextInjectionKey, SiderContextInjectionKey } from './context';

  let siderUuid = 0;
  const generateId = (prefix = '') => {
    siderUuid += 1;
    return `${prefix}${siderUuid}`;
  };

  defineOptions({ name: 'LayoutSider' });

  const props = defineProps({
    /**
     * @zh 是否可折叠
     * @en Whether can be collapsed
     */
    collapsible: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 当前折叠状态（受控）
     * @en Current collapsed state (controlled)
     */
    collapsed: {
      type: Boolean,
      default: undefined,
    },
    /**
     * @zh 默认折叠状态（非受控）
     * @en Default collapsed state (uncontrolled)
     */
    defaultCollapsed: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 折叠时是否反转箭头方向
     * @en Whether to reverse the arrow direction when collapsed
     */
    reverseArrow: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh collapsedWidth 为 0 时零宽触发器的自定义样式
     * @en Custom style of zero-width trigger when collapsedWidth is 0
     */
    zeroWidthTriggerStyle: {
      type: Object,
      default: undefined,
    },
    /**
     * @zh 是否隐藏内置折叠触发器，配合受控的 collapsed 自行控制折叠
     * @en Whether to hide the built-in collapse trigger, control collapse via collapsed
     */
    hideTrigger: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 展开时的宽度
     * @en Width when expanded
     */
    width: {
      type: [Number, String],
      default: 200,
    },
    /**
     * @zh 折叠时的宽度
     * @en Width when collapsed
     */
    collapsedWidth: {
      type: [Number, String],
      default: 48,
    },
    /**
     * @zh 响应式断点，命中断点时自动折叠
     * @en Responsive breakpoint, auto collapse when matched
     */
    breakpoint: {
      type: String as PropType<SiderBreakpoint>,
      default: undefined,
    },
    /**
     * @zh 主题颜色，未设置时跟随 ConfigProvider 的 themeMode
     * @en Theme color, follows ConfigProvider's themeMode when not set
     */
    theme: {
      type: String as () => 'light' | 'dark',
      default: undefined,
    },
    /**
     * @zh 滚动配置，默认使用组件库 Scrollbar；设为 false 使用原生 overflow:auto，传对象可配置 Scrollbar
     * @en Scroll config, use the component Scrollbar by default; set to false for native overflow:auto, pass an object to configure Scrollbar
     */
    scrollbar: {
      type: [Object, Boolean] as PropType<boolean | ScrollbarProps>,
      default: undefined,
    },
    /**
     * @zh 临时模式：使用 Drawer 渲染悬浮菜单，由 collapsed 控制开合（collapsed=true 关闭，false 展开）
     * @en Temporary mode: render as a floating Drawer, opened/closed via collapsed (collapsed=true closes, false opens)
     */
    temporary: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 窄轨模式：Sider 常驻为窄轨宽度（仅展示图标），与 collapsed 折叠相互独立
     * @en Rail mode: Sider stays at rail width (icons only), independent from collapsed
     */
    rail: {
      type: Boolean as PropType<boolean>,
      default: false,
    },
    /**
     * @zh 窄轨宽度，仅 rail=true 时生效
     * @en Rail width, only effective when rail=true
     */
    railWidth: {
      type: [Number, String],
      default: 72,
    },
    /**
     * @zh 窄轨模式下，鼠标悬停 Sider 时临时展开到 width（覆盖在内容上方，不推动内容），移出后收回。仅 rail=true 时生效
     * @en In rail mode, temporarily expands to width on hover (overlays content without pushing it), collapses on leave. Only effective when rail=true
     */
    expandOnHover: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh temporary 模式下透传给 Drawer 的配置（仅 temporary=true 时生效）
     * @en Drawer passthrough config (only effective when temporary=true)
     */
    drawerProps: {
      type: Object as PropType<SiderTemporaryDrawerProps>,
      default: undefined,
    },
  });

  const emit = defineEmits<{
    /**
     * @zh 折叠状态变化时触发
     * @en Triggered when the collapsed state changes
     */
    (e: 'collapse', collapsed: boolean, type: CollapseType): void;
    /**
     * @zh 响应式断点命中状态变化时触发
     * @en Triggered when the responsive breakpoint match state changes
     */
    (e: 'breakpoint', broken: boolean): void;
    /**
     * @zh 窄轨状态变化时触发（仅 hover 展开收回时，受控 rail 不经此事件）
     * @en Triggered when the rail state changes (only on hover expand/collapse; controlled rail does not go through this)
     */
    (e: 'update:rail', rail: boolean): void;
  }>();

  const prefixCls = getPrefixCls('layout-sider');

  const dimensionMaxMap: Record<string, string> = {
    xs: '479.98px',
    sm: '575.98px',
    md: '767.98px',
    lg: '991.98px',
    xl: '1199.98px',
    xxl: '1599.98px',
    xxxl: '1839.98px',
  };

  const isNumeric = (val: unknown): boolean =>
    !Number.isNaN(Number.parseFloat(val as string)) && Number.isFinite(Number(val));

  const toSiderWidth = (val: number | string): string =>
    isNumeric(val) ? `${val}px` : String(val);

  // ============================ Controlled ============================
  const isControlled = computed(() => props.collapsed !== undefined);
  const collapsedState = ref(props.collapsed ?? props.defaultCollapsed);

  watch(
    () => props.collapsed,
    (val) => {
      if (val !== undefined) {
        collapsedState.value = val;
      }
    },
  );

  const mergedCollapsed = computed(() =>
    isControlled.value ? props.collapsed! : collapsedState.value,
  );

  const handleSetCollapsed = (value: boolean, type: CollapseType) => {
    if (!isControlled.value) {
      collapsedState.value = value;
    }
    emit('collapse', value, type);
  };

  const toggle = () => {
    handleSetCollapsed(!mergedCollapsed.value, 'clickTrigger');
  };

  // role=button 的折叠触发器：键盘 Enter/Space 切换
  const handleTriggerKeydown = (ev: KeyboardEvent) => {
    if (isActivationKey(ev)) {
      ev.preventDefault();
      toggle();
    }
  };

  // ============================ Responsive ============================
  const below = ref(false);

  const setupResponsive = () => {
    const { breakpoint } = props;
    if (typeof window === 'undefined' || !window.matchMedia || !breakpoint) {
      return;
    }

    const max = dimensionMaxMap[breakpoint];
    if (!max) {
      return;
    }

    const mql = window.matchMedia(`screen and (max-width: ${max})`);
    const handler = (m: MediaQueryListEvent | MediaQueryList) => {
      below.value = m.matches;
      emit('breakpoint', m.matches);

      if (mergedCollapsed.value !== m.matches) {
        handleSetCollapsed(m.matches, 'responsive');
      }
    };

    if (typeof mql.addEventListener === 'function') {
      mql.addEventListener('change', handler as (e: MediaQueryListEvent) => void);
    } else if (typeof mql.addListener === 'function') {
      mql.addListener(handler as (e: MediaQueryListEvent) => void);
    }

    handler(mql);

    return () => {
      if (typeof mql.removeEventListener === 'function') {
        mql.removeEventListener('change', handler as (e: MediaQueryListEvent) => void);
      } else if (typeof mql.removeListener === 'function') {
        mql.removeListener(handler as (e: MediaQueryListEvent) => void);
      }
    };
  };

  let cleanupResponsive: (() => void) | undefined;

  onMounted(() => {
    cleanupResponsive = setupResponsive();
  });

  watch(
    () => props.breakpoint,
    () => {
      cleanupResponsive?.();
      cleanupResponsive = setupResponsive();
    },
  );

  onUnmounted(() => {
    cleanupResponsive?.();
  });

  // ============================ Sider register ============================
  const { siderHook } = inject(LayoutContextInjectionKey, {
    siderHook: {
      addSider: () => {},
      removeSider: () => {},
    },
  });

  let siderId = '';
  onMounted(() => {
    siderId = generateId('sd-sider-');
    siderHook.addSider(siderId);
  });
  onUnmounted(() => {
    siderHook.removeSider(siderId);
  });

  // ============================ Trigger ============================
  const configProvider = inject(configProviderInjectionKey, undefined);
  const rtl = computed(() => configProvider?.rtl ?? false);

  // ============================ Theme ============================
  const rootEl = ref<HTMLElement | null>(null);
  // 默认主题跟随 ConfigProvider 的 themeMode（由 ThemeProvider 写入 [sd-theme]）。
  const detectedThemeMode = useThemeMode(rootEl);
  const mergedTheme = computed<'light' | 'dark'>(() => props.theme ?? detectedThemeMode.value);

  const reverseIcon = computed(() => rtl.value === !props.reverseArrow);

  const defaultTriggerComponent = computed(() => {
    // temporary 模式始终使用汉堡图标，展开/收起箭头语义不适用。
    if (props.temporary) return IconMenu;
    const expandedIcon = reverseIcon.value ? IconRight : IconLeft;
    const collapsedIcon = reverseIcon.value ? IconLeft : IconRight;
    return mergedCollapsed.value ? collapsedIcon : expandedIcon;
  });

  // ============================ Rail ============================
  // rail 与 collapsed 相互独立：rail 常驻窄轨（仅图标），collapsed 仍是受控折叠。
  // expand-on-hover 仅在 rail 模式下生效：悬停时临时展开到 width 并覆盖在内容上方（overlay），移出收回。
  const isHovering = ref(false);
  const railHoverEnabled = computed(() => props.rail && props.expandOnHover);
  const isRailExpanded = computed(() => railHoverEnabled.value && isHovering.value);

  const onMouseEnter = () => {
    if (railHoverEnabled.value) {
      isHovering.value = true;
      emit('update:rail', false);
    }
  };

  const onMouseLeave = () => {
    if (railHoverEnabled.value) {
      isHovering.value = false;
      emit('update:rail', true);
    }
  };

  // 实际渲染宽度：rail 悬停展开用 width；rail 常驻用 railWidth；否则按 collapsed 决定。
  const rawWidth = computed(() => {
    if (props.rail) return isRailExpanded.value ? props.width : props.railWidth;
    return mergedCollapsed.value ? props.collapsedWidth : props.width;
  });
  const siderWidth = computed(() => toSiderWidth(rawWidth.value));

  // rail 常驻占位宽度（流内占位不随 hover 变化 → overlay 的关键）。
  const railReservedWidth = computed(() => toSiderWidth(props.railWidth));

  const hasZeroWidth = computed(() => Number.parseFloat(String(props.collapsedWidth || 0)) === 0);

  const renderTrigger = computed(() => {
    if (props.temporary) return !props.hideTrigger;
    return (props.collapsible || (below.value && hasZeroWidth.value)) && !props.hideTrigger;
  });

  // ============================ Scrollbar ============================
  const { scrollbarProps } = useScrollbar(toRef(props, 'scrollbar'));
  const useNativeScrollbar = computed(() => props.scrollbar === false);

  // ============================ Style ============================
  const divStyle = computed(() => {
    // temporary 模式下 aside 退化为触发器宿主，不占据 in-flow 宽度。
    if (props.temporary) {
      return { flex: '0 0 auto', width: 'auto' };
    }
    // rail 模式下 aside 流内占位恒为 railWidth，不随 hover 变化 → 右侧内容零重排。
    // 悬停展开交给内部 overlay 容器（railOverlayStyle），aside 自身不切定位/不变宽。
    if (props.rail) {
      return {
        flex: `0 0 ${railReservedWidth.value}`,
        maxWidth: railReservedWidth.value,
        minWidth: railReservedWidth.value,
        width: railReservedWidth.value,
      };
    }
    return {
      flex: `0 0 ${siderWidth.value}`,
      maxWidth: siderWidth.value,
      minWidth: siderWidth.value,
      width: siderWidth.value,
    };
  });

  // rail 内部 overlay 容器：始终保持绝对定位（脱离文档流，不推动右侧内容），
  // 仅在 railWidth（常驻）与全宽（hover 展开）之间过渡 width → 平滑展开/收回且零重排。
  // 之所以始终 absolute：position 不可动画，若常驻用 static 会在收回过渡中（width 仍宽时）
  // 溢出到内容流；始终 absolute 则过渡期间始终浮于上方，只是覆盖范围渐变。
  const railOverlayStyle = computed<CSSProperties>(() => {
    const base: CSSProperties = {
      position: 'absolute',
      inset: '0',
      width: isRailExpanded.value ? siderWidth.value : railReservedWidth.value,
    };
    return isRailExpanded.value ? { ...base, zIndex: 20 } : base;
  });

  const railOverlayCls = computed(() => [
    `${prefixCls}-rail-overlay`,
    {
      [`${prefixCls}-rail-expand`]: isRailExpanded.value,
    },
  ]);

  const siderCls = computed(() => [
    prefixCls,
    `${prefixCls}-${mergedTheme.value}`,
    {
      [`${prefixCls}-collapsed`]: mergedCollapsed.value,
      [`${prefixCls}-has-trigger`]: props.collapsible && !props.hideTrigger && !hasZeroWidth.value,
      [`${prefixCls}-below`]: below.value,
      [`${prefixCls}-zero-width`]: Number.parseFloat(siderWidth.value) === 0,
      [`${prefixCls}-temporary`]: props.temporary,
      [`${prefixCls}-rail`]: props.rail,
    },
  ]);

  // ============================ Temporary (Drawer) ============================
  // 透传给 Drawer 的配置：默认左抽屉、宽度复用 Sider width、无内置 header/footer；
  // 用户可通过 drawerProps 覆盖 placement/mask/closable 等。
  const mergedDrawerProps = computed(() => ({
    placement: 'left' as const,
    width: siderWidth.value,
    header: false,
    footer: false,
    ...props.drawerProps,
  }));

  // Drawer 的 visible 由 collapsed 反向派生；关闭（点遮罩/ESC/取消）时回写 collapsed=true，
  // 复用现有的受控/非受控与 collapse 事件链路。
  const onDrawerVisibleChange = (visible: boolean) => {
    if (visible !== !mergedCollapsed.value) {
      handleSetCollapsed(!visible, 'clickTrigger');
    }
  };

  // ============================ Context ============================
  // rail 常驻态对后代（如 Menu）也应只显图标；hover 展开时临时恢复文字。
  // siderRailWidth 让 Menu 在 rail 态把折叠宽度对齐到 railWidth，避免图标偏移不居中。
  // Menu 的 collapsedWidth 仅接受数字，故仅透传数字型 railWidth。
  const mergedSiderRail = computed(() => !!props.rail && !isRailExpanded.value);
  const siderRailWidthValue = computed(() =>
    props.rail && typeof props.railWidth === 'number' ? props.railWidth : undefined,
  );
  const siderContext = reactive<{
    siderCollapsed: boolean;
    siderRail: boolean;
    siderRailWidth?: number;
    theme: 'light' | 'dark';
  }>({
    siderCollapsed: mergedCollapsed.value,
    siderRail: mergedSiderRail.value,
    siderRailWidth: siderRailWidthValue.value,
    theme: mergedTheme.value,
  });

  watch(mergedCollapsed, (val) => {
    siderContext.siderCollapsed = val;
  });

  watch(mergedSiderRail, (val) => {
    siderContext.siderRail = val;
  });

  watch(siderRailWidthValue, (val) => {
    siderContext.siderRailWidth = val;
  });

  watch(mergedTheme, (val) => {
    siderContext.theme = val;
  });

  provide(SiderContextInjectionKey, siderContext);
</script>
