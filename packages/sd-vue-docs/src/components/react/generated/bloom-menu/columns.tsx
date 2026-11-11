/** @jsxImportSource react */
import type { BloomMenuItem } from '@sdata/web-react';

import { BloomMenu } from '@sdata/web-react';
import { IconFile, IconFolder, IconLink, IconNotification } from '@sdata/web-react/icon';

export default function Example() {
  const items: BloomMenuItem[] = [
    { value: 'doc', label: '新建文档', icon: <IconFile /> },
    { value: 'folder', label: '新建文件夹', icon: <IconFolder /> },
    { value: 'reminder', label: '添加提醒', icon: <IconNotification /> },
    { value: 'link', label: '添加链接', icon: <IconLink /> },
  ];

  return (
    <>
      <div data-v-7f5fd7b1="" className={'bloom-menu-demo'}>
        <BloomMenu
          data-v-7f5fd7b1=""
          items={items}
          columns={2}
          title={'快捷操作'}
          triggerText={'两列菜单'}
        />
      </div>
      <style>
        {
          '\n.bloom-menu-demo[data-v-7f5fd7b1] {\n    display: grid;\n    place-items: center;\n    min-height: 320px;\n}\n'
        }
      </style>
    </>
  );
}
