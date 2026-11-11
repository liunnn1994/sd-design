/** @jsxImportSource react */
import {
  Button,
  Divider,
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
  const [collapsed, setCollapsed] = useState(false);
  const [pinned, setPinned] = useState(true);
  const [width, setWidth] = useState(240);

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
          <Button
            size={'small'}
            onClick={() => {
              setPinned(!pinned);
            }}
          >
            {' 固定内容 '}
            {formatValue(pinned ? '开' : '关')}
          </Button>
        </Space>
        <div className={'sd:h-75 sd:border sd:border-solid sd:rounded'}>
          <PanelGroup className={'sd:h-full'}>
            <Panel
              size={width}
              onSizeChange={(next) => setWidth(next as typeof width)}
              collapsed={collapsed}
              onCollapsedChange={(next) => setCollapsed(next as typeof collapsed)}
              minSize={180}
              maxSize={'55%'}
              className={'sd:overflow-hidden sd:p-2'}
            >
              <div className={'sd:flex sd:items-center sd:justify-between sd:mb-1'}>
                <span className={'sd:text-sm sd:font-medium'}>{'侧栏'}</span>
                <TypographyText type={'secondary'}>
                  {formatValue(collapsed ? '已折叠' : `${width}px`)}
                </TypographyText>
              </div>
              <Divider />
              <TypographyParagraph>
                {'侧边栏面板，收起动画期间内容保持原始宽度。'}
              </TypographyParagraph>
            </Panel>
            <PanelSeparator />
            <Panel pin={pinned} className={'sd:overflow-hidden'}>
              <TypographyParagraph>
                {
                  ' 固定的文本按面板折叠结束时的宽度排版，折叠动画期间文字不再逐帧重新换行， 避免代码编辑器、虚拟滚动表格等真实内容在每一帧付出回流代价。 '
                }
              </TypographyParagraph>
            </Panel>
          </PanelGroup>
        </div>
      </div>
    </>
  );
}
