/** @jsxImportSource react */
import { Select, Space, Switch } from '@sdata/web-react';
import { useState } from 'react';

export default function Example() {
  const [scrollbar, setScrollbar] = useState(true);
  const options = [
    '北京',
    { label: '上海', value: '上海', tagProps: { color: 'red' } },
    '广州',
    { label: '禁用', value: '禁用', disabled: true },
    '深圳',
    '武汉',
  ];

  return (
    <>
      <div className={'sd:mb-2.5'}>
        <Switch value={scrollbar} onChange={(next) => setScrollbar(next as typeof scrollbar)} />
        {' 虚拟滚动条 '}
      </div>
      <Space direction={'vertical'} size={'large'}>
        <Select
          defaultValue={['北京', '上海']}
          className={'sd:w-90'}
          placeholder={'请选择…'}
          multiple={true}
          scrollbar={scrollbar}
          options={options}
        />
        <Select
          defaultValue={['北京', '上海', '广州']}
          className={'sd:w-90'}
          placeholder={'请选择…'}
          multiple={true}
          maxTagCount={2}
          allowClear={true}
          scrollbar={scrollbar}
          options={options}
        />
        <Select
          defaultValue={['北京', '上海']}
          className={'sd:w-90'}
          placeholder={'请选择…'}
          multiple={true}
          limit={2}
          scrollbar={scrollbar}
          options={options}
        />
      </Space>
    </>
  );
}
