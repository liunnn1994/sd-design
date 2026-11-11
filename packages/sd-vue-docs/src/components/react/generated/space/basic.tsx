/** @jsxImportSource react */
import { Button, Space, Switch, Tag, TypographyText } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Space>
        <TypographyText>{'间距：'}</TypographyText>
        {false ? <Tag color={'sdblue'}>{'标签'}</Tag> : null}
        <Button type={'primary'}>{'项目 1'}</Button>
        <Button type={'primary'}>{'项目 2'}</Button>
        <Switch defaultChecked={true} />
      </Space>
    </>
  );
}
