/** @jsxImportSource react */
import {
  Divider,
  Panel,
  PanelGroup,
  PanelSeparator,
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
  const [height, setHeight] = useState(120);

  return (
    <>
      <div className={'sd:h-75 sd:border sd:border-solid sd:rounded'}>
        <PanelGroup orientation={'vertical'} className={'sd:h-full'}>
          <Panel className={'sd:overflow-hidden sd:p-2'}>
            <TypographyParagraph>{'编辑器区域（填充面板）。'}</TypographyParagraph>
          </Panel>
          <PanelSeparator />
          <Panel
            size={height}
            onSizeChange={(next) => setHeight(next as typeof height)}
            minSize={80}
            maxSize={220}
            className={'sd:overflow-hidden sd:p-2'}
          >
            <div className={'sd:flex sd:items-center sd:justify-between sd:mb-1'}>
              <span className={'sd:text-sm sd:font-medium'}>{'输出'}</span>
              <TypographyText type={'secondary'}>
                {formatValue(height)}
                {'px'}
              </TypographyText>
            </div>
            <Divider />
            <TypographyParagraph>{'底部输出面板（垂直方向）。'}</TypographyParagraph>
          </Panel>
        </PanelGroup>
      </div>
    </>
  );
}
