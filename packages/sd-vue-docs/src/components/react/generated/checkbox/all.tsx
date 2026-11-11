/** @jsxImportSource react */
import { Checkbox, CheckboxGroup, Space } from '@sdata/web-react';
import { useState } from 'react';

export default function Example() {
  const [indeterminate, setIndeterminate] = useState(false);
  const [checkedAll, setCheckedAll] = useState(false);
  const [data, setData] = useState<string[]>([]);
  const handleChangeAll = (value: boolean | (string | number | boolean)[], _event: Event) => {
    const checked = Array.isArray(value) ? value.length > 0 : value;

    setIndeterminate(false);
    if (checked) {
      setCheckedAll(true);
      setData(['1', '2', '3']);
    } else {
      setCheckedAll(false);
      setData([]);
    }
  };
  const handleChange = (values: (string | number | boolean)[], _event: Event) => {
    if (values.length === 3) {
      setCheckedAll(true);
      setIndeterminate(false);
    } else if (values.length === 0) {
      setCheckedAll(false);
      setIndeterminate(false);
    } else {
      setCheckedAll(false);
      setIndeterminate(true);
    }
  };

  return (
    <>
      <Space direction={'vertical'}>
        <Checkbox modelValue={checkedAll} indeterminate={indeterminate} onChange={handleChangeAll}>
          {'全选 '}
        </Checkbox>
        <CheckboxGroup
          value={data}
          onValueChange={(next) => setData(next as typeof data)}
          onChange={handleChange}
        >
          <Checkbox value={'1'}>{'选项 1'}</Checkbox>
          <Checkbox value={'2'}>{'选项 2'}</Checkbox>
          <Checkbox value={'3'}>{'选项 3'}</Checkbox>
        </CheckboxGroup>
      </Space>
    </>
  );
}
