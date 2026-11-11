/** @jsxImportSource react */
import { Checkbox, CheckboxGroup, Space } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Space direction={'vertical'} size={'large'}>
        <CheckboxGroup defaultValue={['1']}>
          <Checkbox value={'1'}>{'选项 1'}</Checkbox>
          <Checkbox value={'2'}>{'选项 2'}</Checkbox>
          <Checkbox value={'3'}>{'选项 3'}</Checkbox>
        </CheckboxGroup>
        <CheckboxGroup direction={'vertical'}>
          <Checkbox value={'1'}>{'选项 1'}</Checkbox>
          <Checkbox value={'2'}>{'选项 2'}</Checkbox>
          <Checkbox value={'3'}>{'选项 3'}</Checkbox>
        </CheckboxGroup>
      </Space>
    </>
  );
}
