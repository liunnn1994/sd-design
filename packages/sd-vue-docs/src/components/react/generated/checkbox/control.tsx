/** @jsxImportSource react */
import { Button, Checkbox, Space } from '@sdata/web-react';
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

  return (
    <>
      <Space size={'large'}>
        <Checkbox
          modelValue={checked1}
          onValueChange={(next) => setChecked1(next as typeof checked1)}
        >
          {'v-model'}
        </Checkbox>
        <Checkbox modelValue={true}>{'绑定值'}</Checkbox>
        <Checkbox modelValue={checked2}>{'绑定值 2'}</Checkbox>
        <Checkbox defaultChecked={true}>{'非受控状态'}</Checkbox>
      </Space>
      <div className={'sd:mt-5'}>
        <Button type={'primary'} onClick={handleSetCheck}>
          {formatValue(checked2 ? 'uncheck' : 'check')}
          {' value2 '}
        </Button>
      </div>
    </>
  );
}
