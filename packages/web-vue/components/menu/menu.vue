<template>
  <BaseMenu
    v-bind="{ ...props, ...railDefault, ...$attrs }"
    :class="mergedClass || undefined"
    :theme="theme"
    :in-trigger="false"
    :sider-collapsed="siderMenuCollapsed"
    is-root
  >
    <template v-for="name in namedSlotNames" #[name]="slotData">
      <slot :name="name" v-bind="slotData ?? {}" />
    </template>
    <template v-if="$slots.default" #default>
      <OverflowWrap v-if="mode === 'horizontal'">
        <slot />
      </OverflowWrap>
      <slot v-else />
    </template>
  </BaseMenu>
</template>

<script setup lang="ts">
  import {
    computed,
    inject,
    provide,
    useAttrs,
    useSlots,
    type InjectionKey,
    type PropType,
  } from 'vue';

  import type { FloatingOptions } from '../_utils/floating';
  import type { EllipsisTooltipProps } from '../ellipsis';
  import type { LevelContext, MenuContext } from './context';

  import { SiderContextInjectionKey } from '../layout/context';
  import BaseMenu from './base-menu.vue';
  import { LevelInjectionKey, MenuInjectionKey } from './context';
  import OverflowWrap from './overflow-wrap.vue';

  defineOptions({
    name: 'Menu',
    inheritAttrs: false,
  });

  const props = defineProps({
    /** 菜单风格 */
    theme: String as PropType<'light' | 'dark'>,
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
    floatingOptions: Object as PropType<FloatingOptions>,
  });

  const attrs = useAttrs();
  const slots = useSlots();
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
    const railWidth = siderContext.siderRailWidth;
    return typeof railWidth === 'number' ? railWidth : 72;
  });
  const theme = computed(() => (props.theme || siderContext?.theme || 'light') as 'light' | 'dark');
  const railDefault = computed(() =>
    siderMenuCollapsedWidth.value !== undefined
      ? { collapsedWidth: siderMenuCollapsedWidth.value }
      : {},
  );
  const mergedClass = computed(() => [attrs.class, siderRailCls.value].filter(Boolean).join(' '));
  const namedSlotNames = computed(() => Object.keys(slots).filter((name) => name !== 'default'));

  // 截断上下文
  provide(MenuInjectionKey as InjectionKey<MenuContext | undefined>, undefined);
  provide(LevelInjectionKey as InjectionKey<LevelContext | undefined>, undefined);
</script>
