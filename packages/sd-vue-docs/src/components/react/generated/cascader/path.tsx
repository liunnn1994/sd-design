/** @jsxImportSource react */
import type { CascaderChangeHandler, CascaderOption } from '@sdata/web-react';

import { Cascader, Space } from '@sdata/web-react';

export default function Example() {
  const handleChange: CascaderChangeHandler = (path) => {
    console.log(path);
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
          className={'sd:w-80'}
          placeholder={'请选择…'}
          pathMode={true}
          onChange={handleChange}
        />
        <Cascader
          options={options}
          defaultValue={[['beijing', 'chaoyang', 'datunli']]}
          className={'sd:w-80'}
          placeholder={'请选择…'}
          pathMode={true}
          onChange={handleChange}
        />
      </Space>
    </>
  );
}
