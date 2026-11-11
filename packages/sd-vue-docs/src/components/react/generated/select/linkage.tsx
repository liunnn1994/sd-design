/** @jsxImportSource react */
import { Select, Space } from '@sdata/web-react';
import { useState } from 'react';

export default function Example() {
  const [province, setProvince] = useState('四川');
  const [city, setCity] = useState('成都');
  const data: Record<string, string[]> = {
    北京: ['海淀区', '朝阳区', '昌平区'],
    四川: ['成都', '绵阳', '阿坝'],
    广东: ['广州', '深圳', '汕头'],
  };

  return (
    <>
      <Space>
        <Select
          className={'sd:w-50'}
          value={province}
          onValueChange={(next) => {
            if (typeof next !== 'string' || next === province) return;
            setProvince(next);
            setCity('');
          }}
          options={Object.keys(data)}
        />
        <Select
          className={'sd:w-50'}
          options={data[province] || []}
          value={city}
          onValueChange={(next) => setCity(next as typeof city)}
        />
      </Space>
    </>
  );
}
