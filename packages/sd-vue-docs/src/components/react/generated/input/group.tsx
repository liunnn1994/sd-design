/** @jsxImportSource react */
import { Input, InputGroup, Select, Space } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Space direction={'vertical'} size={'large'}>
        <InputGroup>
          <Input className={'sd:w-40'} placeholder={'第一项'} />
          <Input className={'sd:w-40'} placeholder={'第二项'} />
        </InputGroup>
        <InputGroup>
          <Select
            options={['选项 1', '选项 2', '选项 3']}
            className={'sd:w-40'}
            placeholder={'第一项'}
          />
          <Input className={'sd:w-40'} placeholder={'第二项'} />
        </InputGroup>
      </Space>
    </>
  );
}
