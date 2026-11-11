import { Divider, Panel, PanelGroup, TypographyParagraph, TypographyText } from '@sdata/web-react';
/** @jsxImportSource react */
import { type CSSProperties, useLayoutEffect, useState } from 'react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  const [width, setWidth] = useState(500);
  const [height, setHeight] = useState(200);
  const [contentRef, setContentRef] = useState<HTMLDivElement | null>(null);
  const [contentHeight, setContentHeight] = useState(height);
  useLayoutEffect(() => {
    if (!contentRef) return;
    const measure = () => setContentHeight(contentRef.getBoundingClientRect().height);
    const observer = new ResizeObserver(measure);
    measure();
    observer.observe(contentRef, { box: 'border-box' });
    return () => observer.disconnect();
  }, [contentRef]);

  return (
    <>
      <div
        data-v-e1b318cf=""
        className={'single-panel-demo'}
        style={{ '--panel-height': `${contentHeight}px` } as CSSProperties}
      >
        <PanelGroup data-v-e1b318cf="">
          <Panel
            data-v-e1b318cf=""
            size={width}
            onSizeChange={(next) => setWidth(next as typeof width)}
            minSize={100}
            maxSize={'100%'}
          >
            <PanelGroup data-v-e1b318cf="" orientation={'vertical'}>
              <Panel
                data-v-e1b318cf=""
                size={height}
                onSizeChange={(next) => setHeight(next as typeof height)}
                minSize={100}
                maxSize={340}
              >
                <div data-v-e1b318cf="" ref={setContentRef} className={'single-panel-demo-content'}>
                  <TypographyParagraph data-v-e1b318cf="">
                    {' 我们正在构建内容发现与创作的新体验。 '}
                  </TypographyParagraph>
                  <Divider data-v-e1b318cf="" />
                  <TypographyParagraph data-v-e1b318cf="">
                    {' 拖拽右侧调整宽度，拖拽底部调整高度。两根伸缩杆交汇处可以同时调整宽高。 '}
                  </TypographyParagraph>
                  <Divider data-v-e1b318cf="">{'内容面板'}</Divider>
                  <TypographyText data-v-e1b318cf="" type={'secondary'}>
                    {formatValue(width)}
                    {' × '}
                    {formatValue(height)}
                    {' px'}
                  </TypographyText>
                </div>
              </Panel>
              <Panel data-v-e1b318cf="" />
            </PanelGroup>
          </Panel>
          <Panel data-v-e1b318cf="" />
        </PanelGroup>
      </div>
      <style>
        {
          '.single-panel-demo[data-v-e1b318cf] {\n  height: 360px;\n}\n.single-panel-demo[data-v-e1b318cf] > .sd-panel-group > .sd-panel > .sd-panel-separator-edge {\n  height: var(--panel-height);\n}\n.single-panel-demo-content[data-v-e1b318cf] {\n  height: 100%;\n  padding: 12px;\n  overflow: hidden;\n  border: 1px solid var(--sd-color-border-2);\n  text-align: center;\n}'
        }
      </style>
    </>
  );
}
