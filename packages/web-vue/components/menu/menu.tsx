import { computed, defineComponent, inject, InjectionKey, PropType, provide, toRefs } from 'vue';

import type { FloatingOptions } from '../_utils/floating';

import { EllipsisTooltipProps } from '../ellipsis';
import { SiderContextInjectionKey } from '../layout/context';
import BaseMenu from './base-menu.vue';
import { LevelContext, LevelInjectionKey, MenuContext, MenuInjectionKey } from './context';
import OverflowWrap from './overflow-wrap';

export default defineComponent({
  name: 'Menu',
  components: {
    BaseMenu,
  },
  inheritAttrs: false,
  props: {
    /** 菜单风格 */
    theme: {
      type: String as PropType<'light' | 'dark'>,
    },
    mode: {
      type: String as PropType<'vertical' | 'horizontal' | 'pop' | 'popButton'>,
      default: 'vertical',
    },
    ellipsis: {
      type: Boolean,
      default: false,
    },
    ellipsisProps: {
      type: Object as PropType<{
        lineClamp?: number | string;
        expandTrigger?: 'click';
        tooltip?: boolean | EllipsisTooltipProps;
      }>,
      default: undefined,
    },
    floatingOptions: {
      type: Object as PropType<FloatingOptions>,
    },
  },
  setup(props, { attrs, slots }) {
    const { theme: propTheme, mode } = toRefs(props);

    const siderContext = inject(SiderContextInjectionKey, undefined);
    const siderCollapsed = computed(() => siderContext?.siderCollapsed || false);
    // rail 常驻态同样收起菜单文字（仅显图标），hover 展开时由 Sider 把 siderRail 置 false。
    const siderRailCollapsed = computed(() => siderContext?.siderRail || false);
    const siderMenuCollapsed = computed(() => siderCollapsed.value || siderRailCollapsed.value);
    // rail 态下让菜单图标在 railWidth 内居中（折叠菜单图标默认靠左，48px 设计）。
    const siderRailCls = computed(() => (siderContext?.siderRail ? 'sd-menu-in-sider-rail' : ''));
    // rail 态下让 Menu 折叠宽度对齐 railWidth，避免 railWidth 与菜单默认折叠宽度（48px）
    // 不一致导致图标偏移不居中。Menu 的 collapsedWidth 仅接受数字，railWidth 为字符串时退回 72。
    const siderMenuCollapsedWidth = computed<number | undefined>(() => {
      if (!siderContext?.siderRail) return undefined;
      const railWidth = siderContext?.siderRailWidth;
      return typeof railWidth === 'number' ? railWidth : 72;
    });
    const theme = computed(
      () => (propTheme?.value || siderContext?.theme || 'light') as 'light' | 'dark',
    );

    // 截断上下文
    provide(MenuInjectionKey as InjectionKey<MenuContext | undefined>, undefined);
    provide(LevelInjectionKey as InjectionKey<LevelContext | undefined>, undefined);

    return () => {
      // rail 默认折叠宽度先铺底，用户 attrs（含 collapsed-width）在后展开从而优先覆盖；
      // 非 rail 态 siderMenuCollapsedWidth 为 undefined，不写入，行为与改动前一致。
      const railDefault =
        siderMenuCollapsedWidth.value !== undefined
          ? { collapsedWidth: siderMenuCollapsedWidth.value }
          : {};
      const mergedClass = [attrs.class, siderRailCls.value].filter(Boolean).join(' ');
      return (
        <BaseMenu
          {...props}
          {...railDefault}
          {...attrs}
          class={mergedClass || undefined}
          v-slots={{
            ...slots,
            default:
              mode.value === 'horizontal' && slots.default
                ? () => <OverflowWrap>{slots.default?.()}</OverflowWrap>
                : slots.default,
          }}
          theme={theme.value}
          inTrigger={false}
          siderCollapsed={siderMenuCollapsed.value}
          isRoot
        />
      );
    };
  },
});
