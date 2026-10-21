<script setup lang="ts">
  import type { NativeClampMode } from '@sdata/web-core/clamp/native';
  // Derived from vue-clamp v1.7.2, Copyright (c) 2018-present GU Yiling. MIT; see THIRD_PARTY_NOTICES.md.

  import { computed, h, mergeProps, nextTick, shallowRef, useAttrs, watch } from 'vue';
  import type { VNodeChild } from 'vue';

  import {
    cssLength,
    normalizeLineLimit,
    observeBorderBoxSizes,
    observeMeasuredBorderBoxSizes,
  } from '@sdata/web-core/clamp/layout';
  import {
    multilineNativeSlotStyle,
    multilineSlotStyle,
  } from '@sdata/web-core/clamp/multiline-styles';
  import {
    getNativeContentStyle,
    nativeBodyStyle,
    nativeTextStyle,
  } from '@sdata/web-core/clamp/native';
  import { createRichLineClampFoundation } from '@sdata/web-core/clamp/rich-line/foundation';
  import { prepareSharedRich } from '@sdata/web-core/clamp/rich-line/preparation';
  import { richProbeStyle } from '@sdata/web-core/clamp/rich-line/styles';

  import type { ClampEmits } from '../types';
  import type { RichLineClampExposed, RichLineClampProps, RichLineClampSlots } from './types';

  import { measureLayout } from '../measure';
  import { useMultilineClamp } from '../multiline';
  import { renderMultilineAffixSlot } from '../multiline-render';

  const nativeRichBodyStyle = {
    ...nativeBodyStyle,
    ...nativeTextStyle,
  };

  defineOptions({
    name: 'RichLineClamp',
    inheritAttrs: false,
  });

  const {
    as: rootTag = 'div',
    html,
    maxLines,
    maxHeight,
    ellipsis = '…',
    boundary = 'grapheme',
  } = defineProps<Omit<RichLineClampProps, 'expanded'>>();
  const expanded = defineModel<NonNullable<RichLineClampProps['expanded']>>('expanded', {
    default: false,
  });
  const emit = defineEmits<Omit<ClampEmits, 'update:expanded'>>();
  const slots = defineSlots<RichLineClampSlots>();
  const attrs = useAttrs();

  const probeRef = shallowRef<HTMLElement | null>(null);
  const isFallback = shallowRef(false);

  // The visible tree and hidden probe advance independently. measuredState is both
  // the latest warm hint and the hidden body's patch origin.
  const preparedHtml = computed(() => prepareSharedRich(html, boundary));
  const hasActiveClamp = computed(
    () =>
      !expanded.value &&
      html.length > 0 &&
      (normalizeLineLimit(maxLines) !== undefined || maxHeight !== undefined),
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
      if (getNativeMode(normalizeLineLimit(maxLines)) !== null)
        return observeBorderBoxSizes(elements, listener);
      return observeMeasuredBorderBoxSizes(elements, listener, ellipsis.length > 0);
    },
    expanded,
    onClampedChange: (value) => {
      emit('clampchange', value);
    },
    syncAffixSignaturesOnRootChange: true,
    recompute: (expanded, rootWidthSnapshot) => foundation.recompute(expanded, rootWidthSnapshot),
  });

  const foundation = createRichLineClampFoundation({
    get html() {
      return html;
    },
    get maxLines() {
      return maxLines;
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
      bodyRef,
      afterRef,
      isClamped,
      hasActiveClamp,
      preparedHtml,
      probeRef,
      isFallback,
    },
    measureLayout,
    afterRender: nextTick,
    observedSizeSnapshot,
  });
  const { getNativeMode } = foundation;

  function renderAffixSlot(
    part: 'before' | 'after',
    nativeMode: NativeClampMode | null,
  ): VNodeChild | null {
    const slot = part === 'before' ? slots.before : slots.after;
    if (!slot) {
      return null;
    }

    return renderMultilineAffixSlot({
      part,
      render: slot,
      setRef: part === 'before' ? setBeforeElement : setAfterElement,
      slotProps: affixSlotProps(),
      slotStyle: nativeMode === 'single-line' ? multilineNativeSlotStyle : multilineSlotStyle,
    });
  }

  function render(): VNodeChild {
    const lineLimit = normalizeLineLimit(maxLines);
    const nativeMode = getNativeMode(lineLimit);
    const collapsedMaxHeight =
      !expanded.value && !isFallback.value ? cssLength(maxHeight) : undefined;
    const rootStyle =
      collapsedMaxHeight === undefined
        ? undefined
        : {
            maxHeight: collapsedMaxHeight,
            overflow: 'hidden',
          };
    const children: VNodeChild[] = [];
    const beforeSlot = renderAffixSlot('before', nativeMode);
    if (beforeSlot) {
      children.push(beforeSlot);
    }

    children.push(
      h('span', {
        'data-part': 'body',
        'innerHTML': html,
        'ref': bodyRef,
        'style': nativeMode === 'single-line' ? nativeRichBodyStyle : undefined,
      }),
    );

    const afterSlot = renderAffixSlot('after', nativeMode);
    if (afterSlot) {
      children.push(afterSlot);
    }

    const rootChildren: VNodeChild[] = [
      h(
        'span',
        {
          'data-part': 'content',
          'ref': contentRef,
          'style': getNativeContentStyle(nativeMode, lineLimit),
        },
        children,
      ),
    ];

    if (!nativeMode) {
      rootChildren.push(
        h('span', {
          'aria-hidden': 'true',
          'inert': true,
          'ref': probeRef,
          'style': richProbeStyle,
        }),
      );
    }

    return h(
      rootTag,
      mergeProps(attrs, {
        'data-part': 'root',
        'ref': rootRef,
        'style': rootStyle,
      }),
      rootChildren,
    );
  }

  const Render = () => render();

  watch(
    [() => html, () => maxLines, () => maxHeight, () => ellipsis, () => boundary],
    ([nextHtml], [previousHtml]) => {
      foundation.resetSource(nextHtml !== previousHtml);
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
  } satisfies RichLineClampExposed);
</script>

<template><Render /></template>
