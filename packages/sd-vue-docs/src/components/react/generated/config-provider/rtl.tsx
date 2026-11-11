/** @jsxImportSource react */
import { Avatar, Badge, ConfigProvider, Space, Switch, TabPane, Tabs, Tag } from '@sdata/web-react';
import { IconClockCircle } from '@sdata/web-react/icon';
import { useState } from 'react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  const [rtlType, setRtlType] = useState(true);

  return (
    <>
      <div>
        <Switch
          value={rtlType}
          onChange={(next) => setRtlType(next as typeof rtlType)}
          className={'sd:mb-5'}
          checkedText={<>{' RTL '}</>}
          uncheckedText={<>{' LTR '}</>}
        />
        <ConfigProvider rtl={rtlType}>
          <Tabs defaultActiveKey={2} className={'sd:mb-5'}>
            {Array.from({ length: 36 }, (_, index) => index + 1).map((i) => (
              <TabPane key={i} title={`标签页 ${i}`}>
                {' 标签页面板内容 '}
                {formatValue(i)}
              </TabPane>
            ))}
          </Tabs>
          <Space direction={'vertical'} className={'sd:w-full'}>
            <Space size={40}>
              <Badge count={9}>
                <Avatar shape={'square'} />
              </Badge>
              <Badge count={9} dot={true} dotStyle={{ width: '10px', height: '10px' }}>
                <Avatar shape={'square'} />
              </Badge>
              <Badge
                dotStyle={{ height: '16px', width: '16px', fontSize: '14px' }}
                content={
                  <>
                    <IconClockCircle className={'sd:align-middle sd:text-[var(--color-text-2)]'} />
                  </>
                }
              >
                <Avatar shape={'square'} />
              </Badge>
              <Tag color={'red'} closable={true}>
                {'红色'}
              </Tag>
              <Tag color={'blue'} closable={true}>
                {'蓝色'}
              </Tag>
              <Tag color={'green'} closable={true}>
                {'绿色'}
              </Tag>
            </Space>
          </Space>
        </ConfigProvider>
      </div>
    </>
  );
}
