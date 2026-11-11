/** @jsxImportSource react */
import { TabPane, Tabs } from '@sdata/web-react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  return (
    <>
      <div className={'sd:flex sd:gap-[16px]'}>
        <div className={'sd:h-[300px] sd:flex-1'}>
          <Tabs fullHeight={true}>
            <TabPane key={'1'} title={'标签页 1'}>
              {Array.from({ length: 30 }, (_, index) => index + 1).map((n) => (
                <p key={n} className={'sd:leading-[24px]'}>
                  {'Tab 1 第 '}
                  {formatValue(n)}
                  {' 行内容'}
                </p>
              ))}
            </TabPane>
            <TabPane key={'2'} title={'标签页 2'}>
              {Array.from({ length: 30 }, (_, index) => index + 1).map((n) => (
                <p key={n} className={'sd:leading-[24px]'}>
                  {'Tab 2 第 '}
                  {formatValue(n)}
                  {' 行内容'}
                </p>
              ))}
            </TabPane>
          </Tabs>
        </div>
        <div className={'sd:h-[300px] sd:flex-1'}>
          <Tabs fullHeight={true} scrollbar={false}>
            <TabPane key={'1'} title={'标签页 1'}>
              {Array.from({ length: 30 }, (_, index) => index + 1).map((n) => (
                <p key={n} className={'sd:leading-[24px]'}>
                  {'Tab 1 第 '}
                  {formatValue(n)}
                  {' 行内容'}
                </p>
              ))}
            </TabPane>
            <TabPane key={'2'} title={'标签页 2'}>
              {Array.from({ length: 30 }, (_, index) => index + 1).map((n) => (
                <p key={n} className={'sd:leading-[24px]'}>
                  {'Tab 2 第 '}
                  {formatValue(n)}
                  {' 行内容'}
                </p>
              ))}
            </TabPane>
          </Tabs>
        </div>
      </div>
    </>
  );
}
