/** @jsxImportSource react */
import { Space, Tag } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Space>
        <Tag checkable={true}>{'太棒了'}</Tag>
        <Tag checkable={true} color={'red'} defaultChecked={true}>
          {'示例资讯'}
        </Tag>
        <Tag checkable={true} color={'sdblue'} defaultChecked={true}>
          {'协作平台'}
        </Tag>
      </Space>
    </>
  );
}
