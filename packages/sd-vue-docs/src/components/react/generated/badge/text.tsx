import { Avatar, Badge, Space } from '@sdata/web-react';
/** @jsxImportSource react */
import { IconUser } from '@sdata/web-react/icon';

export default function Example() {
  return (
    <>
      <Space size={40}>
        <Badge text={'NEW'}>
          <Avatar shape={'square'}>
            <span>
              <IconUser />
            </span>
          </Avatar>
        </Badge>
        <Badge text={'HOT'}>
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
