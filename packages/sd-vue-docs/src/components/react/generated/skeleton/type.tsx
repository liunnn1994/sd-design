/** @jsxImportSource react */
import { Skeleton, SkeletonShape, Space } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Skeleton>
        <Space size={'large'}>
          <SkeletonShape size={'small'} />
          <SkeletonShape />
          <SkeletonShape size={'large'} />
          <SkeletonShape shape={'circle'} size={'small'} />
          <SkeletonShape shape={'circle'} />
          <SkeletonShape shape={'circle'} size={'large'} />
        </Space>
      </Skeleton>
    </>
  );
}
