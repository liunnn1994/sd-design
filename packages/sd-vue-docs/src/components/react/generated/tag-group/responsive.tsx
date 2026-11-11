/** @jsxImportSource react */
import { Panel, PanelGroup, PanelSeparator, TagGroup, TypographyText } from '@sdata/web-react';
import { useState } from 'react';

export default function Example() {
  const [width, setWidth] = useState(300);
  const options = ['超长标签文案需要折叠', '处理中', '已告警'];

  return (
    <>
      <div>
        <TypographyText type={'secondary'} className={'sd:mb-2 sd:block'}>
          {' 拖拽右侧手柄，观察标签组如何根据容器宽度自动折叠。 '}
        </TypographyText>
        <div className={'sd:h-28 sd:rounded sd:border sd:border-solid'}>
          <PanelGroup>
            <Panel
              size={width}
              onSizeChange={(next) => setWidth(next as typeof width)}
              minSize={140}
              maxSize={'60%'}
              className={'sd:overflow-hidden sd:p-2'}
            >
              <TagGroup options={options} />
            </Panel>
            <PanelSeparator />
            <Panel className={'sd:p-2'}>
              <span>{'自适应区域'}</span>
            </Panel>
          </PanelGroup>
        </div>
      </div>
    </>
  );
}
