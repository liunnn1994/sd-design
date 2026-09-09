<script setup lang="ts">
  import { computed, onBeforeUnmount, provide, shallowRef, watch } from 'vue';

  defineOptions({
    name: 'ThemeProvider',
  });

  import usePopupManager from '../_hooks/use-popup-manager';
  import { getPrefixCls } from '../_utils/global-config';
  import { themePopupContainerInjectionKey } from './context';
  import { applyGlobalTheme, releaseGlobalTheme } from './global-theme';
  import {
    applyThemeCSSVariables,
    clearThemeCSSVariables,
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
  provide(themePopupContainerInjectionKey, popupContainer);
  const normalizedTheme = computed(() => normalizeTheme(props.theme));
  const usesLocalThemeContainer = computed(() => {
    if (props.global) {
      return false;
    }
    return (
      Boolean(props.themeMode) ||
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
    appliedPopupThemeKeys = applyThemeCSSVariables(
      popupContainer.value,
      normalizedTheme.value,
      appliedPopupThemeKeys,
    );

    const inheritedThemeMode = target.closest<HTMLElement>('[sd-theme]')?.getAttribute('sd-theme');
    if (inheritedThemeMode) {
      popupContainer.value.setAttribute('sd-theme', inheritedThemeMode);
    } else {
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
    }
  }
  function syncThemeTarget() {
    const nextTarget = resolveThemeTarget();
    if (!nextTarget) {
      resetActiveTarget();
      cleanupPopupContainer();
      return;
    }

    if (activeTarget && activeTarget !== nextTarget) {
      cleanupTarget(activeTarget);
    }

    if (props.global) {
      applyGlobalTheme(nextTarget, globalOwner, normalizedTheme.value, props.themeMode);
    } else {
      appliedThemeKeys = applyThemeCSSVariables(
        nextTarget,
        normalizedTheme.value,
        appliedThemeKeys,
      );
      if (props.themeMode) nextTarget.setAttribute('sd-theme', props.themeMode);
      else nextTarget.removeAttribute('sd-theme');
    }

    activeTarget = nextTarget;
    activeTargetIsGlobal = props.global;
    syncPopupContainerTheme(nextTarget);
  }

  watch(
    [
      normalizedTheme,
      () => props.themeMode,
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
