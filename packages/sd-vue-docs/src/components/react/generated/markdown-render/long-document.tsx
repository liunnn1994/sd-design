/** @jsxImportSource react */
import type { MarkstreamVirtualMetrics, MarkdownRenderInstance } from '@sdata/web-react';

import {
  Button,
  MarkdownRender,
  Radio,
  RadioGroup,
  Space,
  TypographyText as Text,
  UpstreamMarkdownRender,
} from '@sdata/web-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  type Engine = 'sd' | 'upstream';
  const SECTION_COUNT = 300;
  const [engine, setEngine] = useState<Engine>('sd');
  const maxLiveNodes = 80;
  const [scrollRoot, setScrollRoot] = useState<HTMLDivElement | null>(null);
  const renderer = useRef<MarkdownRenderInstance | null>(null);
  const [metrics, setMetrics] = useState<MarkstreamVirtualMetrics | null>(null);
  const [dom, setDom] = useState({ slots: 0, elements: 0, nestedRenderers: 0 });
  const virtualScroll = useMemo(
    () => (scrollRoot ? { enabled: true, sessionKey: 'markdown-long-doc', scrollRoot } : undefined),
    [scrollRoot],
  );
  const content = useMemo(
    () =>
      Array.from({ length: SECTION_COUNT }, (_, index) => {
        const parts = [
          `## 第 ${index + 1} 节 滚滚长江东逝水`,
          `段落 ${index + 1}：**浪花淘尽英雄**，是*非成败转头空*，含 \`inline\` 与 [链接](https://example.com/${index + 1})。`,
          `- 项目 ${index + 1}-A`,
          `- 项目 ${index + 1}-B`,
        ];
        // 每 25 节插入一个代码块，让重节点也参与虚拟化与测量。
        if (index % 25 === 24) parts.push('```js\nconst section = ' + (index + 1) + ';\n```');
        return parts.join('\n\n');
      }).join('\n\n'),
    [],
  );
  const readDom = useCallback(() => {
    if (!scrollRoot) return;
    const next = {
      slots: scrollRoot.querySelectorAll('.node-slot').length,
      elements: scrollRoot.querySelectorAll('*').length,
      nestedRenderers: scrollRoot.querySelectorAll('.markdown-renderer .markdown-renderer').length,
    };
    setDom((previous) =>
      previous.slots === next.slots &&
      previous.elements === next.elements &&
      previous.nestedRenderers === next.nestedRenderers
        ? previous
        : next,
    );
  }, [scrollRoot]);
  const refreshMetrics = useCallback(() => {
    setMetrics(renderer.current?.getVirtualMetrics() ?? null);
    requestAnimationFrame(readDom);
  }, [readDom]);
  const measure = useCallback(async () => {
    setMetrics((await renderer.current?.forceMeasure()) ?? null);
    requestAnimationFrame(readDom);
  }, [readDom]);
  const onStateChange = useCallback(
    (state: { metrics: MarkstreamVirtualMetrics }) => {
      setMetrics(state.metrics);
      requestAnimationFrame(readDom);
    },
    [readDom],
  );
  function scrollToEnd() {
    if (scrollRoot) scrollRoot.scrollTop = scrollRoot.scrollHeight;
    window.setTimeout(measure, 120);
  }
  useEffect(() => {
    refreshMetrics();
    scrollRoot?.addEventListener('scroll', refreshMetrics, { passive: true });
    return () => scrollRoot?.removeEventListener('scroll', refreshMetrics);
  }, [scrollRoot, engine, refreshMetrics]);
  const rendererProps = {
    ref: renderer,
    content,
    final: true,
    nodeVirtual: 'auto' as const,
    maxLiveNodes,
    liveNodeBuffer: 20,
    virtualScroll,
    onVirtualStateChange: onStateChange,
  };

  return (
    <>
      <Space data-v-4a47bcbc="" direction={'vertical'} size={'medium'} fill={true}>
        <Space data-v-4a47bcbc="" direction={'vertical'} size={'small'} fill={true}>
          <Space data-v-4a47bcbc="">
            <RadioGroup
              data-v-4a47bcbc=""
              value={engine}
              onValueChange={(next) => setEngine(next as typeof engine)}
              size={'mini'}
            >
              <Radio data-v-4a47bcbc="" value={'sd'}>
                {'SD 封装'}
              </Radio>
              <Radio data-v-4a47bcbc="" value={'upstream'}>
                {'上游原生'}
              </Radio>
            </RadioGroup>
            <Button data-v-4a47bcbc="" size={'mini'} onClick={scrollToEnd}>
              {'跳到末尾'}
            </Button>
            <Button data-v-4a47bcbc="" size={'mini'} onClick={measure}>
              {'重新测量'}
            </Button>
          </Space>
          <Text data-v-4a47bcbc="" type={'secondary'}>
            {
              ' 300 段长文档（标题、段落、列表与代码块）。两种引擎的挂载节点数应保持一致：SD 的节点适配不会让 上游退化为逐个列表项创建嵌套渲染器，虚拟化与节点预算因此原样生效。 '
            }
          </Text>
        </Space>
        <div data-v-4a47bcbc="" ref={setScrollRoot} className={'long-doc-scroll'}>
          <>
            {engine === 'sd' ? (
              <MarkdownRender {...rendererProps} />
            ) : (
              <UpstreamMarkdownRender {...rendererProps} />
            )}
          </>
        </div>
        <div data-v-4a47bcbc="" className={'long-doc-metrics'}>
          <div data-v-4a47bcbc="">
            <Text data-v-4a47bcbc="" type={'secondary'}>
              {'文档节点总数'}
            </Text>
            <strong data-v-4a47bcbc="">{formatValue(metrics?.nodeCount ?? '—')}</strong>
          </div>
          <div data-v-4a47bcbc="">
            <Text data-v-4a47bcbc="" type={'secondary'}>
              {'实际挂载节点'}
            </Text>
            <strong data-v-4a47bcbc="">{formatValue(dom.slots)}</strong>
          </div>
          <div data-v-4a47bcbc="">
            <Text data-v-4a47bcbc="" type={'secondary'}>
              {'已测量 / 估算'}
            </Text>
            <strong data-v-4a47bcbc="">
              {formatValue(metrics?.measuredCount ?? 0)}
              {' / '}
              {formatValue(metrics?.estimatedCount ?? 0)}
            </strong>
          </div>
          <div data-v-4a47bcbc="">
            <Text data-v-4a47bcbc="" type={'secondary'}>
              {'文档总高度'}
            </Text>
            <strong data-v-4a47bcbc="">
              {formatValue(Math.round(metrics?.totalHeight ?? 0))}
              {' px'}
            </strong>
          </div>
          <div data-v-4a47bcbc="">
            <Text data-v-4a47bcbc="" type={'secondary'}>
              {'DOM 元素总数'}
            </Text>
            <strong data-v-4a47bcbc="">{formatValue(dom.elements)}</strong>
          </div>
          <div
            data-v-4a47bcbc=""
            className={dom.nestedRenderers > 0 ? 'long-doc-metrics__bad' : 'long-doc-metrics__good'}
          >
            <Text data-v-4a47bcbc="" type={'secondary'}>
              {'嵌套渲染器'}
            </Text>
            <strong data-v-4a47bcbc="">{formatValue(dom.nestedRenderers)}</strong>
          </div>
        </div>
      </Space>
      <style>
        {
          '.long-doc-scroll[data-v-4a47bcbc] {\n  height: 420px;\n  overflow: auto;\n  padding: 16px;\n  border: 1px solid var(--sd-color-border-2);\n  border-radius: var(--sd-border-radius-medium);\n}\n.long-doc-metrics[data-v-4a47bcbc] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 24px;\n  padding: 12px 16px;\n  font-size: 12px;\n  border: 1px solid var(--sd-color-border-2);\n  border-radius: var(--sd-border-radius-medium);\n}\n.long-doc-metrics > div[data-v-4a47bcbc] {\n  display: flex;\n  gap: 6px;\n  align-items: baseline;\n}\n.long-doc-metrics strong[data-v-4a47bcbc] {\n  font-variant-numeric: tabular-nums;\n}\n.long-doc-metrics__good strong[data-v-4a47bcbc] {\n  color: var(--sd-color-success-6);\n}\n.long-doc-metrics__bad strong[data-v-4a47bcbc] {\n  color: var(--sd-color-danger-6);\n}'
        }
      </style>
    </>
  );
}
