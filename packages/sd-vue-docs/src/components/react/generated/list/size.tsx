/** @jsxImportSource react */
import { List, ListItem, Radio, RadioGroup, Space } from '@sdata/web-react';
import { useState } from 'react';

export default function Example() {
  const [size, setSize] = useState<'small' | 'medium' | 'large'>('medium');

  return (
    <>
      <Space direction={'vertical'} size={'large'}>
        <RadioGroup
          value={size}
          onValueChange={(next) => setSize(next as typeof size)}
          type={'button'}
        >
          <Radio value={'small'}>{'小'}</Radio>
          <Radio value={'medium'}>{'中'}</Radio>
          <Radio value={'large'}>{'大'}</Radio>
        </RadioGroup>
        <List size={size} header={<>{' 列表标题 '}</>}>
          <ListItem>{'示例科技有限公司'}</ListItem>
          <ListItem>{'示例科技研发中心'}</ListItem>
          <ListItem>{'示例数据有限公司'}</ListItem>
          <ListItem>{'示例云服务有限公司'}</ListItem>
          <ListItem>{'示例科技北京分公司'}</ListItem>
        </List>
      </Space>
    </>
  );
}
