/** @jsxImportSource react */
import { Drawer } from '@sdata/web-react';
import { Button } from '@sdata/web-react';

export default function Example() {
  const handleClick = () => {
    Drawer.open({
      title: '提示标题',
      content: '这是一条提示消息',
      width: 340,
    });
  };

  return (
    <>
      <Button type={'primary'} onClick={handleClick}>
        {'打开抽屉'}
      </Button>
    </>
  );
}
