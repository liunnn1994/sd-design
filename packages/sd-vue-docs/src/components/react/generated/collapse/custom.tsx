/** @jsxImportSource react */
import { Collapse, CollapseItem } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Collapse defaultActiveKey={['1', 2]} bordered={false}>
        <CollapseItem
          header={'示例数据有限公司'}
          className={'sd:mb-[18px] sd:overflow-hidden sd:rounded-[6px] sd:border-none'}
          key={'1'}
        >
          <div>{'示例数据有限公司'}</div>
          <div>{'示例数据有限公司'}</div>
        </CollapseItem>
        <CollapseItem
          header={'示例数据有限公司'}
          className={'sd:mb-[18px] sd:overflow-hidden sd:rounded-[6px] sd:border-none'}
          key={2}
        >
          <div>{'示例数据有限公司'}</div>
          <div>{'示例数据有限公司'}</div>
        </CollapseItem>
        <CollapseItem
          header={'示例数据有限公司'}
          className={'sd:mb-[18px] sd:overflow-hidden sd:rounded-[6px] sd:border-none'}
          key={'3'}
        >
          <div>{'示例数据有限公司'}</div>
          <div>{'示例数据有限公司'}</div>
        </CollapseItem>
      </Collapse>
    </>
  );
}
