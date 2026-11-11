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
  const [sidebar, setSidebar] = useState(200);
  const [terminal, setTerminal] = useState(100);

  return (
    <>
      <div className={'sd:h-90 sd:border sd:border-solid sd:rounded'}>
        <PanelGroup className={'sd:h-full'}>
          <Panel
            size={sidebar}
            onSizeChange={(next) => setSidebar(next as typeof sidebar)}
            minSize={'18%'}
            maxSize={'45%'}
            className={'sd:overflow-hidden sd:p-2'}
          >
            <div className={'sd:flex sd:items-center sd:justify-between sd:mb-1'}>
              <span className={'sd:text-sm sd:font-medium'}>{'文件'}</span>
              <TypographyText type={'secondary'}>
                {formatValue(sidebar)}
                {'px'}
              </TypographyText>
            </div>
            <Divider />
            <TypographyParagraph>{'文件树。'}</TypographyParagraph>
          </Panel>
          <PanelSeparator />
          <Panel className={'sd:overflow-hidden'}>
            <PanelGroup orientation={'vertical'} className={'sd:h-full'}>
              <Panel className={'sd:overflow-hidden sd:p-2'}>
                <TypographyParagraph>{'编辑器（嵌套的垂直面板组）。'}</TypographyParagraph>
              </Panel>
              <PanelSeparator />
              <Panel
                size={terminal}
                onSizeChange={(next) => setTerminal(next as typeof terminal)}
                minSize={60}
                maxSize={180}
                className={'sd:overflow-hidden sd:p-2'}
              >
                <div className={'sd:flex sd:items-center sd:justify-between sd:mb-1'}>
                  <span className={'sd:text-sm sd:font-medium'}>{'控制台'}</span>
                  <TypographyText type={'secondary'}>
                    {formatValue(terminal)}
                    {'px'}
                  </TypographyText>
                </div>
                <Divider />
                <TypographyParagraph>{'控制台面板。'}</TypographyParagraph>
              </Panel>
            </PanelGroup>
          </Panel>
        </PanelGroup>
      </div>
    </>
  );
}
