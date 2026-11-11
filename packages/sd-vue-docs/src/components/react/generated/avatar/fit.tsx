/** @jsxImportSource react */
import { Avatar, Button } from '@sdata/web-react';
import { useState } from 'react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  const list = ['B', 'SD', '设计', 'Tom', 'AD'];
  const [index, setIndex] = useState(0);
  const text = (() => list[index])();
  const onClick = () => {
    setIndex(index >= list.length - 1 ? 0 : index + 1);
  };

  return (
    <>
      <Avatar className={'sd:mr-6 sd:align-middle sd:bg-[#14a9f8]'}>{formatValue(text)}</Avatar>
      <Button type={'secondary'} onClick={onClick} className={'sd:align-middle'}>
        {' 切换 '}
      </Button>
    </>
  );
}
