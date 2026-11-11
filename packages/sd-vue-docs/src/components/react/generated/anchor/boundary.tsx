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
  const id = `anchor-boundary-${useId()}`;
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
      <div data-v-2797915a="" className={'anchor-boundary-demo'} data-anchor-demo={'boundary'}>
        <Anchor data-v-2797915a="" scrollContainer={content ?? undefined} boundary={'center'}>
          <AnchorLink data-v-2797915a="" href={`#${id}-basic`}>
            {'基础'}
          </AnchorLink>
          <AnchorLink data-v-2797915a="" href={`#${id}-line-less`}>
            {'无线模式'}
          </AnchorLink>
          <AnchorLink
            data-v-2797915a=""
            href={`#${id}-affix`}
            sublist={
              <>
                <AnchorLink data-v-2797915a="" href={`#${id}-boundary`}>
                  {'滚动边界'}
                </AnchorLink>
                <AnchorLink data-v-2797915a="" href={`#${id}-hash`}>
                  {'哈希模式'}
                </AnchorLink>
              </>
            }
          >
            {' 固钉 '}
          </AnchorLink>
        </Anchor>
        <div
          data-v-2797915a=""
          ref={setContent}
          className={'anchor-boundary-content'}
          data-anchor-content={true}
          tabIndex={0}
          aria-label={'锚点示例内容'}
        >
          {sections.map((section) => (
            <section data-v-2797915a="" id={`${id}-${section.key}`} key={section.key}>
              <h4 data-v-2797915a="">{formatValue(section.title)}</h4>
              <p data-v-2797915a="">{'点击左侧锚点，滚动到对应的内容区域。'}</p>
            </section>
          ))}
        </div>
      </div>
      <style>
        {
          '.anchor-boundary-demo[data-v-2797915a] {\n  display: grid;\n  grid-template-columns: minmax(100px, 160px) minmax(0, 1fr);\n  gap: 16px;\n  align-items: start;\n}\n.anchor-boundary-demo[data-v-2797915a] .sd-anchor {\n  width: 100%;\n  background: var(--sd-color-bg-2);\n}\n.anchor-boundary-content[data-v-2797915a] {\n  height: 240px;\n  overflow: auto;\n  border: 1px solid var(--sd-color-border-2);\n  border-radius: 6px;\n}\n.anchor-boundary-content section[data-v-2797915a] {\n  min-height: 240px;\n  padding: 16px;\n}'
        }
      </style>
    </>
  );
}
