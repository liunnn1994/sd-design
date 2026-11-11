/** @jsxImportSource react */
import type { BloomMenuItem } from '@sdata/web-react';

import { BloomMenu, Button } from '@sdata/web-react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  type InviteItem = BloomMenuItem & { description: string };
  const items: InviteItem[] = [
    { value: 'email', label: '邮件邀请', description: '发送带有效期的邀请链接' },
    { value: 'link', label: '复制链接', description: '分享团队的公开邀请地址' },
    { value: 'disabled', label: '批量导入', description: '当前工作区暂不可用', disabled: true },
  ];
  function getDescription(value: BloomMenuItem['value']) {
    return items.find((item) => item.value === value)?.description;
  }

  return (
    <>
      <div data-v-52d0a6c7="" className={'bloom-menu-demo'}>
        <BloomMenu
          data-v-52d0a6c7=""
          items={items}
          title={'成员操作'}
          renderTrigger={() => (
            <>
              <span data-v-52d0a6c7="" className={'custom-trigger'}>
                {'邀请成员 '}
                <span data-v-52d0a6c7="" aria-hidden={'true'}>
                  {'＋'}
                </span>
              </span>
            </>
          )}
          renderHeader={({ close }) => (
            <>
              <strong data-v-52d0a6c7="">{'选择邀请方式'}</strong>
              <Button
                data-v-52d0a6c7=""
                size={'mini'}
                type={'text'}
                onClick={() => {
                  close();
                }}
              >
                {'取消'}
              </Button>
            </>
          )}
          renderItem={({ item }) => (
            <>
              <span data-v-52d0a6c7="" className={'custom-item'}>
                <span data-v-52d0a6c7="" className={'custom-item-title'}>
                  {formatValue(item.label)}
                </span>
                <small data-v-52d0a6c7="">{formatValue(getDescription(item.value))}</small>
              </span>
            </>
          )}
        />
      </div>
      <style>
        {
          '\n.bloom-menu-demo[data-v-52d0a6c7] {\n    display: grid;\n    place-items: center;\n    min-height: 320px;\n}\n.custom-trigger[data-v-52d0a6c7] {\n    display: inline-flex;\n    gap: 8px;\n    align-items: center;\n}\n.custom-item[data-v-52d0a6c7] {\n    display: flex;\n    flex-direction: column;\n    gap: 4px;\n    align-items: flex-start;\n    text-align: left;\n}\n.custom-item-title[data-v-52d0a6c7] {\n    color: var(--sd-color-text-1);\n    font-weight: 500;\n}\nsmall[data-v-52d0a6c7] {\n    color: var(--sd-color-text-3);\n    font-size: 12px;\n    line-height: 1.4;\n    white-space: normal;\n}\n'
        }
      </style>
    </>
  );
}
