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
  const id = `anchor-hash-${useId()}`;
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
      <div data-v-dee60df9="" className={'anchor-hash-demo'} data-anchor-demo={'hash'}>
        <Anchor data-v-dee60df9="" scrollContainer={content ?? undefined} changeHash={false}>
          <AnchorLink data-v-dee60df9="" href={`#${id}-basic`}>
            {'基础'}
          </AnchorLink>
          <AnchorLink data-v-dee60df9="" href={`#${id}-line-less`}>
            {'无线模式'}
          </AnchorLink>
          <AnchorLink
            data-v-dee60df9=""
            href={`#${id}-affix`}
            sublist={
              <>
                <AnchorLink data-v-dee60df9="" href={`#${id}-boundary`}>
                  {'滚动边界'}
                </AnchorLink>
                <AnchorLink data-v-dee60df9="" href={`#${id}-hash`}>
                  {'哈希模式'}
                </AnchorLink>
              </>
            }
          >
            {' 固钉 '}
          </AnchorLink>
        </Anchor>
        <div
          data-v-dee60df9=""
          ref={setContent}
          className={'anchor-hash-content'}
          data-anchor-content={true}
          tabIndex={0}
          aria-label={'锚点示例内容'}
        >
          {sections.map((section) => (
            <section data-v-dee60df9="" id={`${id}-${section.key}`} key={section.key}>
              <h4 data-v-dee60df9="">{formatValue(section.title)}</h4>
              <p data-v-dee60df9="">{'点击左侧锚点，滚动到对应的内容区域。'}</p>
            </section>
          ))}
        </div>
      </div>
      <style>
        {
          '.anchor-hash-demo[data-v-dee60df9] {\n  display: grid;\n  grid-template-columns: minmax(100px, 160px) minmax(0, 1fr);\n  gap: 16px;\n  align-items: start;\n}\n.anchor-hash-demo[data-v-dee60df9] .sd-anchor {\n  width: 100%;\n  background: var(--sd-color-bg-2);\n}\n.anchor-hash-content[data-v-dee60df9] {\n  height: 240px;\n  overflow: auto;\n  border: 1px solid var(--sd-color-border-2);\n  border-radius: 6px;\n}\n.anchor-hash-content section[data-v-dee60df9] {\n  min-height: 240px;\n  padding: 16px;\n}'
        }
      </style>
    </>
  );
}
