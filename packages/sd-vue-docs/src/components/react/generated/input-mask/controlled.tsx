/** @jsxImportSource react */
import type { InputMaskPresetName } from '@sdata/web-react';

import { Button, InputMask, Space } from '@sdata/web-react';
import { useState } from 'react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  const [preset, setPreset] = useState<InputMaskPresetName>('semver');
  const [value, setValue] = useState('1.2.3');

  return (
    <>
      <Space direction={'vertical'} align={'start'}>
        <InputMask
          value={value}
          onValueChange={(next) => setValue(next as typeof value)}
          preset={preset}
          allowClear={true}
        />
        <Space>
          <Button
            onClick={() => {
              setPreset(preset === 'semver' ? 'url' : 'semver');
            }}
          >
            {' 切换为 '}
            {formatValue(preset === 'semver' ? 'URL' : 'SemVer')}
          </Button>
          <span className={'text-sm text-slate-500'}>
            {'当前值：'}
            {formatValue(value || '空')}
          </span>
        </Space>
      </Space>
    </>
  );
}
