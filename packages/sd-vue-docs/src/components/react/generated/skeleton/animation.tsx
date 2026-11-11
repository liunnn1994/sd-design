/** @jsxImportSource react */
import { Skeleton, SkeletonLine, SkeletonShape, Space, Switch } from '@sdata/web-react';
import { useState } from 'react';

export default function Example() {
  const [animation, setAnimation] = useState(true);

  return (
    <>
      <Space direction={'vertical'} size={'large'} className={'sd:w-full'}>
        <Space>
          <span>{'动画'}</span>
          <Switch value={animation} onChange={(next) => setAnimation(next as typeof animation)} />
        </Space>
        <Skeleton animation={animation}>
          <Space direction={'vertical'} className={'sd:w-full'} size={'large'}>
            <SkeletonLine rows={3} />
            <SkeletonShape />
          </Space>
        </Skeleton>
      </Space>
    </>
  );
}
