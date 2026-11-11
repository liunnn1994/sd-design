/** @jsxImportSource react */
import { Checkbox, Select, Space } from '@sdata/web-react';

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
          multiple={true}
          options={options}
          header={
            <>
              <div className={'sd:py-1.5 sd:px-3'}>
                <Checkbox value={'1'}>{'全选'}</Checkbox>
              </div>
            </>
          }
        />
        <Select
          defaultValue={'北京'}
          className={'sd:w-90'}
          placeholder={'请选择…'}
          multiple={true}
          showHeaderOnEmpty={true}
          options={options}
          header={
            <>
              <div className={'sd:py-1.5 sd:px-3'}>
                <Checkbox value={'1'}>{'全选'}</Checkbox>
              </div>
            </>
          }
        />
      </Space>
    </>
  );
}
