/** @jsxImportSource react */
import { ConfigProvider, Input, Select, Space, Switch, Tag, Textarea } from '@sdata/web-react';
import { useState } from 'react';

export default function Example() {
  const [enabled, setEnabled] = useState(true);
  const cityOptions = [
    { label: '上海', value: 'shanghai' },
    { label: '杭州', value: 'hangzhou' },
    { label: '成都', value: 'chengdu' },
  ];

  return (
    <>
      <div data-v-cac20e15="" className={'config-provider-allow-clear-demo'}>
        <Space data-v-cac20e15="" align={'center'} wrap={true}>
          <Switch
            data-v-cac20e15=""
            value={enabled}
            onChange={(next) => setEnabled(next as typeof enabled)}
            checkedText={<>{'全局 allowClear 开启'}</>}
            uncheckedText={<>{'全局 allowClear 关闭'}</>}
          />
          <Tag data-v-cac20e15="" color={'blue'}>
            {'组件显式传入 allow-clear 时优先级更高'}
          </Tag>
        </Space>
        <ConfigProvider data-v-cac20e15="" allowClear={enabled}>
          <Space data-v-cac20e15="" direction={'vertical'} fill={true}>
            <Input
              data-v-cac20e15=""
              defaultValue={'Input 会继承全局 allowClear'}
              placeholder={'请输入内容'}
            />
            <Textarea
              data-v-cac20e15=""
              defaultValue={'Textarea 也会继承这个默认值'}
              placeholder={'请输入多行内容'}
            />
            <Select
              data-v-cac20e15=""
              options={cityOptions}
              defaultValue={'shanghai'}
              placeholder={'请选择城市'}
            />
            <Input
              data-v-cac20e15=""
              defaultValue={'这个输入框显式关闭了 allowClear'}
              allowClear={false}
              placeholder={'显式 props 优先'}
            />
          </Space>
        </ConfigProvider>
      </div>
      <style>
        {
          '\n.config-provider-allow-clear-demo[data-v-cac20e15] {\n    display: grid;\n    gap: 12px;\n}\n'
        }
      </style>
    </>
  );
}
