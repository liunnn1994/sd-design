/** @jsxImportSource react */
import type { CascaderOption } from '@sdata/web-react';

import { Cascader } from '@sdata/web-react';

export default function Example() {
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
      <Cascader
        options={options}
        defaultValue={['datunli']}
        className={'sd:w-80'}
        placeholder={'请选择…'}
        multiple={true}
      />
    </>
  );
}
