/** @jsxImportSource react */
import { Alert, Button, ConfigProvider, Input, RadioGroup, Space, Tag } from '@sdata/web-react';
import { useState } from 'react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('dark');
  const themeModeOptions = [
    { label: '浅色', value: 'light' },
    { label: '深色', value: 'dark' },
  ];
  const theme = (() => {
    return {
      tokens: {},
    };
  })();
  const runtimePayload = (() => {
    return {
      mode: themeMode,
      theme: theme,
    };
  })();

  return (
    <>
      <div data-v-f065f6df="" className={'theme-mode-demo'}>
        <Space data-v-f065f6df="" align={'center'} wrap={true}>
          <RadioGroup
            data-v-f065f6df=""
            type={'button'}
            value={themeMode}
            onValueChange={(next) => setThemeMode(next as typeof themeMode)}
            options={themeModeOptions}
          />
          <Tag data-v-f065f6df="" color={'blue'}>
            {'局部主题容器：'}
            {formatValue(themeMode)}
          </Tag>
        </Space>
        <ConfigProvider
          data-v-f065f6df=""
          theme={runtimePayload.theme}
          themeMode={runtimePayload.mode}
        >
          <div data-v-f065f6df="" className={'theme-mode-demo__panel'}>
            <Space data-v-f065f6df="" direction={'vertical'} fill={true}>
              <Alert data-v-f065f6df="" type={'success'} title={<>{'局部主题提供器'}</>}>
                {' 这个区域只受当前 ConfigProvider 的局部主题影响，不依赖文档站 body 的主题。 '}
              </Alert>
              <Space data-v-f065f6df="" wrap={true}>
                <Button data-v-f065f6df="" type={'primary'}>
                  {'主要'}
                </Button>
                <Button data-v-f065f6df="" status={'success'}>
                  {'成功'}
                </Button>
                <Button data-v-f065f6df="" type={'secondary'}>
                  {'次要'}
                </Button>
              </Space>
              <Input
                data-v-f065f6df=""
                placeholder={'检查 text/fill/primary 相关 token'}
                allowClear={true}
              />
            </Space>
          </div>
        </ConfigProvider>
      </div>
      <style>
        {
          '.theme-mode-demo[data-v-f065f6df] {\n  display: grid;\n  gap: 12px;\n}\n.theme-mode-demo__panel[data-v-f065f6df] {\n  padding: 16px;\n  border: 1px solid var(--sd-color-border-2);\n  border-radius: 12px;\n  background: var(--sd-color-bg-2);\n  color: var(--sd-color-text-1);\n}'
        }
      </style>
    </>
  );
}
