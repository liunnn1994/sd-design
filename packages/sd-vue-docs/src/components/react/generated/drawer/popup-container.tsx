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
      <div>
        <div
          id={'parentNode'}
          className={
            'sd:relative sd:h-[300px] sd:w-full sd:overflow-hidden sd:bg-[var(--color-fill-2)] sd:text-center sd:leading-[300px]'
          }
        >
          <Button type={'primary'} onClick={handleClick}>
            {'打开抽屉'}
          </Button>
        </div>
      </div>
      <Drawer
        popupContainer={'#parentNode'}
        visible={visible}
        onOk={handleOk}
        onCancel={handleCancel}
        title={<>{' 标题 '}</>}
      >
        <div>{'您可以根据实际场景自定义对话框内容。点击确认按钮后，对话框将立即关闭。'}</div>
      </Drawer>
    </>
  );
}
