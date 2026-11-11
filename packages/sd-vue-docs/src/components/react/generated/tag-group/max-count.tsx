/** @jsxImportSource react */
import { TagGroup } from '@sdata/web-react';

export default function Example() {
  const options = ['运行中', '高优先级', '数据库', '已同步'];

  return (
    <>
      <TagGroup options={options} maxCount={2} />
    </>
  );
}
