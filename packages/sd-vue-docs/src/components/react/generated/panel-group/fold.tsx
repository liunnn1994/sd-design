/** @jsxImportSource react */
import type { PanelFold, PanelTransition } from '@sdata/web-react';

import {
  Button,
  Divider,
  Panel,
  PanelGroup,
  PanelSeparator,
  Radio,
  RadioGroup,
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
  const [collapsed, setCollapsed] = useState(false);
  const [fold, setFold] = useState<'flip' | 'fade' | 'scale' | 'snap' | 'spring'>('flip');
  const [width, setWidth] = useState(260);
  const folds = {
    flip: {
      hidden: {
        opacity: 0,
        transform: 'perspective(500px) rotateY(-75deg)',
        transformOrigin: 'right center',
      },
      shown: {
        opacity: 1,
        transform: 'perspective(500px) rotateY(0deg)',
        transformOrigin: 'right center',
      },
    },
    fade: {
      hidden: { opacity: 0 },
      shown: { opacity: 1 },
    },
    scale: {
      hidden: { opacity: 0, transform: 'scale(0.85)' },
      shown: { opacity: 1, transform: 'scale(1)' },
    },
    snap: {},
    spring: {
      hidden: { opacity: 0, transform: 'scale(0.9)' },
      shown: { opacity: 1, transform: 'scale(1)' },
    },
  } satisfies Record<string, PanelFold>;
  const transitions: Record<string, PanelTransition> = {
    flip: { duration: 280, easing: [0.25, 0.46, 0.45, 0.94] },
    fade: { duration: 350 },
    scale: { duration: 250 },
    snap: { duration: 0 },
    spring: { type: 'spring', bounce: 0.4, duration: 700 },
  };

  return (
    <>
      <div>
        <Space className={'sd:mb-2'}>
          <Button
            size={'small'}
            onClick={() => {
              setCollapsed(!collapsed);
            }}
          >
            {formatValue(collapsed ? '展开' : '收起')}
          </Button>
          <RadioGroup
            value={fold}
            onValueChange={(next) => setFold(next as typeof fold)}
            type={'button'}
            size={'small'}
          >
            <Radio value={'flip'}>{'翻转'}</Radio>
            <Radio value={'fade'}>{'淡入淡出'}</Radio>
            <Radio value={'scale'}>{'缩放'}</Radio>
            <Radio value={'snap'}>{'无动画'}</Radio>
            <Radio value={'spring'}>{'弹簧'}</Radio>
          </RadioGroup>
        </Space>
        <div className={'sd:h-75 sd:border sd:border-solid sd:rounded'}>
          <PanelGroup className={'sd:h-full'}>
            <Panel
              size={width}
              onSizeChange={(next) => setWidth(next as typeof width)}
              collapsed={collapsed}
              onCollapsedChange={(next) => setCollapsed(next as typeof collapsed)}
              minSize={180}
              maxSize={'52%'}
              fold={folds[fold]}
              transition={transitions[fold]}
              className={'sd:overflow-hidden sd:p-2'}
            >
              <div className={'sd:flex sd:items-center sd:justify-between sd:mb-1'}>
                <span className={'sd:text-sm sd:font-medium'}>{'导航'}</span>
                <TypographyText type={'secondary'}>
                  {formatValue(collapsed ? '已折叠' : `${width}px`)}
                </TypographyText>
              </div>
              <Divider />
              <TypographyParagraph>{'折叠时内容应用 fold 姿态动画。'}</TypographyParagraph>
            </Panel>
            <PanelSeparator />
            <Panel className={'sd:overflow-hidden sd:p-2'}>
              <TypographyParagraph>{'编辑器区域（填充面板）。'}</TypographyParagraph>
            </Panel>
          </PanelGroup>
        </div>
      </div>
    </>
  );
}
