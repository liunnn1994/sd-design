/** @jsxImportSource react */
import { BorderBeam, Space } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Space direction={'vertical'} size={16} fill={true}>
        <div style={{ padding: '24px', background: '#0d0d1a', borderRadius: '16px' }}>
          <BorderBeam>
            <div
              style={{
                minWidth: '280px',
                padding: '20px 28px',
                color: '#e0e0e0',
                background: '#1a1a2e',
                borderRadius: '16px',
              }}
            >
              <div style={{ marginBottom: '6px', fontWeight: '600', fontSize: '16px' }}>
                {'深色背景 — 旋转光晕'}
              </div>
              <div style={{ fontSize: '13px', opacity: '0.6' }}>{'theme="dark"（默认）'}</div>
            </div>
          </BorderBeam>
        </div>
        <div style={{ padding: '24px', background: '#e8e8ee', borderRadius: '16px' }}>
          <BorderBeam theme={'light'}>
            <div
              style={{
                minWidth: '280px',
                padding: '20px 28px',
                color: '#333',
                background: '#fff',
                borderRadius: '16px',
              }}
            >
              <div style={{ marginBottom: '6px', fontWeight: '600', fontSize: '16px' }}>
                {'浅色背景 — 旋转光晕'}
              </div>
              <div style={{ fontSize: '13px', opacity: '0.5' }}>{'theme="light"'}</div>
            </div>
          </BorderBeam>
        </div>
      </Space>
    </>
  );
}
