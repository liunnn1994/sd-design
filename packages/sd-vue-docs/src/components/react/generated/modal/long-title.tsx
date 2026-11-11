/** @jsxImportSource react */
import { Button, Modal, Radio, RadioGroup } from '@sdata/web-react';
import { useState } from 'react';

export default function Example() {
  const [visible, setVisible] = useState(false);
  const [titleTooltipMode, setTitleTooltipMode] = useState<'component' | 'native'>('component');
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
      <RadioGroup
        value={titleTooltipMode}
        onValueChange={(next) => setTitleTooltipMode(next as typeof titleTooltipMode)}
      >
        <Radio value={'component'}>{'组件 Tooltip'}</Radio>
        <Radio value={'native'}>{'浏览器原生 title'}</Radio>
      </RadioGroup>
      <div className={'sd:mt-5'}>
        <Button onClick={handleClick}>{'打开对话框'}</Button>
      </div>
      <Modal
        width={'360'}
        visible={visible}
        onVisibleChange={(next) => setVisible(next as typeof visible)}
        titleEllipsisTooltip={titleTooltipMode === 'native' ? false : true}
        onOk={handleOk}
        onCancel={handleCancel}
        title={
          <>{' 这是一个非常非常非常长的对话框标题，用来演示标题过长时的省略效果与提示模式切换 '}</>
        }
      >
        <div>{' 您可以根据实际场景自定义对话框内容。点击确认按钮后，对话框将立即关闭。 '}</div>
      </Modal>
    </>
  );
}
