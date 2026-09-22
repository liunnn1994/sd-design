<script setup lang="ts">
  import { computed, inject, onBeforeUnmount, provide, shallowRef, watch } from 'vue';

  defineOptions({
    name: 'ThemeProvider',
  });

  import usePopupManager from '../_hooks/use-popup-manager';
  import { getPrefixCls } from '../_utils/global-config';
  import { inheritedThemeInjectionKey, themePopupContainerInjectionKey } from './context';
  import { applyGlobalTheme, releaseGlobalTheme } from './global-theme';
  import {
    applyThemeCSSVariables,
    applyThemeCSSVariableMap,
    clearThemeCSSVariables,
    getThemeCSSVariables,
    normalizeTheme,
    type SdThemeConfig,
    type SdThemeMode,
  } from './theme';

  const props = withDefaults(
    defineProps<{
      theme?: SdThemeConfig;
      themeMode?: SdThemeMode;
      global?: boolean;
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
  const effectiveMode = computed(
    () => props.themeMode ?? (props.theme?.algorithm?.includes('dark') ? 'dark' : undefined),
  );
  // 紧凑只改变尺寸；未显式指定明暗时继承父容器或 DOM 主题。
  const popupMode = computed(
    () => effectiveMode.value ?? parentTheme?.mode.value ?? inheritedMode.value,
  );
  const normalizedTheme = computed(() => {
    if (!props.theme) return normalizeTheme();
    return normalizeTheme({
      ...props.theme,
      algorithm: [
        ...(props.theme.algorithm ?? []).filter((algorithm) => algorithm !== 'dark'),
        ...(popupMode.value === 'dark' ? ['dark' as const] : []),
      ],
    });
  });
  const popupVariables = computed(() => ({
    ...parentTheme?.variables.value,
    ...getThemeCSSVariables(normalizedTheme.value),
  }));
  provide(inheritedThemeInjectionKey, { variables: popupVariables, mode: popupMode });
  const usesLocalThemeContainer = computed(() => {
    if (props.global) {
      return false;
    }
    return (
      Boolean(effectiveMode.value) ||
      Object.keys(normalizedTheme.value.tokens).length > 0 ||
      Object.keys(normalizedTheme.value.components).length > 0
    );
  });

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
  watch(zIndex, (value) => {
    if (popupContainer.value) {
      popupContainer.value.style.zIndex = String(value);
    }
  });

  let appliedThemeKeys = new Set<string>();
  let appliedPopupThemeKeys = new Set<string>();
  let activeTarget: HTMLElement | null = null;
  let activeTargetIsGlobal = false;
  const globalOwner = Symbol('ThemeProvider');
  let inheritedModeObserver: MutationObserver | undefined;
  let observedModeSource: Element | null = null;

  function cleanupPopupContainer() {
    if (!popupContainer.value) {
      return;
    }

    clearThemeCSSVariables(popupContainer.value, appliedPopupThemeKeys);
    appliedPopupThemeKeys = new Set<string>();
    popupContainer.value.removeAttribute('sd-theme');

    if (popupContainer.value.parentNode) {
      popupContainer.value.parentNode.removeChild(popupContainer.value);
    }
    popupContainer.value = null;
  }

  function ensurePopupContainer() {
    if (popupContainer.value || typeof document === 'undefined') {
      return;
    }
    const containerElement = document.createElement('div');
    containerElement.className = themePopupContainerPrefixCls;
    document.body.appendChild(containerElement);
    popupContainer.value = containerElement;
  }

  function syncPopupContainerTheme(target: HTMLElement | null) {
    if (props.global || !target || !usesLocalThemeContainer.value) {
      cleanupPopupContainer();
      return;
    }

    ensurePopupContainer();
    if (!popupContainer.value) {
      return;
    }

    // 响应式设置 z-index，和 Trigger 机制一致
    popupContainer.value.style.zIndex = String(zIndex.value);
    appliedPopupThemeKeys = applyThemeCSSVariableMap(
      popupContainer.value,
      popupVariables.value,
      appliedPopupThemeKeys,
    );

    const inheritedThemeMode =
      popupMode.value ?? target.closest<HTMLElement>('[sd-theme]')?.getAttribute('sd-theme');
    // 弹层容器在 body 下，处于 subtree 观察范围内，仅在值变化时写入。
    if (inheritedThemeMode) {
      if (popupContainer.value.getAttribute('sd-theme') !== inheritedThemeMode)
        popupContainer.value.setAttribute('sd-theme', inheritedThemeMode);
    } else if (popupContainer.value.hasAttribute('sd-theme')) {
      popupContainer.value.removeAttribute('sd-theme');
    }
  }

  function resolveThemeTarget(): HTMLElement | null {
    if (typeof document === 'undefined') {
      return null;
    }

    if (props.global) {
      return document.body || document.documentElement;
    }

    if (!usesLocalThemeContainer.value) {
      return null;
    }

    return rootElement.value;
  }

  function resetActiveTarget() {
    if (!activeTarget) {
      return;
    }

    cleanupTarget(activeTarget);
    activeTarget = null;
  }

  function cleanupTarget(target: HTMLElement | null) {
    if (!target) {
      return;
    }

    if (activeTargetIsGlobal) {
      releaseGlobalTheme(target, globalOwner);
    } else {
      clearThemeCSSVariables(target, appliedThemeKeys);
      appliedThemeKeys = new Set<string>();
      target.removeAttribute('sd-theme');
      target.removeAttribute('data-sd-theme');
    }
  }
  function syncThemeTarget() {
    const nextTarget = resolveThemeTarget();
    if (!nextTarget) {
      // 透传（无容器无目标）：停止跟踪环境明暗并清空继承值，
      // 避免向后代永久注入过期的模式。
      inheritedModeObserver?.disconnect();
      inheritedModeObserver = undefined;
      observedModeSource = null;
      inheritedMode.value = undefined;
      resetActiveTarget();
      cleanupPopupContainer();
      return;
    }

    if (activeTarget && activeTarget !== nextTarget) {
      cleanupTarget(activeTarget);
    }

    // 环境明暗来源：global 以挂载点自身为准（body），local 跟随最近祖先。
    // Token-only 边界不声明明暗，持续跟随来源，让 deriveThemeTokens 按真实
    // 模式推导色阶，而不是把亮色变量内联覆盖到暗色页面上。
    const source = props.global
      ? (nextTarget.closest('[sd-theme], [data-sd-theme]') ?? nextTarget)
      : (nextTarget.parentElement?.closest('[sd-theme], [data-sd-theme]') ?? document.body);
    inheritedMode.value =
      (source.getAttribute('sd-theme') ?? source.getAttribute('data-sd-theme')) === 'dark'
        ? 'dark'
        : 'light';

    if (props.global) {
      applyGlobalTheme(nextTarget, globalOwner, normalizedTheme.value, effectiveMode.value);
    } else {
      appliedThemeKeys = applyThemeCSSVariables(
        nextTarget,
        normalizedTheme.value,
        appliedThemeKeys,
      );
      // 仅在值变化时写入：subtree 观察会把 mutation 广播给所有 provider，
      // 无变化的 setAttribute 同样产生记录，会造成 provider 间互相唤醒空转。
      if (effectiveMode.value) {
        if (nextTarget.getAttribute('sd-theme') !== effectiveMode.value)
          nextTarget.setAttribute('sd-theme', effectiveMode.value);
      } else if (nextTarget.hasAttribute('sd-theme')) {
        nextTarget.removeAttribute('sd-theme');
      }
      const resolvedMode = popupMode.value ?? 'light';
      if (nextTarget.getAttribute('data-sd-theme') !== resolvedMode)
        nextTarget.setAttribute('data-sd-theme', resolvedMode);
    }

    if (observedModeSource !== source) {
      inheritedModeObserver?.disconnect();
      observedModeSource = source;
      inheritedModeObserver = new MutationObserver(syncThemeTarget);
      // subtree：中间动态挂载的 provider 会在来源子树内写入 data-sd-theme，
      // 必须重解析 source 才能跟上嵌套结构变化。
      inheritedModeObserver.observe(source, {
        attributes: true,
        attributeFilter: ['sd-theme', 'data-sd-theme'],
        subtree: true,
      });
    }

    activeTarget = nextTarget;
    activeTargetIsGlobal = props.global;
    syncPopupContainerTheme(nextTarget);
  }

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
    syncThemeTarget,
    {
      deep: true,
      immediate: true,
      flush: 'post',
    },
  );

  onBeforeUnmount(() => {
    inheritedModeObserver?.disconnect();
    cleanupTarget(activeTarget);
    cleanupPopupContainer();
    activeTarget = null;
  });
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
