<script setup lang="ts">
  import { computed, inject, onBeforeUnmount, provide, shallowRef, watch } from 'vue';

  defineOptions({
    name: 'ThemeProvider',
  });

  import {
    createThemeProviderFoundation,
    getThemeProviderEffectiveMode,
    normalizeThemeProviderTheme,
    hasThemeProviderContainer,
  } from '@sdata/web-core/config-provider/provider';

  import usePopupManager from '../_hooks/use-popup-manager';
  import { getPrefixCls } from '../_utils/global-config';
  import { inheritedThemeInjectionKey, themePopupContainerInjectionKey } from './context';
  import { getThemeCSSVariables, type SdThemeConfig, type SdThemeMode } from './theme';

  const props = withDefaults(
    defineProps<{
      /**
       * @zh 主题配置，包含设计令牌、算法与组件级变量
       * @en Theme configuration: design tokens, algorithms and component variables
       */
      theme?: SdThemeConfig;
      /**
       * @zh 明暗模式
       * @en Light or dark mode
       */
      themeMode?: SdThemeMode;
      /**
       * @zh 是否把主题应用到全局，而非仅当前容器
       * @en Whether the theme is applied globally instead of to this container only
       */
      global?: boolean;
      /**
       * @zh 渲染的根元素标签
       * @en Tag rendered as the provider root
       */
      tag?: string;
    }>(),
    {
      themeMode: undefined,
      global: false,
      tag: 'div',
    },
  );

  const rootElement = shallowRef<HTMLElement | null>(null);
  const popupContainer = shallowRef<HTMLElement | null>(null);
  const parentPopupContainer = inject(themePopupContainerInjectionKey, undefined);
  provide(
    themePopupContainerInjectionKey,
    computed(() => popupContainer.value ?? parentPopupContainer?.value ?? null),
  );
  const parentTheme = inject(inheritedThemeInjectionKey, undefined);
  const inheritedMode = shallowRef<SdThemeMode>();
  const effectiveMode = computed(() => getThemeProviderEffectiveMode(props));
  // 紧凑只改变尺寸；未显式指定明暗时继承父容器或 DOM 主题。
  const popupMode = computed(
    () => effectiveMode.value ?? parentTheme?.mode.value ?? inheritedMode.value,
  );
  const normalizedTheme = computed(() =>
    normalizeThemeProviderTheme(props.theme, () => popupMode.value),
  );
  const popupVariables = computed(() => ({
    ...parentTheme?.variables.value,
    ...getThemeCSSVariables(normalizedTheme.value),
  }));
  provide(inheritedThemeInjectionKey, { variables: popupVariables, mode: popupMode });
  const usesLocalThemeContainer = computed(() =>
    hasThemeProviderContainer({
      get global() {
        return props.global;
      },
      get effectiveMode() {
        return effectiveMode.value;
      },
      get normalizedTheme() {
        return normalizedTheme.value;
      },
    }),
  );

  const themePopupContainerPrefixCls = getPrefixCls('theme-popup-container');

  const { zIndex, close: closePopupManager } = usePopupManager('popup', {
    visible: usesLocalThemeContainer,
  });

  // visible 恒为 true 时卸载不会触发 watch 的 close，导致 zIndex 泄漏在全局弹层栈中
  //（每次挂载/卸载都会抬高后续弹层的 z-index），卸载时手动释放。
  onBeforeUnmount(() => {
    if (usesLocalThemeContainer.value) {
      closePopupManager();
    }
  });

  // 容器的 z-index 只在主题同步时写入一次；后开的 Modal/Drawer 会占据更高的弹层栈位
  // 把容器盖住。监听 zIndex 变化，让容器样式跟随 usePopupManager 分配的值。
  const foundation = createThemeProviderFoundation({
    get global() {
      return props.global;
    },
    get rootElement() {
      return rootElement.value;
    },
    get effectiveMode() {
      return effectiveMode.value;
    },
    get normalizedTheme() {
      return normalizedTheme.value;
    },
    get popupVariables() {
      return popupVariables.value;
    },
    get popupMode() {
      return popupMode.value;
    },
    get usesLocalThemeContainer() {
      return usesLocalThemeContainer.value;
    },
    get popupContainerClass() {
      return themePopupContainerPrefixCls;
    },
    get zIndex() {
      return zIndex.value;
    },
    get popupContainer() {
      return popupContainer.value;
    },
    set popupContainer(value) {
      popupContainer.value = value;
    },
    get inheritedMode() {
      return inheritedMode.value;
    },
    set inheritedMode(value) {
      inheritedMode.value = value;
    },
  });
  watch(zIndex, foundation.syncPopupZIndex);

  watch(
    [
      normalizedTheme,
      popupVariables,
      popupMode,
      effectiveMode,
      () => props.global,
      usesLocalThemeContainer,
      rootElement,
    ],
    foundation.syncThemeTarget,
    {
      deep: true,
      immediate: true,
      flush: 'post',
    },
  );

  onBeforeUnmount(foundation.dispose);
</script>

<template>
  <component
    :is="tag"
    v-if="usesLocalThemeContainer"
    ref="rootElement"
    :class="getPrefixCls('theme-provider')"
  >
    <slot />
  </component>
  <slot v-else />
</template>
