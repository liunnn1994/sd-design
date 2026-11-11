/** @jsxImportSource react */
import { Collapse, CollapseItem } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Collapse defaultActiveKey={['1', 2]}>
        <CollapseItem header={'示例数据有限公司'} key={'1'}>
          <div>{'示例数据有限公司'}</div>
          <div>{'示例数据有限公司'}</div>
          <div>{'示例数据有限公司'}</div>
        </CollapseItem>
        <CollapseItem header={'示例数据有限公司'} key={2} disabled={true}>
          <div>{'示例数据有限公司'}</div>
          <div>{'示例数据有限公司'}</div>
          <div>{'示例数据有限公司'}</div>
        </CollapseItem>
        <CollapseItem header={'示例数据有限公司'} key={'3'}>
          <div>{'示例数据有限公司'}</div>
          <div>{'示例数据有限公司'}</div>
          <div>{'示例数据有限公司'}</div>
        </CollapseItem>
      </Collapse>
    </>
  );
}
