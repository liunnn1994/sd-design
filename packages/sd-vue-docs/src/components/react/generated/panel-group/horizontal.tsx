/** @jsxImportSource react */
import { Divider, Panel, PanelGroup, TypographyParagraph, TypographyText } from '@sdata/web-react';
import { useState } from 'react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  const [width, setWidth] = useState(280);

  return (
    <>
      <div className={'sd:h-75 sd:border sd:border-solid sd:rounded'}>
        <PanelGroup className={'sd:h-full'}>
          <Panel
            size={width}
            onSizeChange={(next) => setWidth(next as typeof width)}
            minSize={180}
            maxSize={'55%'}
            className={'sd:overflow-hidden sd:p-2'}
          >
            <div className={'sd:flex sd:items-center sd:justify-between sd:mb-2'}>
              <span className={'sd:text-sm sd:font-medium'}>{'文件'}</span>
              <TypographyText type={'secondary'}>
                {formatValue(width)}
                {'px'}
              </TypographyText>
            </div>
            <Divider />
            <TypographyParagraph>
              {' 我们正在构建内容发现与创作的新体验。面板可以拖拽伸缩，拖拽中尺寸实时同步。 '}
            </TypographyParagraph>
          </Panel>
          <Panel className={'sd:overflow-hidden sd:p-2'}>
            <TypographyParagraph>
              {' 右侧为填充面板（未设置 size/defaultSize），自动占据剩余空间。 '}
            </TypographyParagraph>
          </Panel>
        </PanelGroup>
      </div>
    </>
  );
}
