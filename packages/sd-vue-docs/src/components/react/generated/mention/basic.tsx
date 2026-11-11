/** @jsxImportSource react */
import { Mention, Space } from '@sdata/web-react';
import { useState } from 'react';

export default function Example() {
  const [value, setValue] = useState('');
  const [text, setText] = useState('');

  return (
    <>
      <Space direction={'vertical'} size={'large'} className={'sd:w-full'}>
        <Mention
          value={value}
          onValueChange={(next) => setValue(next as typeof value)}
          data={['研发团队', '设计团队', '产品团队']}
          placeholder={'请输入内容'}
        />
        <Mention
          value={text}
          onValueChange={(next) => setText(next as typeof text)}
          data={['研发团队', '设计团队', '产品团队']}
          type={'textarea'}
          placeholder={'请输入内容'}
        />
      </Space>
    </>
  );
}
