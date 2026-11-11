import { Empty } from '@sdata/web-react';
/** @jsxImportSource react */
import { IconExclamationCircleFill } from '@sdata/web-react/icon';

export default function Example() {
  return (
    <>
      <Empty
        image={
          <>
            <IconExclamationCircleFill />
          </>
        }
      >
        {' 暂无数据，请重新加载！ '}
      </Empty>
    </>
  );
}
