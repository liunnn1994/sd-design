/** @jsxImportSource react */
import { Button, Drawer } from '@sdata/web-react';
import { useState } from 'react';

export default function Example() {
  const [visible, setVisible] = useState(false);
  const [nestedVisible, setNestedVisible] = useState(false);
  const handleClick = () => {
    setVisible(true);
  };
  const handleOk = () => {
    setVisible(false);
  };
  const handleCancel = () => {
    setVisible(false);
  };
  const handleNestedClick = () => {
    setNestedVisible(true);
  };
  const handleNestedOk = () => {
    setNestedVisible(false);
  };
  const handleNestedCancel = () => {
    setNestedVisible(false);
  };

  return (
    <>
      <Button type={'primary'} onClick={handleClick}>
        {'打开抽屉'}
      </Button>
      <Drawer
        visible={visible}
        width={500}
        onOk={handleOk}
        onCancel={handleCancel}
        unmountOnClose={true}
        title={<>{' 标题 '}</>}
      >
        <div className={'sd:mb-5'}>
          {'您可以根据实际场景自定义对话框内容。点击确认按钮后，对话框将立即关闭。'}
        </div>
        <Button type={'primary'} onClick={handleNestedClick}>
          {'打开嵌套抽屉'}
        </Button>
      </Drawer>
      <Drawer
        visible={nestedVisible}
        onOk={handleNestedOk}
        onCancel={handleNestedCancel}
        unmountOnClose={true}
        title={<>{' 标题 '}</>}
      >
        <div>{'您可以根据实际场景自定义对话框内容。点击确认按钮后，对话框将立即关闭。'}</div>
      </Drawer>
    </>
  );
}
