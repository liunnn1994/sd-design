import { useState } from 'react';

import { Button, Skeleton, SkeletonLine, SkeletonShape } from '../../src/index';

export function SkeletonFixture() {
  const [loading, setLoading] = useState(true);
  const [changed, setChanged] = useState(false);
  return (
    <section>
      <Button onClick={() => setLoading(!loading)}>切换骨架加载</Button>
      <Button onClick={() => setChanged(!changed)}>更新骨架样式</Button>
      <Skeleton
        data-testid="skeleton"
        loading={loading}
        animation={!changed}
        content={<button>真实内容</button>}
        style={{ width: 200 }}
      >
        <SkeletonShape shape={changed ? 'square' : 'circle'} size={changed ? 'small' : 'large'} />
        <SkeletonLine
          rows={changed ? 2 : 3}
          widths={changed ? [0, '50%'] : [120, '80%']}
          lineHeight={changed ? 10 : 20}
          lineSpacing={changed ? 0 : 15}
        />
      </Skeleton>
    </section>
  );
}
