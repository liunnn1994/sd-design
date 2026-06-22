<template>
  <aside ref="rootEl" :class="siderCls" :style="divStyle">
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
        @click="toggle"
      >
        <slot name="trigger">
          <IconMenu />
        </slot>
      </span>
      <div v-else :class="`${prefixCls}-trigger`" :style="{ width: siderWidth }" @click="toggle">
        <slot name="trigger">
          <component :is="defaultTriggerComponent" />
        </slot>
      </div>
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
    type PropType,
  } from 'vue';

  import type { SiderBreakpoint } from '../_utils/responsive-observe';
  import type { CollapseType } from './interface';

  import { useScrollbar } from '../_hooks/use-scrollbar';
  import { useThemeMode } from '../_hooks/use-theme-mode';
  import { getPrefixCls } from '../_utils/global-config';
  import { configProviderInjectionKey } from '../config-provider/context';
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
    const expandedIcon = reverseIcon.value ? IconRight : IconLeft;
    const collapsedIcon = reverseIcon.value ? IconLeft : IconRight;
    return mergedCollapsed.value ? collapsedIcon : expandedIcon;
  });

  const rawWidth = computed(() => (mergedCollapsed.value ? props.collapsedWidth : props.width));
  const siderWidth = computed(() => toSiderWidth(rawWidth.value));

  const hasZeroWidth = computed(() => Number.parseFloat(String(props.collapsedWidth || 0)) === 0);

  const renderTrigger = computed(
    () => (props.collapsible || (below.value && hasZeroWidth.value)) && !props.hideTrigger,
  );

  // ============================ Scrollbar ============================
  const { scrollbarProps } = useScrollbar(toRef(props, 'scrollbar'));
  const useNativeScrollbar = computed(() => props.scrollbar === false);

  // ============================ Style ============================
  const divStyle = computed(() => ({
    flex: `0 0 ${siderWidth.value}`,
    maxWidth: siderWidth.value,
    minWidth: siderWidth.value,
    width: siderWidth.value,
  }));

  const siderCls = computed(() => [
    prefixCls,
    `${prefixCls}-${mergedTheme.value}`,
    {
      [`${prefixCls}-collapsed`]: mergedCollapsed.value,
      [`${prefixCls}-has-trigger`]: props.collapsible && !props.hideTrigger && !hasZeroWidth.value,
      [`${prefixCls}-below`]: below.value,
      [`${prefixCls}-zero-width`]: Number.parseFloat(siderWidth.value) === 0,
    },
  ]);

  // ============================ Context ============================
  const siderContext = reactive<{ siderCollapsed: boolean; theme: 'light' | 'dark' }>({
    siderCollapsed: mergedCollapsed.value,
    theme: mergedTheme.value,
  });

  watch(mergedCollapsed, (val) => {
    siderContext.siderCollapsed = val;
  });

  watch(mergedTheme, (val) => {
    siderContext.theme = val;
  });

  provide(SiderContextInjectionKey, siderContext);
</script>
