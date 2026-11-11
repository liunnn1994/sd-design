import { useRef, useState } from 'react';

import type { ClampExposed } from '../../src/clamp/index';
import type { EllipsisInstance, PerformantEllipsisExposed } from '../../src/ellipsis/index';

import { RichLineClamp } from '../../src/clamp/index';
import { Ellipsis, PerformantEllipsis } from '../../src/ellipsis/index';

const richText =
  '<strong>Rich text content</strong> with a long description that repeats to exceed two lines. '.repeat(
    8,
  );
export function ClampFixture() {
  const ellipsis = useRef<EllipsisInstance>(null);
  const [singleLines, setSingleLines] = useState<number>();
  const [ellipsisStatus, setEllipsisStatus] = useState('');
  const ref = useRef<ClampExposed>(null);
  const performant = useRef<PerformantEllipsisExposed>(null);
  const [short, setShort] = useState(false);
  const [clamped, setClamped] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [clicks, setClicks] = useState(0);
  const root = useRef<HTMLElement>(null);
  const rootApi = useRef<ClampExposed>(null);
  const [rootTag, setRootTag] = useState<'div' | 'article'>('div');
  const [rootMounted, setRootMounted] = useState(true);
  const [rootStatus, setRootStatus] = useState('');
  return (
    <section>
      {rootMounted && (
        <RichLineClamp
          data-testid="rich-root-ref"
          as={rootTag}
          rootRef={root}
          ref={rootApi}
          html={richText}
          maxLines={1}
          style={{ width: 160 }}
        />
      )}
      <button
        onClick={() =>
          setRootStatus(`${root.current?.tagName ?? 'null'}:${typeof rootApi.current?.expand}`)
        }
      >
        读取截断引用
      </button>
      <button onClick={() => rootApi.current?.expand()}>引用展开</button>
      <button onClick={() => setRootTag('article')}>替换截断标签</button>
      <button onClick={() => setRootMounted(false)}>卸载截断引用</button>
      <output data-testid="rich-root-status">{rootStatus}</output>
      <PerformantEllipsis data-testid="lazy-hover" style={{ width: 100 }}>
        延迟激活的省略提示包含完整文本内容
      </PerformantEllipsis>
      <PerformantEllipsis
        data-testid="lazy-click"
        onClick={() => setClicks((value) => value + 1)}
        expandTrigger="click"
        style={{ width: 100 }}
      >
        首次点击就应该展开这段较长的文本
      </PerformantEllipsis>
      <output data-testid="lazy-clicks">{clicks}</output>
      <button
        onFocus={() => void performant.current?.setFocused(true)}
        onBlur={() => void performant.current?.setFocused(false)}
      >
        转交焦点提示
      </button>
      <PerformantEllipsis ref={performant} data-testid="lazy-focus" style={{ width: 100 }}>
        外部控件聚焦时显示完整省略内容
      </PerformantEllipsis>
      <RichLineClamp
        data-testid="empty-affix"
        html="short"
        before={() => null}
        after={() => false}
      />
      <Ellipsis
        ref={ellipsis}
        lineClamp={singleLines}
        data-testid="single-ellipsis"
        style={{ width: 120 }}
        expandTrigger="click"
      >
        这是很长的富文本省略内容，包含<strong>加粗文本</strong>，需要能够展开和收起。
      </Ellipsis>
      {new URLSearchParams(location.search).has('ellipsis-ref-alias') && (
        <>
          <button onClick={() => setSingleLines(2)}>切换省略容器</button>
          <button
            onClick={() =>
              setEllipsisStatus(
                `${ellipsis.current?.triggerRef === ellipsis.current?.triggerElement}:${ellipsis.current?.triggerRef?.tagName}`,
              )
            }
          >
            读取省略引用
          </button>
          <output data-testid="ellipsis-ref-status">{ellipsisStatus}</output>
        </>
      )}
      <Ellipsis data-testid="native-ellipsis" tooltip={false} style={{ width: 80 }}>
        关闭气泡时应使用原生标题提示完整内容
      </Ellipsis>
      <Ellipsis
        data-testid="multi-ellipsis"
        lineClamp={2}
        style={{ width: 120, lineHeight: '20px' }}
        expandTrigger="click"
      >
        {'多行省略文本内容需要正确测量。'.repeat(12)}
      </Ellipsis>
      <RichLineClamp
        data-testid="rich-clamp"
        ref={ref}
        html={short ? '<em>Short</em>' : richText}
        maxLines={2}
        style={{ width: 240, lineHeight: '20px' }}
        onClampChange={setClamped}
      />
      <output data-testid="rich-clamped">{String(clamped)}</output>
      <button onClick={() => ref.current?.expand()}>展开富文本</button>
      <button onClick={() => ref.current?.collapse()}>收起富文本</button>
      <button onClick={() => setShort(!short)}>改变富文本</button>
      <RichLineClamp
        data-testid="rich-custom-clamp"
        html={richText}
        maxLines={2}
        ellipsis=" [more]"
        expanded={expanded}
        onExpandedChange={setExpanded}
        style={{ width: 240, lineHeight: '20px' }}
        after={(state) => (
          <button type="button" onClick={state.toggle}>
            {state.expanded ? '收起自定义' : '展开自定义'}
          </button>
        )}
      />
      <RichLineClamp
        data-testid="rich-unsafe-clamp"
        html={richText}
        maxLines={2}
        ellipsis=" [more]"
        style={{ width: 240 }}
        after={<button type="submit">保留原始按钮</button>}
      />
    </section>
  );
}
