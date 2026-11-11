/** @jsxImportSource react */
import { Button, Drawer } from '@sdata/web-react';
import { useState } from 'react';

export default function Example() {
  const [visible, setVisible] = useState(false);
  const handleClick = () => {
    setVisible(true);
  };
  const handleOk = () => {
    setVisible(false);
  };
  const handleCancel = () => {
    setVisible(false);
  };

  return (
    <>
      <Button type={'primary'} onClick={handleClick}>
        {'打开抽屉'}
      </Button>
      <Drawer
        width={340}
        visible={visible}
        onOk={handleOk}
        onCancel={handleCancel}
        unmountOnClose={true}
        title={<>{' 标题 '}</>}
      >
        <div>{'您可以根据实际场景自定义对话框内容。点击确认按钮后，对话框将立即关闭。 '}</div>
      </Drawer>
    </>
  );
}
