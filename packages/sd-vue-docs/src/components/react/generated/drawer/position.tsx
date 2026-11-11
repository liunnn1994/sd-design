/** @jsxImportSource react */
import { Button, Drawer, Radio, RadioGroup } from '@sdata/web-react';
import { useState } from 'react';

export default function Example() {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState<'top' | 'right' | 'bottom' | 'left'>('right');
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
      <RadioGroup value={position} onValueChange={(next) => setPosition(next as typeof position)}>
        <Radio value={'top'}>{'顶部'}</Radio>
        <Radio value={'right'}>{'右侧'}</Radio>
        <Radio value={'bottom'}>{'底部'}</Radio>
        <Radio value={'left'}>{'左侧'}</Radio>
      </RadioGroup>
      <div className={'sd:mt-5'}>
        <Button type={'primary'} onClick={handleClick}>
          {'打开抽屉'}
        </Button>
      </div>
      <Drawer
        width={340}
        height={340}
        visible={visible}
        placement={position}
        onOk={handleOk}
        onCancel={handleCancel}
        unmountOnClose={true}
        title={<>{' 标题 '}</>}
      >
        <div>{'您可以根据实际场景自定义对话框内容。点击确认按钮后，对话框将立即关闭。'}</div>
      </Drawer>
    </>
  );
}
