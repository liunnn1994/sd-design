/** @jsxImportSource react */
import { Button, Select, Space } from '@sdata/web-react';

export default function Example() {
  const options = [
    '北京',
    '上海',
    '广州',
    { label: '禁用', value: '禁用', disabled: true },
    '深圳',
    '武汉',
  ];

  return (
    <>
      <Space>
        <Select
          defaultValue={'北京'}
          className={'sd:w-90'}
          placeholder={'请选择…'}
          allowSearch={true}
          options={options}
          footer={
            <>
              <div className={'sd:py-1.5 sd:text-center'}>
                <Button>{'点击我'}</Button>
              </div>
            </>
          }
        />
        <Select
          defaultValue={'北京'}
          className={'sd:w-90'}
          placeholder={'请选择…'}
          allowSearch={true}
          showFooterOnEmpty={true}
          options={options}
          footer={
            <>
              <div className={'sd:py-1.5 sd:text-center'}>
                <Button>{'点击我'}</Button>
              </div>
            </>
          }
        />
      </Space>
    </>
  );
}
