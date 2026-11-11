/** @jsxImportSource react */
import { Button, SelectableCard, Tag } from '@sdata/web-react';
import { useState } from 'react';

export default function Example() {
  const [selected, setSelected] = useState(true);

  return (
    <>
      <SelectableCard
        label={'专业版方案'}
        isSelected={selected}
        color={'blue'}
        variant={'soft'}
        layout={'horizontal'}
        size={'large'}
        width={'420px'}
        onChange={($event) => {
          setSelected($event);
        }}
        figure={<>{'🚀'}</>}
        title={<>{'专业版'}</>}
        value={<>{'¥299 / 月'}</>}
        description={<>{'包含高级权限与审计能力'}</>}
        actions={
          <>
            <Tag color={'blue'}>{'推荐'}</Tag>
            <Button size={'mini'}>{'查看详情'}</Button>
          </>
        }
      />
    </>
  );
}
