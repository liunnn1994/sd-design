/** @jsxImportSource react */
import { BorderBeam, Space } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Space direction={'vertical'} size={20} fill={true}>
        <div style={{ padding: '24px', background: '#0d0d1a', borderRadius: '16px' }}>
          <BorderBeam
            borderRadius={24}
            strength={1}
            density={1.5}
            duration={3}
            colorVariant={'ocean'}
          >
            <div
              style={{
                padding: '22px 28px',
                background: '#1a1a2e',
                borderRadius: '24px',
                color: '#e0e0e0',
                minWidth: '300px',
              }}
            >
              <div style={{ fontSize: '15px', fontWeight: '600', marginBottom: '6px' }}>
                {'深色背景 · 自定义参数'}
              </div>
              <div style={{ fontSize: '12px', opacity: '0.6' }}>
                {'圆角 24 · 密度 1.5 · 持续 3s · ocean'}
              </div>
            </div>
          </BorderBeam>
        </div>
        <div style={{ padding: '24px', background: '#e8e8ee', borderRadius: '16px' }}>
          <BorderBeam
            borderRadius={24}
            strength={1}
            density={1.5}
            duration={3}
            theme={'light'}
            colorVariant={'sunset'}
          >
            <div
              style={{
                padding: '22px 28px',
                background: '#fff',
                borderRadius: '24px',
                color: '#333',
                minWidth: '300px',
              }}
            >
              <div style={{ fontSize: '15px', fontWeight: '600', marginBottom: '6px' }}>
                {'浅色背景 · 自定义参数'}
              </div>
              <div style={{ fontSize: '12px', opacity: '0.5' }}>
                {'圆角 24 · 密度 1.5 · 持续 3s · sunset'}
              </div>
            </div>
          </BorderBeam>
        </div>
      </Space>
    </>
  );
}
