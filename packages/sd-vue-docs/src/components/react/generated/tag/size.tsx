/** @jsxImportSource react */
import { Space, Tag } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Space>
        <Tag size={'large'}>{'大'}</Tag>
        <Tag>{'中'}</Tag>
        <Tag size={'small'}>{'小'}</Tag>
      </Space>
    </>
  );
}
