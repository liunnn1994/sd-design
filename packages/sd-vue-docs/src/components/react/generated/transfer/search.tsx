/** @jsxImportSource react */
import { Transfer } from '@sdata/web-react';

export default function Example() {
  const data = Array(8)
    .fill(undefined)
    .map((_, index) => ({
      value: `option${index + 1}`,
      label: `选项 ${index + 1}`,
    }));
  const value = ['option1', 'option3', 'option5'];

  return (
    <>
      <Transfer
        showSearch={true}
        data={data}
        defaultValue={value}
        sourceInputSearchProps={{
          placeholder: '搜索源列表',
        }}
        targetInputSearchProps={{
          placeholder: '搜索目标列表',
        }}
      />
    </>
  );
}
