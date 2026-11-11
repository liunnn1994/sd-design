/** @jsxImportSource react */
import type { BloomMenuItem } from '@sdata/web-react';

import { BloomMenu, Button } from '@sdata/web-react';
import { IconFile, IconFolder, IconLink } from '@sdata/web-react/icon';
import { useState } from 'react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  const [open, setOpen] = useState(false);
  const items: BloomMenuItem[] = [
    { value: 'doc', label: '文档', icon: <IconFile /> },
    { value: 'folder', label: '文件夹', icon: <IconFolder /> },
    { value: 'link', label: '链接', icon: <IconLink /> },
  ];

  return (
    <>
      <div data-v-cdce1d64="" className={'bloom-menu-demo'}>
        <BloomMenu
          data-v-cdce1d64=""
          modelValue={open}
          onModelValueChange={(next) => setOpen(next as typeof open)}
          items={items}
          title={'受控菜单'}
          triggerText={'打开菜单'}
        />
        <Button
          data-v-cdce1d64=""
          size={'small'}
          onClick={() => {
            setOpen(!open);
          }}
        >
          {formatValue(open ? '从外部关闭' : '从外部打开')}
        </Button>
      </div>
      <style>
        {
          '\n.bloom-menu-demo[data-v-cdce1d64] {\n    display: flex;\n    gap: 16px;\n    align-items: center;\n    justify-content: center;\n    min-height: 320px;\n}\n'
        }
      </style>
    </>
  );
}
