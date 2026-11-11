/** @jsxImportSource react */
import { RichLineClamp, Tag, WrapClamp } from '@sdata/web-react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  const html = '<strong>RichLineClamp</strong> 保留可信内联 HTML 的格式并按行裁剪。';
  const items = [
    { id: 1, label: '设计' },
    { id: 2, label: '开发' },
    { id: 3, label: '测试' },
    { id: 4, label: '文档' },
  ];

  return (
    <>
      <div data-v-d09c721a="" className={'sd:flex sd:flex-col sd:gap-4'}>
        <RichLineClamp data-v-d09c721a="" html={html} maxLines={1} className={'rich-clamp-demo'} />
        <WrapClamp
          data-v-d09c721a=""
          items={items}
          itemKey={'id'}
          maxLines={1}
          className={'wrap-clamp-demo'}
          renderItem={({ item }) => (
            <>
              <Tag data-v-d09c721a="">{formatValue(item.label)}</Tag>
            </>
          )}
          after={({ clamped, hiddenItems }) => (
            <>
              {clamped ? (
                <Tag data-v-d09c721a="">
                  {'+'}
                  {formatValue(hiddenItems.length)}
                </Tag>
              ) : null}
            </>
          )}
        />
      </div>
      <style>
        {
          "\n.rich-clamp-demo[data-v-d09c721a] {\n    width: min(100%, 16rem);\n}\n.wrap-clamp-demo[data-v-d09c721a] {\n    width: min(100%, 8rem);\n}\n.wrap-clamp-demo[data-v-d09c721a] [data-part='content'] {\n    align-items: center;\n    gap: 0.5rem;\n}\n"
        }
      </style>
    </>
  );
}
