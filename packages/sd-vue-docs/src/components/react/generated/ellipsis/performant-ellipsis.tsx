/** @jsxImportSource react */
import { PerformantEllipsis } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <PerformantEllipsis style={{ width: 'min(100%, 12rem)' }}>
        {' 在大型列表中，高性能文本省略会在用户与截断内容交互时，才启用提示和尺寸监听逻辑。 '}
      </PerformantEllipsis>
    </>
  );
}
