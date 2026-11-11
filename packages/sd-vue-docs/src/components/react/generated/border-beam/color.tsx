/** @jsxImportSource react */
import { BorderBeam, Space } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Space direction={'vertical'} size={20} fill={true}>
        <div style={{ padding: '20px', background: '#0d0d1a', borderRadius: '16px' }}>
          <div style={{ marginBottom: '12px', color: '#999', fontSize: '13px' }}>{'深色背景'}</div>
          <Space size={16}>
            <BorderBeam colorVariant={'colorful'}>
              <div
                style={{
                  padding: '14px 22px',
                  background: '#1a1a2e',
                  borderRadius: '16px',
                  color: '#e0e0e0',
                }}
              >
                {'多彩'}
              </div>
            </BorderBeam>
            <BorderBeam colorVariant={'mono'}>
              <div
                style={{
                  padding: '14px 22px',
                  background: '#1a1a2e',
                  borderRadius: '16px',
                  color: '#e0e0e0',
                }}
              >
                {'单色'}
              </div>
            </BorderBeam>
            <BorderBeam colorVariant={'ocean'}>
              <div
                style={{
                  padding: '14px 22px',
                  background: '#1a1a2e',
                  borderRadius: '16px',
                  color: '#e0e0e0',
                }}
              >
                {'海洋'}
              </div>
            </BorderBeam>
            <BorderBeam colorVariant={'sunset'}>
              <div
                style={{
                  padding: '14px 22px',
                  background: '#1a1a2e',
                  borderRadius: '16px',
                  color: '#e0e0e0',
                }}
              >
                {'日落'}
              </div>
            </BorderBeam>
          </Space>
        </div>
        <div style={{ padding: '20px', background: '#e8e8ee', borderRadius: '16px' }}>
          <div style={{ marginBottom: '12px', color: '#666', fontSize: '13px' }}>{'浅色背景'}</div>
          <Space size={16}>
            <BorderBeam colorVariant={'colorful'} theme={'light'}>
              <div
                style={{
                  padding: '14px 22px',
                  background: '#fff',
                  borderRadius: '16px',
                  color: '#333',
                }}
              >
                {'多彩'}
              </div>
            </BorderBeam>
            <BorderBeam colorVariant={'mono'} theme={'light'}>
              <div
                style={{
                  padding: '14px 22px',
                  background: '#fff',
                  borderRadius: '16px',
                  color: '#333',
                }}
              >
                {'单色'}
              </div>
            </BorderBeam>
            <BorderBeam colorVariant={'ocean'} theme={'light'}>
              <div
                style={{
                  padding: '14px 22px',
                  background: '#fff',
                  borderRadius: '16px',
                  color: '#333',
                }}
              >
                {'海洋'}
              </div>
            </BorderBeam>
            <BorderBeam colorVariant={'sunset'} theme={'light'}>
              <div
                style={{
                  padding: '14px 22px',
                  background: '#fff',
                  borderRadius: '16px',
                  color: '#333',
                }}
              >
                {'日落'}
              </div>
            </BorderBeam>
          </Space>
        </div>
      </Space>
    </>
  );
}
