/** @jsxImportSource react */
import type { BorderBeamInstance } from '@sdata/web-react';

import { BorderBeam, Button, Space } from '@sdata/web-react';
import { type ComponentRef, useRef } from 'react';

export default function Example() {
  const beamRef = useRef<ComponentRef<typeof BorderBeam> | null>(null);
  function triggerDefault() {
    beamRef.current?.flowFrom();
  }
  function triggerCenter() {
    beamRef.current?.flowFrom('center');
  }
  function triggerBottomLeft() {
    beamRef.current?.flowFrom('bottom-left');
  }
  function triggerCustom() {
    beamRef.current?.flowFrom({ x: 48, y: 36 });
  }

  return (
    <>
      <div style={{ padding: '24px', background: '#0d0d1a', borderRadius: '16px' }}>
        <Space direction={'vertical'} size={16} fill={true}>
          <BorderBeam ref={beamRef}>
            <div
              style={{
                minWidth: '320px',
                padding: '24px 28px',
                color: '#e0e0e0',
                background: '#1a1a2e',
                borderRadius: '16px',
              }}
            >
              <div style={{ marginBottom: '8px', fontSize: '16px', fontWeight: '600' }}>
                {' 水流入场效果 '}
              </div>
              <div style={{ fontSize: '13px', lineHeight: '1.7', opacity: '0.68' }}>
                {' 通过组件实例方法从指定坐标触发一次扩散入场，动画结束后保持当前边框光束。 '}
              </div>
            </div>
          </BorderBeam>
          <Space size={8} wrap={true}>
            <Button type={'primary'} size={'small'} onClick={triggerDefault}>
              {'默认右上'}
            </Button>
            <Button size={'small'} onClick={triggerCenter}>
              {'中心扩散'}
            </Button>
            <Button size={'small'} onClick={triggerBottomLeft}>
              {'左下扩散'}
            </Button>
            <Button size={'small'} onClick={triggerCustom}>
              {'自定义坐标'}
            </Button>
          </Space>
        </Space>
      </div>
    </>
  );
}
