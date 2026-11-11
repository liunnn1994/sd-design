/** @jsxImportSource react */
import { Button, Divider, Link, Space, Switch, Tag } from '@sdata/web-react';
import { useState } from 'react';

export default function Example() {
  const [show, setShow] = useState(false);

  return (
    <>
      <Space
        split={
          <>
            <Divider direction={'vertical'} margin={0} />
          </>
        }
      >
        <Button type={'primary'}>{'项目 1'}</Button>
        {show ? <Tag color={'sdblue'}>{'标签'}</Tag> : null}
        <Button type={'primary'}>{'项目 2'}</Button>
        <Button type={'primary'}>{'项目 3'}</Button>
        <Switch value={show} onChange={(next) => setShow(next as typeof show)} />
      </Space>
      <Divider />
      <Space
        split={
          <>
            <Divider direction={'vertical'} margin={0} />
          </>
        }
      >
        <Link type={'primary'}>{'链接 1'}</Link>
        <Link type={'primary'}>{'链接 2'}</Link>
        <Link type={'primary'}>{'链接 3'}</Link>
      </Space>
    </>
  );
}
