/** @jsxImportSource react */
import { Checkbox, CheckboxGroup, Space } from '@sdata/web-react';
import { useState } from 'react';

export default function Example() {
  const [value1, setValue1] = useState(['普通选项 1']);
  const plainOptions = ['普通选项 1', '普通选项 2', '普通选项 3', '普通选项 4'];

  return (
    <>
      <Space direction={'vertical'} size={'large'}>
        <CheckboxGroup
          max={2}
          value={value1}
          onValueChange={(next) => setValue1(next as typeof value1)}
          options={plainOptions}
        />
        <CheckboxGroup max={2} defaultValue={['1']}>
          <Checkbox value={'1'} disabled={true}>
            {'选项 1'}
          </Checkbox>
          <Checkbox value={'2'}>{'选项 2'}</Checkbox>
          <Checkbox value={'3'}>{'选项 3'}</Checkbox>
          <Checkbox value={'4'}>{'选项 4'}</Checkbox>
        </CheckboxGroup>
      </Space>
    </>
  );
}
