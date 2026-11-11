import type { MarkdownTextProbeProfile } from '@sdata/web-core/markdown/text-height';
import type { RenderContext } from 'markstream-react';

import { getMarkdownTypewriterMode } from '@sdata/web-core/markdown/cursor';
import {
  getMarkdown,
  mergeCustomHtmlTags,
  parseMarkdownToStructure,
} from '@sdata/web-core/markdown/parser';
import {
  getMarkdownModeOptions,
  getMarkdownMeasurementKey,
} from '@sdata/web-core/markdown/render-options';
import { createMarkdownVirtualController } from '@sdata/web-core/markdown/virtual-controller';
import { getMarkdownWidthBucket } from '@sdata/web-core/markdown/virtual-state';
import { renderNode, useSmoothMarkdownStream } from 'markstream-react';
import {
  Fragment,
  useCallback,
  useContext,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';

import type { MarkdownRenderProps, MarkstreamScrollRootLike } from './types.js';

import { useAfterRender } from '../_shared/use-after-render.js';
import { useThemeMode } from '../_shared/use-theme-mode.js';
import { usePrefix } from '../config-provider/index.js';
import { ThemeContext } from '../config-provider/theme-provider.js';
import { createMarkdownCodeEstimator } from './code-height.js';
import { MarkdownComponentsContext, useMarkdownComponents } from './context.js';
import { getMarkdownNestedProps, MarkdownNestedRendererContext } from './custom-children.js';
import { getMarkdownRootAttributes } from './dom-attrs.js';
import { MarkdownHeightProbes } from './height-probes.js';
import { MarkdownParagraphNode } from './nodes/container.js';
import { MarkdownNodeLifecycleContext } from './nodes/lifecycle.js';
import { getMarkdownPreComponents } from './nodes/pre-code.js';
import { useMarkdownBatch } from './use-batch.js';
import { MarkdownCursorOwnerContext, useMarkdownCursor } from './use-cursor.js';
import { useMarkdownEnterFade } from './use-enter-fade.js';
import { useMarkdownNativeEvents } from './use-native-events.js';
import { useMarkdownParseContent } from './use-parse-content.js';
import { useMarkdownViewport } from './use-viewport.js';

function resolveScrollRoot(
  value: MarkstreamScrollRootLike | (() => MarkstreamScrollRootLike),
): HTMLElement | null {
  const root = typeof value === 'function' ? value() : value;
  if (!root) return null;
  if ('current' in root) return root.current ?? null;
  if ('$el' in root) return root.$el ?? null;
  return root as HTMLElement;
}

export function MarkdownRenderer(props: MarkdownRenderProps) {
  const parentLifecycle = useContext(MarkdownNodeLifecycleContext);
  const attachEvents = useMarkdownNativeEvents(props, props.renderAsFragment === true);
  const mode = getMarkdownModeOptions(props.mode);
  const root = useRef<HTMLDivElement>(null);
  const id = useId();
  const prefix = usePrefix('markdown-render');
  const theme = useContext(ThemeContext);
  const themeMode = useThemeMode(root);
  const isDark = props.isDark ?? (theme.mode ?? themeMode) === 'dark';
  const customComponents = useMarkdownComponents(props.customId);
  const customParagraph = Boolean(
    customComponents.paragraph && customComponents.paragraph !== MarkdownParagraphNode,
  );
  const renderComponents = useMemo(
    () => getMarkdownPreComponents(customComponents, props.renderCodeBlocksAsPre === true),
    [customComponents, props.renderCodeBlocksAsPre],
  );
  const estimateCodeHeight = useMemo(
    () => createMarkdownCodeEstimator(props, customComponents),
    [props.renderCodeBlocksAsPre, props.codeBlockOptions, props.codeBlockProps, customComponents],
  );
  const maxLiveNodes = props.maxLiveNodes ?? mode.maxLiveNodes;
  const liveNodeBuffer = props.liveNodeBuffer ?? mode.liveNodeBuffer;
  const typewriter = getMarkdownTypewriterMode(props.typewriter) !== 'off';
  const stream = useSmoothMarkdownStream(props.smoothStreamingOptions);
  const [mounted, setMounted] = useState(false);
  const inputNodes = Boolean(props.nodes?.length);
  const source = props.content ?? '';
  const smooth =
    mounted &&
    !inputNodes &&
    props.smoothStreaming !== false &&
    (props.smoothStreaming === true || typewriter || maxLiveNodes <= 0);
  const visible = smooth ? stream.visible : source;
  const requestedFinal = props.final ?? props.parseOptions?.final;
  const final = smooth
    ? Boolean(requestedFinal && stream.source === source && stream.caughtUp)
    : requestedFinal;
  useLayoutEffect(() => {
    stream.reset(source);
    setMounted(true);
  }, []);
  useLayoutEffect(() => {
    if (inputNodes) {
      stream.reset('');
      return;
    }
    if (!smooth) {
      stream.reset(source);
      if (requestedFinal) stream.finish({ flush: true });
      return;
    }
    const previous = stream.getSnapshot().source;
    if (previous !== source) {
      if (source.startsWith(previous)) stream.enqueue(source.slice(previous.length));
      else stream.reset(source);
    }
    if (requestedFinal) stream.finish();
  }, [inputNodes, smooth, source, requestedFinal]);
  const customTags = useMemo(
    () =>
      mergeCustomHtmlTags(
        props.customHtmlTags,
        props.parseOptions?.customHtmlTags ?? [],
        Object.keys(props.streamingComponents ?? {}),
      ),
    [props.customHtmlTags, props.parseOptions, props.streamingComponents],
  );
  const markdown = useMemo(() => {
    const engine = getMarkdown(`sd-react-${props.customId ?? id}`, { customHtmlTags: customTags });
    return props.customMarkdownIt?.(engine) ?? engine;
  }, [props.customId, id, customTags, props.customMarkdownIt]);
  const parsedContent = useMarkdownParseContent({
    content: visible,
    enabled: smooth && !inputNodes,
    final,
    interval: props.parseCoalesceMs,
    parser: markdown,
    parseOptions: props.parseOptions,
  });
  const nodes = useMemo(
    () =>
      inputNodes
        ? [...props.nodes!]
        : parsedContent.content
          ? parseMarkdownToStructure(parsedContent.content, markdown, {
              ...props.parseOptions,
              ...(final == null ? {} : { final }),
              customHtmlTags: customTags,
            })
          : [],
    [
      inputNodes,
      props.nodes,
      parsedContent.content,
      markdown,
      props.parseOptions,
      final,
      customTags,
    ],
  );
  const nodeVirtual = props.nodeVirtual ?? mode.nodeVirtual;
  const virtual =
    !props.renderAsFragment &&
    (nodeVirtual === true ||
      (nodeVirtual === 'auto' && maxLiveNodes > 0 && nodes.length > maxLiveNodes));
  const requestedBatchSize = Math.trunc(props.renderBatchSize ?? mode.renderBatchSize);
  const batchSize = Number.isFinite(requestedBatchSize) ? Math.max(0, requestedBatchSize) : 0;
  const requestedInitialBatch = Math.trunc(
    props.initialRenderBatchSize ?? mode.initialRenderBatchSize,
  );
  const initialBatch = Number.isFinite(requestedInitialBatch)
    ? Math.max(0, requestedInitialBatch)
    : batchSize;
  const forceFullFinal = final === true && props.virtualScroll?.enabled !== true;
  const batching =
    mounted &&
    !props.renderAsFragment &&
    !virtual &&
    maxLiveNodes <= 0 &&
    batchSize > 0 &&
    !forceFullFinal &&
    !(smooth && !final) &&
    (props.batchRendering ?? mode.batchRendering);
  const afterRender = useAfterRender();
  const [, render] = useReducer((value: number) => value + 1, 0);
  const indexPrefix = String(props.indexKey ?? 'markdown-renderer');
  const sessionKey = String(
    props.virtualScroll?.sessionKey ?? props.indexKey ?? props.customId ?? id,
  );
  const threadKey = props.virtualScroll?.threadKey;
  const nodeScope =
    threadKey != null && threadKey !== ''
      ? threadKey
      : String(props.indexKey ?? props.customId ?? id);
  const materialized = useRef(new Set<string>());
  const textProbeProfile = useRef<MarkdownTextProbeProfile | undefined>(undefined);
  const [widthBucket, setWidthBucket] = useState(-1);
  const nodeIdentity = (index: number) => `${nodeScope}\0${index}\0${nodes[index]?.type ?? ''}`;
  const measurementKey = getMarkdownMeasurementKey({
    ...props,
    isDark,
    measurementKey: props.virtualScroll?.measurementKey,
  });
  const batch = useMarkdownBatch(
    {
      enabled: batching,
      count: nodes.length,
      datasetKey: props.virtualScroll?.enabled
        ? [
            'virtual',
            props.virtualScroll.threadKey ?? '',
            sessionKey,
            measurementKey,
            widthBucket,
          ].join('\0')
        : props.indexKey,
      initial: initialBatch,
      size: batchSize,
      delay: props.renderBatchDelay ?? mode.renderBatchDelay,
      budget: props.renderBatchBudgetMs ?? mode.renderBatchBudgetMs,
      idleTimeout: props.renderBatchIdleTimeoutMs ?? mode.renderBatchIdleTimeoutMs,
    },
    afterRender,
  );
  const renderedCount = batching ? Math.min(batch.count, nodes.length) : nodes.length;
  const viewport = useMarkdownViewport({
    enabled:
      !props.renderAsFragment &&
      !virtual &&
      maxLiveNodes > 0 &&
      nodes.length <= 900 &&
      (props.deferNodesUntilVisible ?? mode.deferNodesUntilVisible) &&
      props.viewportPriority !== false,
    sessionKey,
    count: nodes.length,
    initial: initialBatch,
    ...props.viewportPriorityOptions,
  });
  const shouldRender = (index: number) =>
    materialized.current.has(nodeIdentity(index)) ||
    (index < renderedCount &&
      (viewport.shouldRender(index) ||
        (smooth && !final && !inputNodes && index >= nodes.length - liveNodeBuffer)));
  const live = useRef({
    estimateCodeHeight,
    props,
    nodes,
    final,
    virtual,
    maxLiveNodes,
    liveNodeBuffer,
    renderedCount,
    indexPrefix,
    sessionKey,
    measurementKey,
    customParagraph,
    isNodeRendered: (index: number) => mounted && shouldRender(index),
    flush: () => {},
  });
  live.current = {
    estimateCodeHeight,
    props,
    nodes,
    final,
    virtual,
    maxLiveNodes,
    liveNodeBuffer,
    renderedCount,
    indexPrefix,
    sessionKey,
    measurementKey,
    customParagraph,
    isNodeRendered: (index: number) => mounted && shouldRender(index),
    flush: () => {
      stream.flush();
      parsedContent.flush(stream.getSnapshot().visible);
      batch.flush();
    },
  };
  const [controller] = useState(() =>
    createMarkdownVirtualController({
      config: () => ({
        ...live.current.props.virtualScroll,
        ...live.current,
        coordinated: live.current.props.virtualScroll?.enabled === true,
        scrollRoot: resolveScrollRoot(live.current.props.virtualScroll?.scrollRoot),
        textProbeProfile: textProbeProfile.current,
        estimateCodeHeight: live.current.estimateCodeHeight,
      }),
      afterRender,
      notify: render,
      flushPending: () => live.current.flush(),
      heightChange: (metrics) => {
        setWidthBucket(getMarkdownWidthBucket(metrics.width));
        live.current.props.onHeightChange?.(metrics);
      },
      virtualStateChange: (state) => live.current.props.onVirtualStateChange?.(state),
      renderSettled: (metrics) => live.current.props.onRenderSettled?.(metrics),
      renderFinal: (metrics) => live.current.props.onRenderFinal?.(metrics),
      anchorChange: (anchor) => live.current.props.onAnchorChange?.(anchor),
    }),
  );
  const lifecycle = useMemo(
    () => ({
      reportHeight(key: string | number, height: number) {
        controller.reportHeight(key, height);
        parentLifecycle?.reportHeight(key, height);
      },
      markPending(key: string | number) {
        controller.markPending(key);
        parentLifecycle?.markPending(key);
      },
      markSettled(key: string | number) {
        controller.markSettled(key);
        parentLifecycle?.markSettled(key);
      },
    }),
    [controller, parentLifecycle],
  );
  useImperativeHandle(props.ref, () => controller, [controller]);
  const attachRoot = useCallback(
    (element: HTMLDivElement | null) => {
      root.current = element;
      attachEvents(element);
      controller.connect(element);
    },
    [controller, attachEvents],
  );
  useLayoutEffect(() => {
    controller.update();
  }, [
    controller,
    mounted,
    nodes,
    final,
    virtual,
    maxLiveNodes,
    liveNodeBuffer,
    renderedCount,
    viewport.revision,
    sessionKey,
    threadKey,
    props.virtualScroll?.enabled,
    measurementKey,
    props.virtualScroll?.settledToken,
    props.virtualScroll?.settleMode,
    props.virtualScroll?.heightCache,
    props.virtualScroll?.heightCacheWidth,
    customComponents.paragraph,
    estimateCodeHeight,
  ]);
  useLayoutEffect(() => () => controller.dispose(), [controller]);
  useLayoutEffect(() => {
    const state = props.virtualScroll?.restoreState;
    if (state)
      controller.restoreVirtualState(state, {
        restoreAnchor: Boolean(props.virtualScroll?.restoreAnchor),
        restoreToken: props.virtualScroll?.restoreAnchor,
      });
  }, [
    controller,
    props.virtualScroll?.restoreState,
    props.virtualScroll?.restoreAnchor,
    measurementKey,
    sessionKey,
    threadKey,
    nodes.length,
    props.virtualScroll?.enabled,
  ]);
  const textState = useRef(new Map<string, string>());
  const streamVersion = useRef(0);
  const previousNodes = useRef(nodes);
  if (previousNodes.current !== nodes) {
    previousNodes.current = nodes;
    streamVersion.current++;
  }
  const ctx: RenderContext = {
    customId: props.customId,
    isDark,
    final,
    indexKey: indexPrefix,
    typewriter,
    fade: props.fade ?? mode.fade,
    textStreamState: textState.current,
    streamRenderVersion: streamVersion.current,
    customComponents: renderComponents,
    streamingComponents: props.streamingComponents,
    htmlComponents: props.htmlComponents,
    customHtmlTags: customTags,
    htmlPolicy: props.htmlPolicy ?? 'safe',
    showTooltips: props.showTooltips ?? mode.showTooltips,
    renderCodeBlocksAsPre: props.renderCodeBlocksAsPre,
    codeBlockStream: props.codeBlockStream ?? true,
    codeBlockOptions: props.codeBlockOptions,
    codeBlockProps: props.codeBlockProps,
    mermaidProps: props.mermaidProps,
    d2Props: props.d2Props,
    infographicProps: props.infographicProps,
    codeBlockThemes: {
      themes: props.themes,
      darkTheme: props.codeBlockDarkTheme,
      lightTheme: props.codeBlockLightTheme,
      minWidth: props.codeBlockMinWidth,
      maxWidth: props.codeBlockMaxWidth,
    },
    events: {
      onCopy: (code) => {
        props.onCopyCode?.(code);
        props.onCopy?.(code);
      },
      onHandleArtifactClick: props.onHandleArtifactClick,
    },
  };
  const itemRefs = useRef(new Map<number, (element: HTMLDivElement | null) => void>());
  const itemRef = (index: number) => {
    let callback = itemRefs.current.get(index);
    if (!callback) {
      callback = (element) => {
        if (element) viewport.elements.set(index, element);
        else viewport.elements.delete(index);
        controller.setNode(index, element);
      };
      itemRefs.current.set(index, callback);
    }
    return callback;
  };
  const range = controller.getRange();
  useMarkdownEnterFade(viewport.elements, {
    mounted,
    enabled: (props.fade ?? mode.fade) && !props.renderAsFragment,
    appear: requestedFinal !== true,
  });
  const cursor = useMarkdownCursor({
    root,
    source,
    visible,
    final,
    suppliedNodes: inputNodes,
    fragment: props.renderAsFragment === true,
    typewriter: props.typewriter,
    nodes,
    slots: viewport.elements,
    shouldRender,
  });
  const children = nodes.slice(range.start, range.end).map((node, offset) => {
    const index = range.start + offset;
    const key = `${indexPrefix}-${index}`;
    const identity = nodeIdentity(index);
    const content = shouldRender(index)
      ? renderNode(node as Parameters<typeof renderNode>[0], key, ctx)
      : null;
    return props.renderAsFragment ? (
      <Fragment key={identity}>{content}</Fragment>
    ) : (
      <div
        ref={itemRef(index)}
        key={identity}
        className="node-slot"
        data-node-index={index}
        data-node-type={node.type}
      >
        {shouldRender(index) ? (
          <div
            className="node-content"
            ref={(element) => {
              if (element && mounted) materialized.current.add(identity);
              else if (!element) materialized.current.delete(identity);
            }}
          >
            {content}
          </div>
        ) : (
          <div
            className="node-placeholder"
            style={{ height: controller.getPlaceholderHeight(index) }}
          />
        )}
      </div>
    );
  });
  const view = props.renderAsFragment ? (
    <Fragment ref={attachEvents}>{children}</Fragment>
  ) : (
    <div
      {...getMarkdownRootAttributes(props)}
      ref={attachRoot}
      className={[
        'markstream-react',
        'markdown-renderer',
        prefix,
        isDark && 'dark',
        virtual && 'virtualized',
        props.virtualScroll?.enabled && 'virtual-scroll-coordinated',
        cursor.active && cursor.mode === 'simple' && 'typewriter-simple-cursor',
        props.className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={props.style}
      id={props.id}
      data-custom-id={props.customId}
    >
      {mounted && props.virtualScroll?.enabled && (
        <MarkdownHeightProbes
          width={root.current?.clientWidth || 640}
          measurementKey={measurementKey}
          ctx={ctx}
          onProfile={(profile) => {
            textProbeProfile.current = profile;
            controller.update('font');
          }}
        />
      )}
      {virtual && <div className="node-spacer" style={{ height: range.top }} aria-hidden="true" />}
      {children}
      {cursor.active && cursor.mode === 'precise' && (
        <span
          ref={cursor.ref}
          className="typewriter-cursor"
          aria-hidden="true"
          style={{ visibility: 'hidden' }}
        />
      )}
      {virtual && (
        <div className="node-spacer" style={{ height: range.bottom }} aria-hidden="true" />
      )}
    </div>
  );
  return (
    <MarkdownComponentsContext value={customComponents}>
      <MarkdownNestedRendererContext
        value={{
          Renderer: MarkdownRenderer,
          codeContext: ctx,
          props: getMarkdownNestedProps({ ...props, customHtmlTags: customTags, isDark }),
        }}
      >
        <MarkdownNodeLifecycleContext value={lifecycle}>
          <MarkdownCursorOwnerContext value={true}>{view}</MarkdownCursorOwnerContext>
        </MarkdownNodeLifecycleContext>
      </MarkdownNestedRendererContext>
    </MarkdownComponentsContext>
  );
}
