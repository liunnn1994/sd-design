/** @jsxImportSource react */

import {
  Alert,
  Button,
  Card,
  ConfigProvider,
  Input,
  Select,
  Space,
  Tag,
  normalizeTheme,
} from '@sdata/web-react';

import type { ThemePreviewProps } from '../../theme/theme-preview-types';

import '../../theme/ThemePreviewPanel.scss';

export default function ThemePreviewPanel({
  preset,
  theme,
  themeMode,
  compact,
}: ThemePreviewProps) {
  const metric =
    Object.keys(normalizeTheme(theme).tokens).length +
    Object.values(theme.components ?? {}).reduce(
      (sum, tokens) => sum + Object.keys(tokens).length,
      0,
    );
  return (
    <ConfigProvider theme={theme} themeMode={themeMode ?? preset.mode ?? 'light'}>
      <section
        className={`theme-preview-panel is-${preset.key}${compact ? ' is-compact' : ''}`}
        style={
          {
            '--theme-preview-primary': 'rgb(var(--sd-primary-6))',
            '--theme-preview-background': 'var(--sd-color-bg-2)',
            '--theme-preview-surface': 'var(--sd-color-bg-5)',
            '--theme-preview-text': 'var(--sd-color-text-1)',
            '--theme-preview-text-muted': 'var(--sd-color-text-3)',
            '--theme-preview-border': 'var(--sd-color-border-2)',
          } as React.CSSProperties
        }
      >
        <header className="theme-preview-panel__hero">
          <div>
            <p className="theme-preview-panel__eyebrow">{preset.name}</p>
            <h3>{preset.summary}</h3>
            <p>{preset.description}</p>
          </div>
          <Card className="theme-preview-panel__metric" bordered={false}>
            <strong>{metric}</strong>
            <span>个样式变量已覆盖</span>
          </Card>
        </header>
        <div className="theme-preview-panel__grid">
          <Card title="主题动作" className="theme-preview-panel__card">
            <Space wrap>
              <Button type="primary">发布主题</Button>
              <Button>保存草稿</Button>
              <Button type="secondary">导出 JSON</Button>
            </Space>
            <Space wrap style={{ marginTop: 16 }}>
              <Tag color="blue">预览中</Tag>
              <Tag color="green">已同步</Tag>
              <Tag color="orange">待评审</Tag>
            </Space>
          </Card>
          <Card title="表单与反馈" className="theme-preview-panel__card">
            <Space direction="vertical" fill>
              <Input placeholder="搜索 token 或组件" allowClear />
              <Select
                placeholder="选择主题分组"
                options={[{ label: '默认分组', value: 'default' }]}
              />
              <Alert type="success">ConfigProvider 已接收新的 theme 对象。</Alert>
            </Space>
          </Card>
        </div>
      </section>
    </ConfigProvider>
  );
}
