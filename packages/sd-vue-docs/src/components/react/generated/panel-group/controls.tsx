/** @jsxImportSource react */
import {
  Button,
  Panel,
  PanelGroup,
  PanelSeparator,
  Space,
  TypographyParagraph,
  TypographyText,
} from '@sdata/web-react';
import { useState } from 'react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  const [orientation, setOrientation] = useState<'horizontal' | 'vertical'>('horizontal');
  const [disabled, setDisabled] = useState(false);
  const [phase, setPhase] = useState('等待拖拽');

  return (
    <>
      <Space direction={'vertical'} fill={true}>
        <Space>
          <Button
            onClick={() => {
              setOrientation(orientation === 'horizontal' ? 'vertical' : 'horizontal');
            }}
          >
            {' 切换方向 '}
          </Button>
          <Button
            onClick={() => {
              setDisabled(!disabled);
            }}
          >
            {formatValue(disabled ? '启用调整' : '禁用调整')}
          </Button>
          <TypographyText type={'secondary'}>{formatValue(phase)}</TypographyText>
        </Space>
        <PanelGroup
          component={'section'}
          orientation={orientation}
          disabled={disabled}
          className={'sd:h-75 sd:border sd:border-solid sd:rounded'}
          onMoveStart={() => {
            setPhase('开始拖拽');
          }}
          onMoving={() => {
            setPhase('拖拽中');
          }}
          onMoveEnd={() => {
            setPhase('拖拽结束');
          }}
        >
          <Panel defaultSize={'50%'} minSize={80} className={'sd:p-3'}>
            <TypographyParagraph>
              {
                ' 只设置 defaultSize，无需绑定尺寸即可拖拽。切换方向会保留面板内容；双击伸缩杆恢复一半大小。 '
              }
            </TypographyParagraph>
          </Panel>
          <PanelSeparator />
          <Panel className={'sd:p-3'}>{'填充面板占据剩余空间。'}</Panel>
        </PanelGroup>
      </Space>
    </>
  );
}
