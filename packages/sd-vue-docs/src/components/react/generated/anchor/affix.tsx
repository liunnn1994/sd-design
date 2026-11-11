/** @jsxImportSource react */
import { Affix, Anchor, AnchorLink } from '@sdata/web-react';
import { useId, useState } from 'react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  const id = `anchor-affix-${useId()}`;
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
      <div
        data-v-8030b417=""
        ref={setContent}
        className={'anchor-affix-demo'}
        data-anchor-demo={'affix'}
        data-anchor-content={true}
        tabIndex={0}
        aria-label={'锚点示例内容'}
      >
        <Affix data-v-8030b417="" target={content ?? undefined} offsetTop={0}>
          <Anchor data-v-8030b417="" scrollContainer={content ?? undefined}>
            <AnchorLink data-v-8030b417="" href={`#${id}-basic`}>
              {'基础'}
            </AnchorLink>
            <AnchorLink data-v-8030b417="" href={`#${id}-line-less`}>
              {'无线模式'}
            </AnchorLink>
            <AnchorLink
              data-v-8030b417=""
              href={`#${id}-affix`}
              sublist={
                <>
                  <AnchorLink data-v-8030b417="" href={`#${id}-boundary`}>
                    {'滚动边界'}
                  </AnchorLink>
                  <AnchorLink data-v-8030b417="" href={`#${id}-hash`}>
                    {'哈希模式'}
                  </AnchorLink>
                </>
              }
            >
              {' 固钉 '}
            </AnchorLink>
          </Anchor>
        </Affix>
        <div data-v-8030b417="" className={'anchor-affix-content'}>
          {sections.map((section) => (
            <section data-v-8030b417="" id={`${id}-${section.key}`} key={section.key}>
              <h4 data-v-8030b417="">{formatValue(section.title)}</h4>
              <p data-v-8030b417="">{'点击左侧锚点，滚动到对应的内容区域。'}</p>
            </section>
          ))}
        </div>
      </div>
      <style>
        {
          '.anchor-affix-demo[data-v-8030b417] {\n  display: grid;\n  grid-template-columns: minmax(100px, 160px) minmax(0, 1fr);\n  gap: 16px;\n  align-items: start;\n  height: 240px;\n  overflow: auto;\n}\n.anchor-affix-demo[data-v-8030b417] .sd-anchor {\n  width: 100%;\n  background: var(--sd-color-bg-2);\n}\n.anchor-affix-content[data-v-8030b417] {\n  border: 1px solid var(--sd-color-border-2);\n  border-radius: 6px;\n}\n.anchor-affix-content section[data-v-8030b417] {\n  min-height: 240px;\n  padding: 16px;\n}'
        }
      </style>
    </>
  );
}
