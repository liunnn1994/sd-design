/** @jsxImportSource react */
import { Collapse, CollapseItem } from '@sdata/web-react';
import {
  IconDoubleDown,
  IconDoubleRight,
  IconFaceFrownFill,
  IconFaceSmileFill,
} from '@sdata/web-react/icon';

export default function Example() {
  return (
    <>
      <Collapse
        defaultActiveKey={['1', 2]}
        expandIcon={({ active }) => <>{active ? <IconFaceSmileFill /> : <IconFaceFrownFill />}</>}
      >
        <CollapseItem
          header={'示例数据有限公司'}
          key={'1'}
          expandIcon={({ active }) => <>{active ? <IconDoubleDown /> : <IconDoubleRight />}</>}
        >
          <div>{'示例数据有限公司'}</div>
        </CollapseItem>
        <CollapseItem header={'示例数据有限公司'} key={2}>
          <div>{'示例数据有限公司'}</div>
        </CollapseItem>
        <CollapseItem header={'示例数据有限公司'} key={'3'}>
          <div>{'示例数据有限公司'}</div>
        </CollapseItem>
      </Collapse>
    </>
  );
}
