/** @jsxImportSource react */
import { Button, Panel, PanelGroup, PanelSeparator, Space } from '@sdata/web-react';
import { useState } from 'react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  const [width, setWidth] = useState(240);
  const [collapsed, setCollapsed] = useState(false);
  const [atEnd, setAtEnd] = useState(false);
  const order = (() => (atEnd ? ['fill', 'separator', 'sized'] : ['sized', 'separator', 'fill']))();

  return (
    <>
      <div data-v-8efdeae9="">
        <Space data-v-8efdeae9="" className={'sd:mb-2'}>
          <Button
            data-v-8efdeae9=""
            size={'small'}
            onClick={() => {
              setAtEnd(!atEnd);
            }}
          >
            {'切换面板位置'}
          </Button>
          <Button
            data-v-8efdeae9=""
            size={'small'}
            onClick={() => {
              setCollapsed(!collapsed);
            }}
          >
            {formatValue(collapsed ? '展开' : '收起')}
          </Button>
        </Space>
        <div data-v-8efdeae9="" className={'sd:h-75 sd:border sd:border-solid sd:rounded'}>
          <PanelGroup data-v-8efdeae9="">
            {order.map((item) => (
              <>
                {item === 'sized' ? (
                  <Panel
                    data-v-8efdeae9=""
                    size={width}
                    onSizeChange={(next) => setWidth(next as typeof width)}
                    collapsed={collapsed}
                    onCollapsedChange={(next) => setCollapsed(next as typeof collapsed)}
                    minSize={100}
                    maxSize={'60%'}
                    className={'sd:p-2'}
                  >
                    {' 可重排面板：'}
                    {formatValue(width)}
                    {'px '}
                  </Panel>
                ) : item === 'separator' ? (
                  <PanelSeparator data-v-8efdeae9="" aria-label={'调整侧栏大小'}>
                    <span data-v-8efdeae9="" className={'custom-grip'} aria-hidden={'true'}>
                      {'⋮'}
                    </span>
                  </PanelSeparator>
                ) : (
                  <Panel data-v-8efdeae9="" className={'sd:p-2'}>
                    {'填充区域'}
                  </Panel>
                )}
              </>
            ))}
          </PanelGroup>
        </div>
      </div>
      <style>
        {
          '.custom-grip[data-v-8efdeae9] {\n  display: flex;\n  height: 100%;\n  align-items: center;\n  justify-content: center;\n}'
        }
      </style>
    </>
  );
}
