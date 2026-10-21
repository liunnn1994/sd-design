<script setup lang="ts">
  import type { NativeClampMode } from '@sdata/web-core/clamp/native';
  // Derived from vue-clamp v1.7.2, Copyright (c) 2018-present GU Yiling. MIT; see THIRD_PARTY_NOTICES.md.

  import { computed, h, mergeProps, nextTick, shallowRef, useAttrs, watch, withMemo } from 'vue';
  import type { CSSProperties, VNode, VNodeChild } from 'vue';

  import { trueOrUndefined } from '@sdata/web-core/clamp/attributes';
  import {
    cssLength,
    normalizeLineLimit,
    observeBorderBoxSizes,
    observeMeasuredBorderBoxSizes,
  } from '@sdata/web-core/clamp/layout';
  import { createLineClampFoundation } from '@sdata/web-core/clamp/line/foundation';
  import {
    multilineNativeSlotStyle,
    multilineSlotStyle,
  } from '@sdata/web-core/clamp/multiline-styles';
  import {
    getNativeContentStyle,
    nativeBodyStyle,
    nativeTextStyle,
  } from '@sdata/web-core/clamp/native';
  import { visuallyHiddenTextStyle } from '@sdata/web-core/clamp/styles';
  import { normalizeLocationRatio, prepareSharedText } from '@sdata/web-core/clamp/text';

  import type { ClampEmits } from '../types';
  import type { LineClampExposed, LineClampProps, LineClampSlots } from './types';

  import { measureLayout } from '../measure';
  import { useMultilineClamp } from '../multiline';
  import { renderMultilineAffixSlot } from '../multiline-render';

  defineOptions({
    name: 'LineClamp',
    inheritAttrs: false,
  });

  const {
    as: rootTag = 'div',
    text = '',
    maxLines,
    maxHeight,
    ellipsis = '…',
    location = 'end',
    boundary = 'grapheme',
  } = defineProps<Omit<LineClampProps, 'expanded'>>();
  const expanded = defineModel<NonNullable<LineClampProps['expanded']>>('expanded', {
    default: false,
  });
  const emit = defineEmits<Omit<ClampEmits, 'update:expanded'>>();
  const slots = defineSlots<LineClampSlots>();
  const attrs = useAttrs();

  const textRef = shallowRef<HTMLElement | null>(null);
  // Search writes the final text into the live node; the shallow snapshot only
  // triggers Vue when the rendered structure must change.
  const visibleText = shallowRef({ text });
  const multilineBodyStyle: CSSProperties = { position: 'relative' };
  const overflowHiddenRootStyle: CSSProperties = { overflow: 'hidden' };
  const lineLimit = computed(() => normalizeLineLimit(maxLines));
  const preparedText = computed(() => prepareSharedText(text, boundary));
  const hasActiveClamp = computed(
    () =>
      !expanded.value &&
      text.length > 0 &&
      (lineLimit.value !== undefined || maxHeight !== undefined),
  );

  const {
    rootRef,
    contentRef,
    beforeRef,
    bodyRef,
    afterRef,
    isClamped,
    expand,
    collapse,
    toggle,
    observedSizeSnapshot,
    affixSlotProps,
    setBeforeElement,
    setAfterElement,
    requestRecompute,
  } = useMultilineClamp({
    active: hasActiveClamp,
    observeSizes: (elements, listener) => {
      const serial =
        getNativeMode(
          afterRef.value !== null,
          lineLimit.value,
          normalizeLocationRatio(location),
        ) !== null;
      return (serial ? observeBorderBoxSizes : observeMeasuredBorderBoxSizes)(elements, listener);
    },
    expanded,
    onFontLoad: () => foundation.onFontLoad(),
    onClampedChange: (value) => {
      emit('clampchange', value);
    },
    recompute: (expanded, rootWidthSnapshot) => foundation.recompute(expanded, rootWidthSnapshot),
  });

  const foundation = createLineClampFoundation({
    get text() {
      return text;
    },
    get location() {
      return location;
    },
    get maxHeight() {
      return maxHeight;
    },
    get boundary() {
      return boundary;
    },
    get ellipsis() {
      return ellipsis;
    },
    state: {
      expanded,
      rootRef,
      contentRef,
      beforeRef,
      afterRef,
      isClamped,
      hasActiveClamp,
      textRef,
      visibleText,
      lineLimit,
      preparedText,
    },
    measureLayout,
    afterRender: nextTick,
    observedSizeSnapshot,
  });
  const { getNativeMode, resetTextClampHint, hasClampLimit } = foundation;

  function renderAffixSlot(part: 'before' | 'after', slotStyle: CSSProperties): VNodeChild | null {
    const slot = part === 'before' ? slots.before : slots.after;
    if (!slot) {
      return null;
    }

    return renderMultilineAffixSlot({
      part,
      render: slot,
      setRef: part === 'before' ? setBeforeElement : setAfterElement,
      slotProps: affixSlotProps(),
      slotStyle,
    });
  }

  function renderBody(
    renderedText: string,
    sourceIsHidden: boolean,
    nativeMode: NativeClampMode | null,
    renderCache: VNode[],
  ): VNodeChild {
    // Width-only updates often keep the same text and attributes. Reuse this
    // internal leaf without caching body layout or consumer-owned slot output.
    // Vue owns the cache and clears it when the leaf is unmounted.
    const textNode = withMemo(
      [renderedText, sourceIsHidden, nativeMode],
      () =>
        h(
          'span',
          {
            'aria-hidden': trueOrUndefined(sourceIsHidden),
            'key': 'text',
            'ref': textRef,
            'style': nativeMode === 'single-line' ? nativeTextStyle : undefined,
          },
          [renderedText],
        ),
      renderCache,
      0,
    );

    return h(
      'span',
      {
        'data-part': 'body',
        'ref': bodyRef,
        'style': nativeMode === 'single-line' ? nativeBodyStyle : multilineBodyStyle,
      },
      sourceIsHidden ? [h('span', { style: visuallyHiddenTextStyle }, text), textNode] : textNode,
    );
  }

  function render(_context: unknown, renderCache: VNode[]): VNodeChild {
    // Use the rendered after wrapper rather than `slots.after`: filtered or
    // dynamic slots can be declared while producing no DOM, and native clamp
    // remains valid.
    const currentText = visibleText.value.text;
    const lineLimitValue = lineLimit.value;
    const locationRatio = normalizeLocationRatio(location);
    const nativeMode = getNativeMode(afterRef.value !== null, lineLimitValue, locationRatio);
    const slotStyle = nativeMode === 'single-line' ? multilineNativeSlotStyle : multilineSlotStyle;
    const hasLimit = hasClampLimit(lineLimitValue);
    const sourceIsHidden = !nativeMode && hasLimit && !expanded.value && currentText !== text;
    const rendersSourceText = nativeMode || expanded.value || currentText.length === 0 || !hasLimit;
    const renderedText = rendersSourceText ? text : currentText;
    const collapsedMaxHeight = !expanded.value ? cssLength(maxHeight) : undefined;
    const rootStyle =
      collapsedMaxHeight === undefined
        ? overflowHiddenRootStyle
        : { maxHeight: collapsedMaxHeight, overflow: 'hidden' };
    const children: VNodeChild[] = [];
    const beforeSlot = renderAffixSlot('before', slotStyle);
    if (beforeSlot) {
      children.push(beforeSlot);
    }

    children.push(renderBody(renderedText, sourceIsHidden, nativeMode, renderCache));

    const afterSlot = renderAffixSlot('after', slotStyle);
    if (afterSlot) {
      children.push(afterSlot);
    }

    const content = h(
      'span',
      {
        'data-part': 'content',
        'ref': contentRef,
        'style': getNativeContentStyle(nativeMode, lineLimitValue),
      },
      children,
    );

    return h(
      rootTag,
      mergeProps(attrs, {
        'data-part': 'root',
        'ref': rootRef,
        'style': rootStyle,
      }),
      content,
    );
  }

  const renderCache: VNode[] = [];
  const Render = () => render(undefined, renderCache);

  watch(
    [() => text, () => maxLines, () => maxHeight, () => ellipsis, () => location, () => boundary],
    () => {
      // Any semantic prop change invalidates the previous kept-count hint.
      resetTextClampHint();
      // Commit only the solved state. A temporary full-source state would schedule
      // another Vue render even when the hidden-source structure stays unchanged.
      requestRecompute();
    },
    { flush: 'post' },
  );

  defineExpose({
    expand,
    collapse,
    toggle,
    get clamped() {
      return isClamped.value;
    },
    get expanded() {
      return expanded.value;
    },
  } satisfies LineClampExposed);
</script>

<template><Render /></template>
