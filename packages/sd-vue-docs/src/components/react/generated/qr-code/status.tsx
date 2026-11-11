/** @jsxImportSource react */
import { Message } from '@sdata/web-react';
import { QrCode } from '@sdata/web-react';

export default function Example() {
  const value = 'https://sd-design.js.org';
  const onRefresh = () => {
    Message.info('已触发刷新事件');
  };

  return (
    <>
      <div className={'sd:flex sd:flex-wrap sd:gap-6'}>
        <QrCode value={value} status={'loading'} spinProps={{ size: 10, dot: true }} />
        <QrCode value={value} status={'expired'} onRefresh={onRefresh} />
        <QrCode value={value} status={'scanned'} />
      </div>
    </>
  );
}
