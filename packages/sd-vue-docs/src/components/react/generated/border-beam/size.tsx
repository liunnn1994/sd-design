/** @jsxImportSource react */
import { BorderBeam, Button, Space } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Space direction={'vertical'} size={20} fill={true}>
        <div style={{ padding: '20px', background: '#0d0d1a', borderRadius: '16px' }}>
          <div style={{ marginBottom: '12px', color: '#999', fontSize: '13px' }}>
            {'深色背景 (theme="dark")'}
          </div>
          <Space direction={'vertical'} size={16} fill={true}>
            <BorderBeam size={'sm'}>
              <Button type={'primary'} size={'small'}>
                {'小尺寸 sm'}
              </Button>
            </BorderBeam>
            <BorderBeam size={'md'}>
              <div
                style={{
                  padding: '18px 24px',
                  background: '#1a1a2e',
                  borderRadius: '16px',
                  color: '#e0e0e0',
                }}
              >
                {'中尺寸 md（默认）'}
              </div>
            </BorderBeam>
            <BorderBeam size={'line'}>
              <div
                style={{
                  padding: '18px 24px',
                  background: '#1a1a2e',
                  borderRadius: '16px',
                  color: '#e0e0e0',
                  minWidth: '300px',
                }}
              >
                {'线条 line'}
              </div>
            </BorderBeam>
            <BorderBeam size={'pulse-inner'}>
              <div
                style={{
                  padding: '18px 24px',
                  background: '#1a1a2e',
                  borderRadius: '16px',
                  color: '#e0e0e0',
                  minWidth: '300px',
                }}
              >
                {'脉冲内 pulse-inner'}
              </div>
            </BorderBeam>
            <BorderBeam size={'pulse-outside'}>
              <div
                style={{
                  padding: '18px 24px',
                  background: '#1a1a2e',
                  borderRadius: '16px',
                  color: '#e0e0e0',
                  minWidth: '300px',
                }}
              >
                {'脉冲外 pulse-outside'}
              </div>
            </BorderBeam>
          </Space>
        </div>
        <div style={{ padding: '20px', background: '#e8e8ee', borderRadius: '16px' }}>
          <div style={{ marginBottom: '12px', color: '#666', fontSize: '13px' }}>
            {'浅色背景 (theme="light")'}
          </div>
          <Space direction={'vertical'} size={16} fill={true}>
            <BorderBeam size={'sm'} theme={'light'}>
              <Button type={'primary'} size={'small'}>
                {'小尺寸 sm'}
              </Button>
            </BorderBeam>
            <BorderBeam size={'md'} theme={'light'}>
              <div
                style={{
                  padding: '18px 24px',
                  background: '#fff',
                  borderRadius: '16px',
                  color: '#333',
                }}
              >
                {'中尺寸 md（默认）'}
              </div>
            </BorderBeam>
            <BorderBeam size={'line'} theme={'light'}>
              <div
                style={{
                  padding: '18px 24px',
                  background: '#fff',
                  borderRadius: '16px',
                  color: '#333',
                  minWidth: '300px',
                }}
              >
                {'线条 line'}
              </div>
            </BorderBeam>
            <BorderBeam size={'pulse-inner'} theme={'light'}>
              <div
                style={{
                  padding: '18px 24px',
                  background: '#fff',
                  borderRadius: '16px',
                  color: '#333',
                  minWidth: '300px',
                }}
              >
                {'脉冲内 pulse-inner'}
              </div>
            </BorderBeam>
            <BorderBeam size={'pulse-outside'} theme={'light'}>
              <div
                style={{
                  padding: '18px 24px',
                  background: '#fff',
                  borderRadius: '16px',
                  color: '#333',
                  minWidth: '300px',
                }}
              >
                {'脉冲外 pulse-outside'}
              </div>
            </BorderBeam>
          </Space>
        </div>
      </Space>
    </>
  );
}
