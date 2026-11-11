/** @jsxImportSource react */
import { Space, Statistic } from '@sdata/web-react';
import { IconArrowRise } from '@sdata/web-react/icon';

export default function Example() {
  return (
    <>
      <Space size={'large'}>
        <Statistic
          title={'新增用户'}
          value={125670}
          showGroupSeparator={true}
          suffix={
            <>
              <IconArrowRise />
            </>
          }
        />
        <Statistic
          title={'用户增长率'}
          value={50.52}
          precision={2}
          valueStyle={{ color: '#0fbf60' }}
          prefix={
            <>
              <IconArrowRise />
            </>
          }
          suffix={<>{'%'}</>}
        />
      </Space>
    </>
  );
}
