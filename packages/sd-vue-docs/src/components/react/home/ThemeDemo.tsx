/** @jsxImportSource react */

import { Alert, ConfigProvider, Spin } from '@sdata/web-react';
import { Component, Suspense, lazy, useMemo, type ComponentType, type ReactNode } from 'react';

import type { ThemeConfig } from '../../theme/theme-playground';

const modules = import.meta.glob<{ default: ComponentType }>('../generated/*/*.tsx');
class DemoBoundary extends Component<{ children: ReactNode }, { error: string }> {
  state = { error: '' };
  static getDerivedStateFromError(error: Error) {
    return { error: error.message };
  }
  render() {
    return this.state.error ? (
      <Alert type="error">示例加载失败：{this.state.error}</Alert>
    ) : (
      this.props.children
    );
  }
}

export default function ThemeDemo({ theme, path }: { theme: ThemeConfig; path: string }) {
  const Demo = useMemo(() => {
    const load = modules[path.replace(/\.vue$/, '.tsx')];
    return load ? lazy(load) : undefined;
  }, [path]);
  return (
    <ConfigProvider theme={theme}>
      <DemoBoundary key={path}>
        <Suspense fallback={<Spin />}>
          {Demo ? <Demo /> : <Alert type="error">找不到对应的 React 示例。</Alert>}
        </Suspense>
      </DemoBoundary>
    </ConfigProvider>
  );
}
