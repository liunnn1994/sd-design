/** @jsxImportSource react */
import type { BloomMenuItem } from '@sdata/web-react';

import { BloomMenu } from '@sdata/web-react';
import {
  IconApps,
  IconFile,
  IconFolder,
  IconLink,
  IconList,
  IconNotification,
} from '@sdata/web-react/icon';
import { useState } from 'react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  const items: BloomMenuItem[] = [
    { value: 'doc', label: '文档', icon: <IconFile /> },
    { value: 'board', label: '看板', icon: <IconApps /> },
    { value: 'table', label: '表格', icon: <IconList /> },
    { value: 'folder', label: '文件夹', icon: <IconFolder /> },
    { value: 'reminder', label: '提醒', icon: <IconNotification /> },
    { value: 'link', label: '链接', icon: <IconLink /> },
  ];
  const [selectedLabel, setSelectedLabel] = useState('');
  function handleSelect(item: BloomMenuItem) {
    setSelectedLabel(item.label);
  }

  return (
    <>
      <div data-v-97269b6f="" className={'bloom-menu-demo'}>
        <BloomMenu
          data-v-97269b6f=""
          items={items}
          title={'创建'}
          triggerText={'创建'}
          buttonProps={{ style: { width: '144px', height: '44px' } }}
          onSelect={handleSelect}
        />
        <p data-v-97269b6f="">
          {'最近选择：'}
          {formatValue(selectedLabel || '暂无')}
        </p>
      </div>
      <style>
        {
          '\n.bloom-menu-demo[data-v-97269b6f] {\n    display: grid;\n    place-items: center;\n    min-height: 320px;\n}\np[data-v-97269b6f] {\n    margin: 20px 0 0;\n    color: var(--sd-color-text-2);\n}\n'
        }
      </style>
    </>
  );
}
