/** @jsxImportSource react */
import { Ellipsis } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Ellipsis expandTrigger={'click'} tooltip={false} style={{ width: 'min(100%, 14rem)' }}>
        {
          ' 点击截断的内容即可展开，再次点击即可收起。适用于布局空间有限，但仍需查看完整内容的场景。 '
        }
      </Ellipsis>
    </>
  );
}
