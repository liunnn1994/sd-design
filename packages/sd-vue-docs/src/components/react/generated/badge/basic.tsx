import { Avatar, Badge, Space } from '@sdata/web-react';
/** @jsxImportSource react */
import { IconClockCircle } from '@sdata/web-react/icon';

export default function Example() {
  return (
    <>
      <Space size={40}>
        <Badge count={9}>
          <Avatar shape={'square'} />
        </Badge>
        <Badge count={9} dot={true} dotStyle={{ width: '10px', height: '10px' }}>
          <Avatar shape={'square'} />
        </Badge>
        <Badge
          dotStyle={{ height: '16px', width: '16px', fontSize: '14px' }}
          content={
            <>
              <IconClockCircle className={'sd:align-middle sd:text-[var(--color-text-2)]'} />
            </>
          }
        >
          <Avatar shape={'square'} />
        </Badge>
      </Space>
    </>
  );
}
