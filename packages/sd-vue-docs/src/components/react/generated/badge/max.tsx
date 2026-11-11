import { Avatar, Badge, Space } from '@sdata/web-react';
/** @jsxImportSource react */
import { IconUser } from '@sdata/web-react/icon';

export default function Example() {
  return (
    <>
      <Space size={40}>
        <Badge maxCount={10} count={0}>
          <Avatar shape={'square'}>
            <span>
              <IconUser />
            </span>
          </Avatar>
        </Badge>
        <Badge maxCount={10} count={100}>
          <Avatar shape={'square'}>
            <span>
              <IconUser />
            </span>
          </Avatar>
        </Badge>
        <Badge count={100}>
          <Avatar shape={'square'}>
            <span>
              <IconUser />
            </span>
          </Avatar>
        </Badge>
        <Badge maxCount={999} count={1000}>
          <Avatar shape={'square'}>
            <span>
              <IconUser />
            </span>
          </Avatar>
        </Badge>
      </Space>
    </>
  );
}
