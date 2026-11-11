/** @jsxImportSource react */
import { BorderBeam, Space } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Space direction={'vertical'} size={20} fill={true}>
        <div style={{ padding: '24px', background: '#0d0d1a', borderRadius: '16px' }}>
          <div style={{ marginBottom: '12px', color: '#999', fontSize: '13px' }}>{'深色背景'}</div>
          <Space size={20}>
            <BorderBeam theme={'dark'}>
              <div
                style={{
                  padding: '14px 22px',
                  background: '#1a1a2e',
                  borderRadius: '16px',
                  color: '#e0e0e0',
                }}
              >
                {'深色'}
              </div>
            </BorderBeam>
            <BorderBeam theme={'auto'}>
              <div
                style={{
                  padding: '14px 22px',
                  background: '#1a1a2e',
                  borderRadius: '16px',
                  color: '#e0e0e0',
                }}
              >
                {'自动'}
              </div>
            </BorderBeam>
          </Space>
        </div>
        <div style={{ padding: '24px', background: '#e8e8ee', borderRadius: '16px' }}>
          <div style={{ marginBottom: '12px', color: '#666', fontSize: '13px' }}>{'浅色背景'}</div>
          <Space size={20}>
            <BorderBeam theme={'light'}>
              <div
                style={{
                  padding: '14px 22px',
                  background: '#fff',
                  borderRadius: '16px',
                  color: '#333',
                }}
              >
                {'浅色'}
              </div>
            </BorderBeam>
            <BorderBeam theme={'auto'}>
              <div
                style={{
                  padding: '14px 22px',
                  background: '#fff',
                  borderRadius: '16px',
                  color: '#333',
                }}
              >
                {'自动'}
              </div>
            </BorderBeam>
          </Space>
        </div>
      </Space>
    </>
  );
}
