/** @jsxImportSource react */
import { Checkbox, Collapse, CollapseItem, Radio, RadioGroup, Space, Tag } from '@sdata/web-react';
import { IconPlus } from '@sdata/web-react/icon';
import { useState } from 'react';

export default function Example() {
  const [position, setPosition] = useState<'left' | 'right'>('left');
  const [hideIcon, setHideIcon] = useState(false);

  return (
    <>
      <Space direction={'vertical'} className={'sd:w-full'}>
        <Space>
          <RadioGroup
            type={'button'}
            value={position}
            onValueChange={(next) => setPosition(next as typeof position)}
          >
            <Radio value={'left'}>{'左侧'}</Radio>
            <Radio value={'right'}>{'右侧'}</Radio>
          </RadioGroup>
          <Checkbox
            modelValue={hideIcon}
            onValueChange={(next) => setHideIcon(next as typeof hideIcon)}
          >
            {'隐藏展开图标'}
          </Checkbox>
        </Space>
        <Collapse defaultActiveKey={['1']} expandIconPosition={position} showExpandIcon={!hideIcon}>
          <CollapseItem
            header={'示例数据有限公司'}
            key={'1'}
            expandIcon={
              <>
                <IconPlus />
              </>
            }
            extra={
              <>
                <Tag size={'small'}>{'城市'}</Tag>
              </>
            }
          >
            <div>{'示例数据有限公司'}</div>
            <div>{'示例数据有限公司'}</div>
            <div>{'示例数据有限公司'}</div>
          </CollapseItem>
          <CollapseItem header={'示例数据有限公司'} key={'2'} disabled={true}>
            <div>{'示例数据有限公司'}</div>
            <div>{'示例数据有限公司'}</div>
            <div>{'示例数据有限公司'}</div>
          </CollapseItem>
          <CollapseItem header={'示例数据有限公司'} key={'3'}>
            <div>{'示例数据有限公司'}</div>
            <div>{'示例数据有限公司'}</div>
            <div>{'示例数据有限公司'}</div>
          </CollapseItem>
        </Collapse>
      </Space>
    </>
  );
}
