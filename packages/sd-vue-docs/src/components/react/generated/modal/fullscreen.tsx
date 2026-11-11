/** @jsxImportSource react */
import { Button, Modal } from '@sdata/web-react';
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
      <Button onClick={handleClick}>{'打开对话框'}</Button>
      <Modal
        visible={visible}
        onVisibleChange={(next) => setVisible(next as typeof visible)}
        onOk={handleOk}
        onCancel={handleCancel}
        fullscreen={true}
        title={<>{' 标题 '}</>}
      >
        <div>{'您可以根据实际场景自定义对话框内容。点击确认按钮后，对话框将立即关闭。'}</div>
      </Modal>
    </>
  );
}
