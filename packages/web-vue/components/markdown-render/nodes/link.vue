<template>
  <span
    v-if="node.loading"
    v-bind="nodeEvents"
    :class="`${prefixCls}-loading`"
    :style="loadingStyle"
    aria-busy="true"
  >
    {{ node.text }}<span :class="`${prefixCls}-loading-indicator`" aria-hidden="true" />
  </span>
  <Tooltip v-else :content="node.title || href || ''" :disabled="!showTooltip">
    <Link
      v-bind="{ ...linkAttrs, ...nodeEvents }"
      :href="href"
      :target="target"
      :rel="rel"
      :title="showTooltip ? undefined : (node.title ?? undefined)"
      :ellipsis="false"
      :style="color ? { color } : undefined"
    >
      <Children :nodes="node.children" :custom-id="customId" :index-key="indexKey" />
    </Link>
  </Tooltip>
</template>
<script setup lang="ts">
  import type { LinkNodeProps } from 'markstream-vue';

  import { computed, toRefs, useAttrs } from 'vue';

  import { getMarkdownLinkData, getMarkdownLinkLoadingStyle } from '@sdata/web-core/markdown/link';

  import { getPrefixCls } from '../../_utils/global-config';
  import Link from '../../link';
  import Tooltip from '../../tooltip';
  import Children from './children.vue';
  import { useNodeEvents } from './use-node-events';

  defineOptions({ inheritAttrs: false });
  const props = withDefaults(defineProps<LinkNodeProps>(), { showTooltip: true });
  const { node, showTooltip, color } = toRefs(props);
  const nodeEvents = useNodeEvents();
  const prefixCls = getPrefixCls('markdown-render-link');
  const loadingStyle = computed(() => getMarkdownLinkLoadingStyle(props));
  const attrs = useAttrs();
  const data = computed(() =>
    getMarkdownLinkData(
      props.node,
      Object.fromEntries(
        Object.entries(attrs).filter(
          (entry): entry is [string, string] => typeof entry[1] === 'string',
        ),
      ),
    ),
  );
  const linkAttrs = computed(() => data.value.attrs);
  const href = computed(() => data.value.href);
  const target = computed(() => data.value.target);
  const rel = computed(() => data.value.rel);
</script>
