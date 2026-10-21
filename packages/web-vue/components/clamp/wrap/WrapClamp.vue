<script setup lang="ts" generic="T = unknown">
  // Derived from vue-clamp v1.7.2, Copyright (c) 2018-present GU Yiling. MIT; see THIRD_PARTY_NOTICES.md.
  import {
    computed,
    nextTick,
    onMounted,
    onUpdated,
    shallowRef,
    useAttrs,
    watch,
    watchPostEffect,
  } from 'vue';
  import type { VNodeChild } from 'vue';

  import { createClampControls } from '@sdata/web-core/clamp/controls';
  import {
    cssLength,
    hasBorderBoxEntrySignatureChange,
    listenForFontLoads,
    normalizeLineLimit,
    observeMeasuredBorderBoxSizes,
  } from '@sdata/web-core/clamp/layout';
  import { createWrapClampFoundation } from '@sdata/web-core/clamp/wrap/foundation';

  import type { ClampEmits } from '../types';
  import type {
    WrapClampExposed,
    WrapClampProps,
    WrapClampSlotProps,
    WrapClampSlots,
  } from './types';

  import { renderRoot } from './render';

  defineOptions({
    name: 'WrapClamp',
    inheritAttrs: false,
  });

  const {
    as: rootTag = 'div',
    items = [],
    itemKey,
    maxLines,
    maxHeight,
  } = defineProps<Omit<WrapClampProps<T>, 'expanded'>>();
  const expanded = defineModel<NonNullable<WrapClampProps<T>['expanded']>>('expanded', {
    default: false,
  });
  const emit = defineEmits<Omit<ClampEmits, 'update:expanded'>>();
  const slots = defineSlots<WrapClampSlots<T>>();
  const attrs = useAttrs();
  const { expand, collapse, toggle } = createClampControls(expanded);

  const rootRef = shallowRef<HTMLElement | null>(null);
  const contentRef = shallowRef<HTMLElement | null>(null);
  const beforeRef = shallowRef<HTMLElement | null>(null);
  const afterRef = shallowRef<HTMLElement | null>(null);
  const visibleCount = shallowRef(items.length);
  const materializedCount = shallowRef(0);
  const isClamped = shallowRef(false);
  const hasActiveClamp = computed(
    () =>
      !expanded.value &&
      items.length > 0 &&
      (normalizeLineLimit(maxLines) !== undefined || maxHeight !== undefined),
  );

  const foundation = createWrapClampFoundation({
    get items() {
      return items;
    },
    get maxLines() {
      return maxLines;
    },
    get maxHeight() {
      return maxHeight;
    },
    get slots() {
      return slots;
    },
    state: {
      expanded,
      rootRef,
      contentRef,
      beforeRef,
      afterRef,
      visibleCount,
      materializedCount,
      isClamped,
    },
    afterRender: nextTick,
  });
  const { requestRecompute, layoutSignature, lastObservedSignature } = foundation;

  // The setup-local functional view renders directly without a wrapper element;
  // `renderRoot` owns the root/content/item structure so there is no authored
  // template to keep in sync.
  function render(): VNodeChild {
    const visibleItemCount = Math.min(visibleCount.value, items.length);
    const renderedItemCount = Math.min(
      items.length,
      Math.max(visibleItemCount, materializedCount.value),
    );
    const expandedValue = expanded.value;
    const affixSlotProps: WrapClampSlotProps<T> | undefined =
      slots.before === undefined && slots.after === undefined
        ? undefined
        : {
            expand,
            collapse,
            toggle,
            clamped: visibleItemCount < items.length,
            expanded: expandedValue,
            hiddenItems: items.slice(visibleItemCount),
          };

    return renderRoot({
      affixSlotProps,
      afterRef,
      afterSlot: slots.after,
      attrs,
      beforeRef,
      beforeSlot: slots.before,
      contentRef,
      itemKey,
      itemSlot: slots.item,
      items,
      renderedItemCount,
      rootRef,
      rootStyle: {
        maxHeight: !expandedValue ? cssLength(maxHeight) : undefined,
        overflow: 'hidden',
      },
      rootTag,
      visibleItemCount,
    });
  }

  const Render = () => render();

  watch(
    expanded,
    () => {
      requestRecompute();
    },
    { flush: 'post' },
  );

  watch(
    [() => maxLines, () => maxHeight, () => itemKey, () => items, () => items.length],
    () => {
      foundation.resetMeasurements();
      requestRecompute();
    },
    { flush: 'post' },
  );

  watch(
    isClamped,
    (value) => {
      emit('clampchange', value);
    },
    { flush: 'post', immediate: true },
  );

  watchPostEffect((onCleanup) => {
    if (!hasActiveClamp.value) {
      return;
    }

    // Starting these async solvers together batches their Vue count updates.
    // Direct item-shell searches remain synchronous and are not text-batch peers.
    const stopObserving = observeMeasuredBorderBoxSizes(
      [rootRef.value, contentRef.value, beforeRef.value, afterRef.value].filter(
        (element): element is HTMLElement => element instanceof HTMLElement,
      ),
      (entries) => {
        if (hasBorderBoxEntrySignatureChange(entries, lastObservedSignature)) {
          // Slot boxes are part of the wrap sequence, so their size changes must
          // invalidate the item count even when the item array is unchanged.
          requestRecompute();
        }
      },
      false,
    );

    onCleanup(stopObserving);
  });

  watchPostEffect((onCleanup) => {
    if (hasActiveClamp.value) {
      onCleanup(
        listenForFontLoads(() => {
          foundation.resetMeasurements();
          requestRecompute();
        }),
      );
    }
  });

  onMounted(() => {
    if (hasActiveClamp.value) {
      requestRecompute();
    }
  });

  onUpdated(() => {
    if (foundation.isRecomputing || !hasActiveClamp.value) {
      return;
    }

    if (layoutSignature(false) === foundation.lastLayoutSignature) {
      foundation.resetMeasurements();
      requestRecompute();
    }
  });

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
  } satisfies WrapClampExposed);
</script>

<template><Render /></template>
