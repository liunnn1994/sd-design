/** @jsxImportSource react */
import { Select, Space } from '@sdata/web-react';

export default function Example() {
  const options = [
    {
      value: 'standard',
      label: '标准 Ellipsis 会在文本溢出时测量内容并展示完整文本提示',
    },
    {
      value: 'performant',
      label: 'Performant Ellipsis 适合大数据量和虚拟滚动的高频渲染场景',
    },
    {
      value: 'disabled',
      label: '关闭 Ellipsis 后由业务自行控制选项内容的截断和提示',
    },
  ];

  return (
    <>
      <Space direction={'vertical'} size={'large'}>
        <div>
          <div className={'sd:mb-2 sd:text-sm'}>{'默认 Ellipsis'}</div>
          <Select className={'sd:w-64'} options={options} placeholder={'请选择'} />
        </div>
        <div>
          <div className={'sd:mb-2 sd:text-sm'}>{'高性能 Ellipsis'}</div>
          <Select
            className={'sd:w-64'}
            options={options}
            ellipsis={'performant-ellipsis'}
            placeholder={'请选择'}
          />
        </div>
        <div>
          <div className={'sd:mb-2 sd:text-sm'}>{'关闭 Ellipsis'}</div>
          <Select className={'sd:w-64'} ellipsis={false} options={options} placeholder={'请选择'} />
        </div>
      </Space>
    </>
  );
}
