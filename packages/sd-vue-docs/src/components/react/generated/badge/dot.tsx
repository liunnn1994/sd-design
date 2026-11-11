import { Badge, Space } from '@sdata/web-react';
/** @jsxImportSource react */
import { IconNotification } from '@sdata/web-react/icon';

export default function Example() {
  return (
    <>
      <Space size={40}>
        <Badge count={9} dot={true} offset={[6, -2]}>
          <a href={'#'}>{'链接'}</a>
        </Badge>
        <Badge count={9} dot={true} offset={[2, -2]}>
          <IconNotification className={'sd:text-[#888] sd:text-lg sd:align-[-3px]'} />
        </Badge>
      </Space>
    </>
  );
}
