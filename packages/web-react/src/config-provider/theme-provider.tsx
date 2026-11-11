import type { SdThemeConfig, SdThemeMode } from '@sdata/web-core/config-provider/theme';
import type { HTMLAttributes } from 'react';

import {
  createThemeProviderFoundation,
  getThemeProviderEffectiveMode,
  normalizeThemeProviderTheme,
  hasThemeProviderContainer,
} from '@sdata/web-core/config-provider/provider';
import { getThemeCSSVariables } from '@sdata/web-core/config-provider/theme';
import { createPopupEntry } from '@sdata/web-core/popup/manager';
import { createContext, createElement, useContext, useLayoutEffect, useRef, useState } from 'react';

import { usePrefix } from './index.js';

export interface ThemeProviderProps extends HTMLAttributes<HTMLElement> {
  theme?: SdThemeConfig;
  themeMode?: SdThemeMode;
  global?: boolean;
  tag?: string;
}

interface ThemeContextValue {
  variables: Record<string, string>;
  mode?: SdThemeMode;
  popupContainer: HTMLElement | null;
}

export const ThemeContext = createContext<ThemeContextValue>({
  variables: {},
  popupContainer: null,
});

export function ThemeProvider(props: ThemeProviderProps) {
  const {
    theme: _theme,
    themeMode: _themeMode,
    global: _global,
    tag = 'div',
    children,
    className,
    ...attrs
  } = props;
  const prefix = usePrefix('theme-provider');
  const popupPrefix = usePrefix('theme-popup-container');
  const parent = useContext(ThemeContext);
  const [, render] = useState(0);
  const root = useRef<HTMLElement>(null);
  const runtime = useRef({
    props,
    parent,
    inheritedMode: undefined as SdThemeMode | undefined,
    popup: null as HTMLElement | null,
    popupPrefix,
    zIndex: 0,
    mounted: false,
  });
  runtime.current.props = props;
  runtime.current.parent = parent;
  runtime.current.popupPrefix = popupPrefix;
  const mode = () =>
    getThemeProviderEffectiveMode(runtime.current.props) ??
    runtime.current.parent.mode ??
    runtime.current.inheritedMode;
  const normalized = () => normalizeThemeProviderTheme(runtime.current.props.theme, mode);
  const local = () =>
    hasThemeProviderContainer({
      global: !!runtime.current.props.global,
      effectiveMode: getThemeProviderEffectiveMode(runtime.current.props),
      normalizedTheme: normalized(),
    });
  const variables = () => ({
    ...runtime.current.parent.variables,
    ...getThemeCSSVariables(normalized()),
  });
  const update = () => {
    if (runtime.current.mounted) render((count) => count + 1);
  };
  const [foundation] = useState(() =>
    createThemeProviderFoundation({
      get global() {
        return !!runtime.current.props.global;
      },
      get rootElement() {
        return root.current;
      },
      get effectiveMode() {
        return getThemeProviderEffectiveMode(runtime.current.props);
      },
      get normalizedTheme() {
        return normalized();
      },
      get popupVariables() {
        return variables();
      },
      get popupMode() {
        return mode();
      },
      get usesLocalThemeContainer() {
        return local();
      },
      get popupContainerClass() {
        return runtime.current.popupPrefix;
      },
      get zIndex() {
        return runtime.current.zIndex;
      },
      get popupContainer() {
        return runtime.current.popup;
      },
      set popupContainer(value) {
        if (runtime.current.popup !== value) {
          runtime.current.popup = value;
          update();
        }
      },
      get inheritedMode() {
        return runtime.current.inheritedMode;
      },
      set inheritedMode(value) {
        if (runtime.current.inheritedMode !== value) {
          runtime.current.inheritedMode = value;
          update();
        }
      },
    }),
  );
  const [popup] = useState(() =>
    createPopupEntry('popup', {
      get zIndex() {
        return runtime.current.zIndex;
      },
      setZIndex(value) {
        runtime.current.zIndex = value;
        foundation.syncPopupZIndex(value);
      },
    }),
  );
  const hasContainer = local();
  useLayoutEffect(() => {
    runtime.current.mounted = true;
    return () => {
      runtime.current.mounted = false;
      foundation.dispose();
      popup.close();
    };
  }, [foundation, popup]);
  useLayoutEffect(() => {
    if (hasContainer) popup.open();
    else popup.close();
    return popup.close;
  }, [hasContainer, popup]);
  useLayoutEffect(() => {
    foundation.syncThemeTarget();
  });
  return (
    <ThemeContext.Provider
      value={{
        variables: variables(),
        mode: mode(),
        popupContainer: runtime.current.popup ?? parent.popupContainer,
      }}
    >
      {hasContainer
        ? createElement(
            tag,
            { ...attrs, ref: root, className: [prefix, className].filter(Boolean).join(' ') },
            children,
          )
        : children}
    </ThemeContext.Provider>
  );
}
