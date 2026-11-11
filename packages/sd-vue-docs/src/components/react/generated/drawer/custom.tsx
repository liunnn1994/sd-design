/** @jsxImportSource react */
import { Button, CheckboxGroup, Drawer } from '@sdata/web-react';
import { useState } from 'react';

export default function Example() {
  const [visible, setVisible] = useState(false);
  const [custom, setCustom] = useState<Array<'隐藏页头' | '隐藏页脚' | '隐藏取消按钮'>>([]);
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
      <CheckboxGroup
        value={custom}
        onValueChange={(next) => setCustom(next as typeof custom)}
        options={['隐藏页头', '隐藏页脚', '隐藏取消按钮']}
      />
      <div className={'sd:mt-5'}>
        <Button type={'primary'} onClick={handleClick}>
          {'打开抽屉'}
        </Button>
      </div>
      <Drawer
        width={340}
        header={
          <>
            <span>{'页头和标题'}</span>
          </>
        }
        footer={!custom.includes('隐藏页脚')}
        hideCancel={custom.includes('隐藏取消按钮')}
        visible={visible}
        onOk={handleOk}
        onCancel={handleCancel}
        unmountOnClose={true}
      >
        <div>{' 您可以根据实际场景自定义对话框内容。点击确认按钮后，对话框将立即关闭。 '}</div>
      </Drawer>
    </>
  );
}
