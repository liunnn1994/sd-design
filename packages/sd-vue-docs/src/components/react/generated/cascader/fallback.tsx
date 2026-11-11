/** @jsxImportSource react */
import type { CascaderFallback, CascaderOption } from '@sdata/web-react';

import { Cascader, Space } from '@sdata/web-react';
import { useState } from 'react';

export default function Example() {
  const [value, setValue] = useState(['datunli', 'wuhou']);
  const [value2, setValue2] = useState([
    ['beijing', 'chaoyang', 'datunli'],
    ['sichuan', 'chengdu', 'wuhou'],
  ]);
  const fallback: CascaderFallback = (value) => {
    return (Array.isArray(value) ? value : [value])
      .map((item) => String(item).toUpperCase())
      .join('-');
  };
  const options: CascaderOption[] = [
    {
      value: 'beijing',
      label: '北京',
      children: [
        {
          value: 'chaoyang',
          label: '朝阳区',
          children: [
            {
              value: 'datunli',
              label: '大屯里',
            },
          ],
        },
        {
          value: 'haidian',
          label: '海淀区',
        },
        {
          value: 'dongcheng',
          label: '东城区',
        },
        {
          value: 'xicheng',
          label: '西城区',
          children: [
            {
              value: 'jinrongjie',
              label: '金融街',
            },
            {
              value: 'tianqiao',
              label: '天桥',
            },
          ],
        },
      ],
    },
    {
      value: 'shanghai',
      label: '上海',
      children: [
        {
          value: 'huangpu',
          label: '黄浦区',
        },
      ],
    },
  ];

  return (
    <>
      <Space direction={'vertical'} size={'large'}>
        <Cascader
          options={options}
          value={value}
          onValueChange={(next) => setValue(next as typeof value)}
          className={'sd:w-80'}
          placeholder={'请选择…'}
          multiple={true}
        />
        <Cascader
          options={options}
          value={value2}
          onValueChange={(next) => setValue2(next as typeof value2)}
          className={'sd:w-80'}
          placeholder={'请选择…'}
          pathMode={true}
          multiple={true}
          fallback={fallback}
        />
      </Space>
    </>
  );
}
