/** @jsxImportSource react */
import type { RegexVisFlag } from '@sdata/web-react';

import { RegexVis } from '@sdata/web-react';
import { useState } from 'react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  const [value, setValue] = useState('^[a-z0-9_-]{3,16}$');
  const [flags, setFlags] = useState<RegexVisFlag[]>(['i']);

  return (
    <>
      <div data-v-dcfc7519="" className={'regex-vis-demo'}>
        <RegexVis
          data-v-dcfc7519=""
          className={'regex-vis-demo-component'}
          value={value}
          onValueChange={(next) => setValue(next as typeof value)}
          flags={flags}
          onFlagsChange={(next) => setFlags(next as typeof flags)}
        />
        <p data-v-dcfc7519="">
          {'当前表达式：/'}
          {formatValue(value)}
          {'/'}
          {formatValue(flags.join(''))}
        </p>
      </div>
      <style>
        {
          '\n.regex-vis-demo[data-v-dcfc7519] {\n    display: grid;\n    grid-template-columns: minmax(0, 1fr);\n    gap: 12px;\n    min-width: 0;\n}\n.regex-vis-demo-component[data-v-dcfc7519] {\n    width: 100%;\n    min-width: 0;\n    max-width: 100%;\n}\np[data-v-dcfc7519] {\n    margin: 0;\n    color: var(--sd-color-text-2);\n    font-family: consolas, menlo, monospace;\n    overflow-wrap: anywhere;\n}\n'
        }
      </style>
    </>
  );
}
