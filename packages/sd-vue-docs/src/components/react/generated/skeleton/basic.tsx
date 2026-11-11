/** @jsxImportSource react */
import { Skeleton, SkeletonLine, SkeletonShape, Space } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Skeleton>
        <Space direction={'vertical'} className={'sd:w-full'} size={'large'}>
          <SkeletonLine rows={3} />
          <SkeletonShape />
        </Space>
      </Skeleton>
    </>
  );
}
