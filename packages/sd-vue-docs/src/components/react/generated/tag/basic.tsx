/** @jsxImportSource react */
import { Space, Tag } from '@sdata/web-react';
import { IconCheckCircleFill } from '@sdata/web-react/icon';

export default function Example() {
  return (
    <>
      <Space>
        <Tag>{'默认'}</Tag>
        <Tag>{'标签 1'}</Tag>
        <Tag>{'标签 2'}</Tag>
        <Tag
          icon={
            <>
              <IconCheckCircleFill />
            </>
          }
        >
          {' 完成 '}
        </Tag>
      </Space>
    </>
  );
}
