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

  import { computed, useAttrs } from 'vue';

  import { sanitizeHtmlAttrs, shouldOpenLinkInNewTab } from 'markstream-vue';

  import { getPrefixCls } from '../../_utils/global-config';
  import Link from '../../link';
  import Tooltip from '../../tooltip';
  import Children from './children.vue';
  import { useNodeEvents } from './use-node-events';
  defineOptions({ inheritAttrs: false });
  const nodeEvents = useNodeEvents();
  const {
    node,
    showTooltip = true,
    color,
    underlineHeight = 2,
    underlineBottom = -3,
    animationDuration = 1.6,
    animationOpacity = 0.35,
    animationTiming = 'ease-in-out',
    animationIteration = 'infinite',
  } = defineProps<LinkNodeProps>();
  const prefixCls = getPrefixCls('markdown-render-link');
  const loadingStyle = computed(() => ({
    color,
    '--sd-markdown-link-underline-height': `${underlineHeight}px`,
    '--sd-markdown-link-underline-bottom':
      typeof underlineBottom === 'number' ? `${underlineBottom}px` : underlineBottom,
    '--sd-markdown-link-opacity': String(animationOpacity),
    '--sd-markdown-link-rest-opacity': String(
      Math.max(0.12, Math.min(animationOpacity * 0.5, animationOpacity)),
    ),
    '--sd-markdown-link-duration': `${animationDuration}s`,
    '--sd-markdown-link-timing': animationTiming,
    '--sd-markdown-link-iteration': String(animationIteration),
  }));
  const attrs = useAttrs();
  const linkAttrs = computed(() =>
    sanitizeHtmlAttrs(
      {
        ...Object.fromEntries(
          Object.entries(attrs).filter(
            (entry): entry is [string, string] => typeof entry[1] === 'string',
          ),
        ),
        ...Object.fromEntries(node.attrs ?? []),
      },
      'safe',
      'a',
    ),
  );
  const href = computed(() => sanitizeHtmlAttrs({ href: node.href }, 'safe', 'a').href);
  const target = computed(
    () =>
      linkAttrs.value.target ||
      (href.value && shouldOpenLinkInNewTab(href.value) ? '_blank' : undefined),
  );
  const rel = computed(() => {
    const tokens = new Set(
      (linkAttrs.value.rel ?? '')
        .split(/\s+/)
        .filter((token) => token && token.toLowerCase() !== 'opener'),
    );
    if (target.value === '_blank') {
      tokens.add('noopener');
      tokens.add('noreferrer');
    }
    return [...tokens].join(' ') || undefined;
  });
</script>
