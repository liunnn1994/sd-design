/** @jsxImportSource react */
import { Avatar, Card, Link, TypographyText } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Card hoverable={true} className={'sd:w-90 sd:mb-5'}>
        <div className={'sd:flex sd:items-center sd:justify-between'}>
          <span className={'sd:flex sd:items-center sd:text-[#1d2129]'}>
            <Avatar className={'sd:mr-2 sd:bg-[#165dff]'} size={28}>
              {' A '}
            </Avatar>
            <TypographyText>{'用户名'}</TypographyText>
          </span>
          <Link>{'更多'}</Link>
        </div>
      </Card>
    </>
  );
}
