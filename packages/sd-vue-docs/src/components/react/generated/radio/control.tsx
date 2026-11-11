/** @jsxImportSource react */
import { Button, Radio, Space } from '@sdata/web-react';
import { useState } from 'react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  const [checked1, setChecked1] = useState(false);
  const [checked2, setChecked2] = useState(false);
  const handleSetCheck = () => {
    setChecked2(!checked2);
  };
  const handleReset = () => {
    setChecked1(false);
    setChecked2(false);
  };

  return (
    <>
      <Space size={'large'}>
        <Radio modelValue={checked1} onValueChange={(next) => setChecked1(next as typeof checked1)}>
          {'v-model'}
        </Radio>
        <Radio modelValue={true}>{'绑定布尔值 true'}</Radio>
        <Radio modelValue={checked2}>{'绑定值 2'}</Radio>
        <Radio defaultChecked={true}>{'非受控状态'}</Radio>
      </Space>
      <div className={'sd:mt-5'}>
        <Space size={'large'}>
          <Button type={'primary'} onClick={handleSetCheck}>
            {formatValue(checked2 ? 'uncheck' : 'check')}
            {' value2 '}
          </Button>
          <Button onClick={handleReset}>{' 全部重置 '}</Button>
        </Space>
      </div>
    </>
  );
}
