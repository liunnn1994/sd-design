/** @jsxImportSource react */
import { InputPassword, Space, Switch } from '@sdata/web-react';
import { useState } from 'react';

export default function Example() {
  const [visibility, setVisibility] = useState(true);

  return (
    <>
      <Space direction={'vertical'} size={'large'}>
        <Switch value={visibility} onChange={(next) => setVisibility(next as typeof visibility)} />
        <InputPassword
          visibility={visibility}
          onVisibilityChange={(next) => setVisibility(next as typeof visibility)}
          placeholder={'请输入内容'}
          className={'sd:w-80'}
          defaultVisibility={false}
          allowClear={true}
        />
      </Space>
    </>
  );
}
