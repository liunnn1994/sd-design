import { Select, Space } from '@sdata/web-react';
/** @jsxImportSource react */
import { IconPlus } from '@sdata/web-react/icon';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  const options = ['北京', '上海', '广州', { label: '禁用', disabled: true }];

  return (
    <>
      <Space direction={'vertical'} size={'large'}>
        <Select
          className={'sd:w-80'}
          placeholder={'请选择…'}
          options={options}
          renderLabel={(data) => (
            <>
              <span>
                <IconPlus />
                {formatValue(data?.label)}
              </span>
            </>
          )}
        />
      </Space>
    </>
  );
}
