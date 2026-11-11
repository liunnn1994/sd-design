/** @jsxImportSource react */
import type { CascaderOption } from '@sdata/web-react';

import { Cascader, Space } from '@sdata/web-react';

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
          defaultValue={'datunli'}
          className={'sd:w-80'}
          placeholder={'显示完整路径'}
          separator={' > '}
        />
        <Cascader
          options={options}
          defaultValue={'datunli'}
          className={'sd:w-80'}
          placeholder={'仅显示叶子节点标签'}
          showPath={false}
        />
        <Cascader
          options={options}
          defaultValue={['chaoyang', 'haidian', 'dongcheng']}
          className={'sd:w-80'}
          placeholder={'响应式标签'}
          multiple={true}
          allowClear={true}
          maxTagCount={'responsive'}
        />
      </Space>
    </>
  );
}
