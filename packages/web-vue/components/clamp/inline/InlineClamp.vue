<script setup lang="ts">
  import type { InlineClampProps } from '@sdata/web-core/clamp/inline/types';
  // Derived from vue-clamp v1.7.2, Copyright (c) 2018-present GU Yiling. MIT; see THIRD_PARTY_NOTICES.md.

  import {
    computed,
    onBeforeUnmount,
    onMounted,
    onUpdated,
    shallowRef,
    useTemplateRef,
    watch,
    watchPostEffect,
  } from 'vue';

  import { trueOrUndefined } from '@sdata/web-core/clamp/attributes';
  import { createInlineClampFoundation } from '@sdata/web-core/clamp/inline/foundation';
  import { inlineClampRootStyle } from '@sdata/web-core/clamp/inline/styles';
  import { nativeTextStyle, resolveNativeMode } from '@sdata/web-core/clamp/native';
  import { visuallyHiddenTextStyle } from '@sdata/web-core/clamp/styles';
  import { normalizeLocationRatio, prepareSharedText } from '@sdata/web-core/clamp/text';

  import { measureLayout } from '../measure';
  defineOptions({
    name: 'InlineClamp',
    inheritAttrs: false,
  });

  const {
    as: rootTag = 'span',
    text,
    ellipsis = '…',
    location = 'end',
    boundary = 'grapheme',
    split,
  } = defineProps<InlineClampProps>();

  const rootRef = useTemplateRef<HTMLElement>('root');
  const bodyRef = useTemplateRef('body');
  const parts = computed(() => split?.(text) ?? { body: text });
  const preparedBody = computed(() => prepareSharedText(parts.value.body, boundary));
  const usesNativeClamp = computed(
    () =>
      split === undefined &&
      resolveNativeMode({
        boundary,
        ellipsis,
        expanded: false,
        hasAfterSlot: false,
        lineLimit: 1,
        locationRatio: normalizeLocationRatio(location),
        maxHeight: undefined,
      }) === 'single-line',
  );
  const hasActiveClamp = computed(() => !usesNativeClamp.value && parts.value.body.length > 0);
  // Search writes the final candidate into the live body node; this snapshot
  // only triggers Vue when the accessibility structure must change.
  const visibleBody = shallowRef({ text: parts.value.body });
  const isRewritten = computed(
    () => !usesNativeClamp.value && visibleBody.value.text !== parts.value.body,
  );

  const foundation = createInlineClampFoundation({
    get split() {
      return split;
    },
    get location() {
      return location;
    },
    get ellipsis() {
      return ellipsis;
    },
    state: { rootRef, bodyRef, parts, preparedBody, hasActiveClamp, usesNativeClamp, visibleBody },
    measureLayout,
  });

  watch([parts, () => ellipsis, () => location, () => boundary], foundation.semanticChanged, {
    flush: 'post',
  });

  watchPostEffect((onCleanup) => {
    const stop = foundation.observe();
    if (stop) onCleanup(stop);
  });
  onMounted(foundation.mount);
  onUpdated(foundation.updated);
  onBeforeUnmount(foundation.dispose);
</script>

<template>
  <component
    :is="rootTag"
    v-bind="$attrs"
    data-part="root"
    ref="root"
    :style="inlineClampRootStyle"
  >
    <span v-if="isRewritten" :style="visuallyHiddenTextStyle">
      {{ text }}
    </span>

    <span v-if="parts.start" :aria-hidden="trueOrUndefined(isRewritten)" data-part="start">
      {{ parts.start }}
    </span>

    <span
      ref="body"
      :aria-hidden="trueOrUndefined(isRewritten)"
      data-part="body"
      :style="usesNativeClamp ? nativeTextStyle : undefined"
    >
      {{ usesNativeClamp ? parts.body : visibleBody.text }}
    </span>

    <span v-if="parts.end" :aria-hidden="trueOrUndefined(isRewritten)" data-part="end">
      {{ parts.end }}
    </span>
  </component>
</template>
