/** @jsxImportSource react */
import type { CascaderLoadMore, CascaderOption } from '@sdata/web-react';

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
        },
        {
          value: 'haidian',
          label: '海淀区',
          isLeaf: true,
        },
        {
          value: 'dongcheng',
          label: '东城区',
          isLeaf: true,
        },
        {
          value: 'xicheng',
          label: '西城区',
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
          isLeaf: true,
        },
      ],
    },
  ];
  const loadMore: CascaderLoadMore = (option, done) => {
    window.setTimeout(() => {
      const nodes = [
        {
          value: `${option.value}-option1`,
          label: `${option.label}-选项 1`,
          isLeaf: true,
        },
        {
          value: `${option.value}-option2`,
          label: `${option.label}-选项 2`,
          isLeaf: true,
        },
      ];
      done(nodes);
    }, 2000);
  };

  return (
    <>
      <Space>
        <Cascader
          options={options}
          className={'sd:w-80'}
          placeholder={'请选择…'}
          loadMore={loadMore}
        />
      </Space>
    </>
  );
}
