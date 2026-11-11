/** @jsxImportSource react */
import { Space, Tag } from '@sdata/web-react';
import { IconStar } from '@sdata/web-react/icon';

export default function Example() {
  return (
    <>
      <Space>
        <Tag closable={true}>{'标签'}</Tag>
        <Tag
          closable={true}
          icon={
            <>
              <IconStar />
            </>
          }
        >
          {' 标签 '}
        </Tag>
      </Space>
    </>
  );
}
