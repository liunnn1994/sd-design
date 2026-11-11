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
  const [left, setLeft] = useState(200);
  const [right, setRight] = useState(200);

  return (
    <>
      <div className={'sd:h-75 sd:border sd:border-solid sd:rounded'}>
        <PanelGroup className={'sd:h-full'}>
          <Panel
            size={left}
            onSizeChange={(next) => setLeft(next as typeof left)}
            minSize={'14%'}
            maxSize={'35%'}
            className={'sd:overflow-hidden sd:p-2'}
          >
            <div className={'sd:flex sd:items-center sd:justify-between sd:mb-1'}>
              <span className={'sd:text-sm sd:font-medium'}>{'文件'}</span>
              <TypographyText type={'secondary'}>
                {formatValue(left)}
                {'px'}
              </TypographyText>
            </div>
            <Divider />
            <TypographyParagraph>{'左侧文件列表面板。'}</TypographyParagraph>
          </Panel>
          <Panel className={'sd:overflow-hidden sd:p-2'}>
            <TypographyParagraph>{' 中间为填充面板，两侧面板均可拖拽伸缩。 '}</TypographyParagraph>
          </Panel>
          <Panel
            size={right}
            onSizeChange={(next) => setRight(next as typeof right)}
            minSize={'14%'}
            maxSize={'35%'}
            className={'sd:overflow-hidden sd:p-2'}
          >
            <div className={'sd:flex sd:items-center sd:justify-between sd:mb-1'}>
              <span className={'sd:text-sm sd:font-medium'}>{'大纲'}</span>
              <TypographyText type={'secondary'}>
                {formatValue(right)}
                {'px'}
              </TypographyText>
            </div>
            <Divider />
            <TypographyParagraph>{'右侧大纲面板。'}</TypographyParagraph>
          </Panel>
        </PanelGroup>
      </div>
    </>
  );
}
