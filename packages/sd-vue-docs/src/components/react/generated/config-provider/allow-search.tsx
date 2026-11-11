/** @jsxImportSource react */
import { Cascader, ConfigProvider, Select, Space, Switch, Tag, TreeSelect } from '@sdata/web-react';
import { useState } from 'react';

export default function Example() {
  const [enabled, setEnabled] = useState(true);
  const cityOptions = [
    {
      label: '浙江',
      value: 'zhejiang',
      children: [
        { label: '杭州', value: 'hangzhou' },
        { label: '宁波', value: 'ningbo' },
      ],
    },
    {
      label: '四川',
      value: 'sichuan',
      children: [
        { label: '成都', value: 'chengdu' },
        { label: '绵阳', value: 'mianyang' },
      ],
    },
  ];
  const treeOptions = [
    {
      title: '华东',
      key: 'east',
      value: 'east',
      children: [
        { title: '上海', key: 'shanghai', value: 'shanghai' },
        { title: '杭州', key: 'hangzhou', value: 'hangzhou' },
      ],
    },
  ];
  const selectOptions = [
    { label: '上海', value: 'shanghai' },
    { label: '杭州', value: 'hangzhou' },
    { label: '成都', value: 'chengdu' },
  ];

  return (
    <>
      <div data-v-fc5f8382="" className={'config-provider-allow-search-demo'}>
        <Space data-v-fc5f8382="" align={'center'} wrap={true}>
          <Switch
            data-v-fc5f8382=""
            value={enabled}
            onChange={(next) => setEnabled(next as typeof enabled)}
            checkedText={<>{'全局 allowSearch 开启'}</>}
            uncheckedText={<>{'全局 allowSearch 关闭'}</>}
          />
          <Tag data-v-fc5f8382="" color={'blue'}>
            {'组件显式传入 allow-search 时优先级更高'}
          </Tag>
        </Space>
        <ConfigProvider data-v-fc5f8382="" allowSearch={enabled}>
          <Space data-v-fc5f8382="" direction={'vertical'} fill={true}>
            <Cascader
              data-v-fc5f8382=""
              options={cityOptions}
              placeholder={'Cascader 会继承全局 allowSearch'}
            />
            <TreeSelect
              data-v-fc5f8382=""
              data={treeOptions}
              placeholder={'TreeSelect 也会继承这个默认值'}
              treeCheckStrictly={true}
            />
            <Select
              data-v-fc5f8382=""
              options={selectOptions}
              placeholder={'Select 保持可搜索行为'}
            />
            <Cascader
              data-v-fc5f8382=""
              options={cityOptions}
              allowSearch={false}
              placeholder={'这个 Cascader 显式关闭了 allowSearch'}
            />
          </Space>
        </ConfigProvider>
      </div>
      <style>
        {
          '\n.config-provider-allow-search-demo[data-v-fc5f8382] {\n    display: grid;\n    gap: 12px;\n}\n'
        }
      </style>
    </>
  );
}
