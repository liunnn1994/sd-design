/** @jsxImportSource react */
import type { FileItem, RequestOption, UploadRequest } from '@sdata/web-react';

import { Input, Space, Upload } from '@sdata/web-react';
import { type ComponentProps, useState } from 'react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  const [lockKey, setLockKey] = useState('upload-demo');
  const [message, setMessage] = useState('');
  const request = (option: RequestOption): UploadRequest => {
    setMessage('');
    // 示例仅模拟请求，实际接入时替换为可取消的上传请求。
    const timer = setTimeout(() => option.onSuccess(), 5000);
    return { abort: () => clearTimeout(timer) };
  };
  const handleError = (file: FileItem) => {
    const response = file.response;
    if (typeof response === 'object' && response !== null && 'code' in response) {
      if (response.code === 'UPLOAD_LOCK_BUSY') {
        setMessage('相同标识的上传正在进行，请结束后手动重试。');
      } else if (response.code === 'UPLOAD_LOCK_UNSUPPORTED') {
        setMessage('当前环境不支持上传互斥，请在支持 Web Locks 的 HTTPS 环境中使用。');
      }
    }
  };

  return (
    <>
      <Space direction={'vertical'} fill={true}>
        <Input
          value={lockKey}
          onValueChange={(next) => setLockKey(next as typeof lockKey)}
          aria-label={'上传互斥标识'}
          placeholder={'输入业务互斥标识'}
        />
        <Upload lockKey={lockKey} customRequest={request} onError={handleError} />
        <div>{'在另一个标签页打开本页，使用相同标识选文件；模拟上传持续 5 秒。'}</div>
        {message ? <div role={'status'}>{formatValue(message)}</div> : null}
      </Space>
    </>
  );
}
