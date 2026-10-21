import { applyGlobalTheme, releaseGlobalTheme } from './global-theme.js';
import {
  applyThemeCSSVariables,
  applyThemeCSSVariableMap,
  clearThemeCSSVariables,
  normalizeTheme,
  type SDThemeNormalized,
  type SdThemeConfig,
  type SdThemeMode,
} from './theme.js';

export function getThemeProviderEffectiveMode(props: {
  readonly themeMode?: SdThemeMode | undefined;
  readonly theme?: SdThemeConfig | undefined;
}) {
  return props.themeMode ?? (props.theme?.algorithm?.includes('dark') ? 'dark' : undefined);
}

export function normalizeThemeProviderTheme(
  theme: SdThemeConfig | undefined,
  getPopupMode: () => SdThemeMode | undefined,
) {
  if (!theme) return normalizeTheme();
  return normalizeTheme({
    ...theme,
    algorithm: [
      ...(theme.algorithm ?? []).filter((algorithm) => algorithm !== 'dark'),
      ...(getPopupMode() === 'dark' ? ['dark' as const] : []),
    ],
  });
}

export function hasThemeProviderContainer(state: {
  readonly global: boolean;
  readonly effectiveMode: SdThemeMode | undefined;
  readonly normalizedTheme: SDThemeNormalized;
}) {
  if (state.global) return false;
  return (
    Boolean(state.effectiveMode) ||
    Object.keys(state.normalizedTheme.tokens).length > 0 ||
    Object.keys(state.normalizedTheme.components).length > 0
  );
}

export interface ThemeProviderFoundationState {
  readonly global: boolean;
  readonly rootElement: HTMLElement | null;
  readonly effectiveMode: SdThemeMode | undefined;
  readonly normalizedTheme: SDThemeNormalized;
  readonly popupVariables: Record<string, string>;
  readonly popupMode: SdThemeMode | undefined;
  readonly usesLocalThemeContainer: boolean;
  readonly popupContainerClass: string;
  readonly zIndex: number;
  popupContainer: HTMLElement | null;
  inheritedMode: SdThemeMode | undefined;
}

export function createThemeProviderFoundation(state: ThemeProviderFoundationState) {
  let appliedThemeKeys = new Set<string>();
  let appliedPopupThemeKeys = new Set<string>();
  let activeTarget: HTMLElement | null = null;
  let activeTargetIsGlobal = false;
  const globalOwner = Symbol('ThemeProvider');
  let inheritedModeObserver: MutationObserver | undefined;
  let observedModeSource: Element | null = null;

  function cleanupPopupContainer() {
    if (!state.popupContainer) {
      return;
    }

    clearThemeCSSVariables(state.popupContainer, appliedPopupThemeKeys);
    appliedPopupThemeKeys = new Set<string>();
    state.popupContainer.removeAttribute('sd-theme');

    if (state.popupContainer.parentNode) {
      state.popupContainer.parentNode.removeChild(state.popupContainer);
    }
    state.popupContainer = null;
  }

  function ensurePopupContainer() {
    if (state.popupContainer || typeof document === 'undefined') {
      return;
    }
    const containerElement = document.createElement('div');
    containerElement.className = state.popupContainerClass;
    document.body.appendChild(containerElement);
    state.popupContainer = containerElement;
  }

  function syncPopupContainerTheme(target: HTMLElement | null) {
    if (state.global || !target || !state.usesLocalThemeContainer) {
      cleanupPopupContainer();
      return;
    }

    ensurePopupContainer();
    if (!state.popupContainer) {
      return;
    }

    // 响应式设置 z-index，和 Trigger 机制一致
    state.popupContainer.style.zIndex = String(state.zIndex);
    appliedPopupThemeKeys = applyThemeCSSVariableMap(
      state.popupContainer,
      state.popupVariables,
      appliedPopupThemeKeys,
    );

    const inheritedThemeMode =
      state.popupMode ?? target.closest<HTMLElement>('[sd-theme]')?.getAttribute('sd-theme');
    // 弹层容器在 body 下，处于 subtree 观察范围内，仅在值变化时写入。
    if (inheritedThemeMode) {
      if (state.popupContainer.getAttribute('sd-theme') !== inheritedThemeMode)
        state.popupContainer.setAttribute('sd-theme', inheritedThemeMode);
    } else if (state.popupContainer.hasAttribute('sd-theme')) {
      state.popupContainer.removeAttribute('sd-theme');
    }
  }

  function resolveThemeTarget(): HTMLElement | null {
    if (typeof document === 'undefined') {
      return null;
    }

    if (state.global) {
      return document.body || document.documentElement;
    }

    if (!state.usesLocalThemeContainer) {
      return null;
    }

    return state.rootElement;
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
      state.inheritedMode = undefined;
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
    const source = state.global
      ? (nextTarget.closest('[sd-theme], [data-sd-theme]') ?? nextTarget)
      : (nextTarget.parentElement?.closest('[sd-theme], [data-sd-theme]') ?? document.body);
    state.inheritedMode =
      (source.getAttribute('sd-theme') ?? source.getAttribute('data-sd-theme')) === 'dark'
        ? 'dark'
        : 'light';

    if (state.global) {
      applyGlobalTheme(nextTarget, globalOwner, state.normalizedTheme, state.effectiveMode);
    } else {
      appliedThemeKeys = applyThemeCSSVariables(
        nextTarget,
        state.normalizedTheme,
        appliedThemeKeys,
      );
      // 仅在值变化时写入：subtree 观察会把 mutation 广播给所有 provider，
      // 无变化的 setAttribute 同样产生记录，会造成 provider 间互相唤醒空转。
      if (state.effectiveMode) {
        if (nextTarget.getAttribute('sd-theme') !== state.effectiveMode)
          nextTarget.setAttribute('sd-theme', state.effectiveMode);
      } else if (nextTarget.hasAttribute('sd-theme')) {
        nextTarget.removeAttribute('sd-theme');
      }
      const resolvedMode = state.popupMode ?? 'light';
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
    activeTargetIsGlobal = state.global;
    syncPopupContainerTheme(nextTarget);
  }

  function syncPopupZIndex(value: number) {
    if (state.popupContainer) state.popupContainer.style.zIndex = String(value);
  }
  function dispose() {
    inheritedModeObserver?.disconnect();
    cleanupTarget(activeTarget);
    cleanupPopupContainer();
    activeTarget = null;
  }
  return { syncThemeTarget, syncPopupZIndex, dispose };
}
