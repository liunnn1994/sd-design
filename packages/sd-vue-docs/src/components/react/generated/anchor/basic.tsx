/** @jsxImportSource react */
import { Anchor, AnchorLink } from '@sdata/web-react';
import { useId, useState } from 'react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  const id = `anchor-basic-${useId()}`;
  const [content, setContent] = useState<HTMLDivElement | null>(null);
  const sections = [
    { key: 'basic', title: '基础' },
    { key: 'line-less', title: '无线模式' },
    { key: 'affix', title: '固钉' },
    { key: 'boundary', title: '滚动边界' },
    { key: 'hash', title: '哈希模式' },
  ];

  return (
    <>
      <div data-v-61d119d8="" className={'anchor-basic-demo'} data-anchor-demo={'basic'}>
        <Anchor data-v-61d119d8="" scrollContainer={content ?? undefined}>
          <AnchorLink data-v-61d119d8="" href={`#${id}-basic`}>
            {'基础'}
          </AnchorLink>
          <AnchorLink data-v-61d119d8="" href={`#${id}-line-less`}>
            {'无线模式'}
          </AnchorLink>
          <AnchorLink
            data-v-61d119d8=""
            href={`#${id}-affix`}
            sublist={
              <>
                <AnchorLink data-v-61d119d8="" href={`#${id}-boundary`}>
                  {'滚动边界'}
                </AnchorLink>
                <AnchorLink data-v-61d119d8="" href={`#${id}-hash`}>
                  {'哈希模式'}
                </AnchorLink>
              </>
            }
          >
            {' 固钉 '}
          </AnchorLink>
        </Anchor>
        <div
          data-v-61d119d8=""
          ref={setContent}
          className={'anchor-basic-content'}
          data-anchor-content={true}
          tabIndex={0}
          aria-label={'锚点示例内容'}
        >
          {sections.map((section) => (
            <section data-v-61d119d8="" id={`${id}-${section.key}`} key={section.key}>
              <h4 data-v-61d119d8="">{formatValue(section.title)}</h4>
              <p data-v-61d119d8="">{'点击左侧锚点，滚动到对应的内容区域。'}</p>
            </section>
          ))}
        </div>
      </div>
      <style>
        {
          '.anchor-basic-demo[data-v-61d119d8] {\n  display: grid;\n  grid-template-columns: minmax(100px, 160px) minmax(0, 1fr);\n  gap: 16px;\n  align-items: start;\n}\n.anchor-basic-demo[data-v-61d119d8] .sd-anchor {\n  width: 100%;\n  background: var(--sd-color-bg-2);\n}\n.anchor-basic-content[data-v-61d119d8] {\n  height: 240px;\n  overflow: auto;\n  border: 1px solid var(--sd-color-border-2);\n  border-radius: 6px;\n}\n.anchor-basic-content section[data-v-61d119d8] {\n  min-height: 240px;\n  padding: 16px;\n}'
        }
      </style>
    </>
  );
}
