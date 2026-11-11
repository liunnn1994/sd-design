/** @jsxImportSource react */
import { Alert, Button, Input, RadioGroup, Space, Tag, ThemeProvider } from '@sdata/web-react';
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
      tokens: {
        primary6: themeMode === 'dark' ? '151,188,255' : '20,118,255',
        colorBg2: themeMode === 'dark' ? '#1a202c' : '#ffffff',
        colorBg5: themeMode === 'dark' ? '#2d3748' : '#ffffff',
        colorNeutral10: themeMode === 'dark' ? '#f8fafc' : '#0f172a',
        colorNeutral8: themeMode === 'dark' ? '#e2e8f0' : '#334155',
        colorNeutral6: themeMode === 'dark' ? '#cbd5e1' : '#7a8699',
        colorNeutral3: themeMode === 'dark' ? '#475569' : '#d9e2f0',
      },
    };
  })();

  return (
    <>
      <div data-v-5be411c8="" className={'theme-provider-demo'}>
        <Space data-v-5be411c8="" align={'center'} wrap={true}>
          <RadioGroup
            data-v-5be411c8=""
            type={'button'}
            value={themeMode}
            onValueChange={(next) => setThemeMode(next as typeof themeMode)}
            options={themeModeOptions}
          />
          <Tag data-v-5be411c8="" color={'blue'}>
            {'独立 ThemeProvider：'}
            {formatValue(themeMode)}
          </Tag>
        </Space>
        <ThemeProvider data-v-5be411c8="" themeMode={themeMode} theme={theme}>
          <div data-v-5be411c8="" className={'theme-provider-demo__panel'}>
            <Space data-v-5be411c8="" direction={'vertical'} fill={true}>
              <Alert data-v-5be411c8="" type={'success'} title={<>{'独立主题提供器'}</>}>
                {' 该区域仅受 ThemeProvider 子树影响，不依赖 ConfigProvider。 '}
              </Alert>
              <Space data-v-5be411c8="" wrap={true}>
                <Button data-v-5be411c8="" type={'primary'}>
                  {'主要'}
                </Button>
                <Button data-v-5be411c8="" status={'success'}>
                  {'成功'}
                </Button>
                <Button data-v-5be411c8="" type={'secondary'}>
                  {'次要'}
                </Button>
              </Space>
              <Input
                data-v-5be411c8=""
                placeholder={'检查局部主题下组件可读性'}
                allowClear={true}
              />
            </Space>
          </div>
        </ThemeProvider>
      </div>
      <style>
        {
          '\n.theme-provider-demo[data-v-5be411c8] {\n    display: grid;\n    gap: 12px;\n}\n.theme-provider-demo__panel[data-v-5be411c8] {\n    padding: 16px;\n    background: var(--color-bg-2);\n    border: 1px solid var(--color-border-2);\n    border-radius: 12px;\n}\n'
        }
      </style>
    </>
  );
}
