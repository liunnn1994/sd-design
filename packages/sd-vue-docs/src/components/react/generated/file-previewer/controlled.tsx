/** @jsxImportSource react */
import { Button, FilePreviewer } from '@sdata/web-react';
import { useState } from 'react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  const [visible, setVisible] = useState(false);
  const [closedCount, setClosedCount] = useState(0);

  return (
    <>
      <Button
        type={'primary'}
        onClick={() => {
          setVisible(true);
        }}
      >
        {'打开受控预览'}
      </Button>
      <FilePreviewer
        visible={visible}
        onVisibleChange={(next) => setVisible(next as typeof visible)}
        title={'受控预览'}
        type={'pdf'}
        src={'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf'}
        onClose={() => {
          setClosedCount((previous) => previous + 1);
        }}
      />
      <span className={'sd:ml-2'}>
        {'关闭次数：'}
        {formatValue(closedCount)}
      </span>
    </>
  );
}
