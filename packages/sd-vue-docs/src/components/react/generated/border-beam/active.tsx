/** @jsxImportSource react */
import { BorderBeam, Button, Space } from '@sdata/web-react';
import { useState } from 'react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  const [isActive, setIsActive] = useState(true);
  function toggle() {
    setIsActive(!isActive);
  }
  function onActivate() {
    // fade-in animation completed
  }
  function onDeactivate() {
    // fade-out animation completed
  }

  return (
    <>
      <Space direction={'vertical'} size={20} fill={true}>
        <div style={{ padding: '24px', background: '#0d0d1a', borderRadius: '16px' }}>
          <BorderBeam active={isActive} onActivate={onActivate} onDeactivate={onDeactivate}>
            <div
              style={{
                padding: '22px 28px',
                background: '#1a1a2e',
                borderRadius: '16px',
                color: '#e0e0e0',
                minWidth: '300px',
              }}
            >
              <div style={{ fontSize: '15px', fontWeight: '600', marginBottom: '12px' }}>
                {' 深色背景 · 动画状态: '}
                {formatValue(isActive ? '激活' : '停用')}
              </div>
              <Button type={'primary'} size={'small'} onClick={toggle}>
                {formatValue(isActive ? '停用动画' : '激活动画')}
              </Button>
            </div>
          </BorderBeam>
        </div>
        <div style={{ padding: '24px', background: '#e8e8ee', borderRadius: '16px' }}>
          <BorderBeam
            active={isActive}
            theme={'light'}
            onActivate={onActivate}
            onDeactivate={onDeactivate}
          >
            <div
              style={{
                padding: '22px 28px',
                background: '#fff',
                borderRadius: '16px',
                color: '#333',
                minWidth: '300px',
              }}
            >
              <div style={{ fontSize: '15px', fontWeight: '600', marginBottom: '12px' }}>
                {' 浅色背景 · 动画状态: '}
                {formatValue(isActive ? '激活' : '停用')}
              </div>
              <Button type={'primary'} size={'small'} onClick={toggle}>
                {formatValue(isActive ? '停用动画' : '激活动画')}
              </Button>
            </div>
          </BorderBeam>
        </div>
      </Space>
    </>
  );
}
