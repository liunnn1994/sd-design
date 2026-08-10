<template>
  <div :class="prefixCls">
    <div v-if="hasTitle || hasDescription" :class="`${prefixCls}-content`">
      <div v-if="hasTitle" :class="`${prefixCls}-title`">
        <slot v-if="$slots.title" name="title" />
        <template v-else>{{ title }}</template>
      </div>
      <div v-if="hasDescription" :class="`${prefixCls}-description`">
        <slot v-if="$slots.description" name="description" />
        <template v-else>{{ description }}</template>
      </div>
    </div>
    <div
      v-if="$slots.avatar || context?.slots.actions"
      :class="[
        `${prefixCls}-footer`,
        {
          [`${prefixCls}-footer-only-actions`]: !$slots.avatar,
        },
      ]"
    >
      <div v-if="$slots.avatar" :class="`${prefixCls}-avatar`">
        <slot name="avatar" />
      </div>
      <RenderActions />
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { VNode } from 'vue';
  import { computed, inject, onMounted } from 'vue';

  import { getPrefixCls } from '../_utils/global-config';
  import { cardInjectionKey } from './context';

  defineOptions({ name: 'CardMeta' });

  const props = defineProps<{
    /**
     * @zh 标题
     * @en Title of card
     */
    title?: string;
    /**
     * @zh 描述
     * @en Description of card
     */
    description?: string;
  }>();

  const slots = defineSlots<{
    /**
     * @zh 头像
     * @en Avatar of card
     */
    avatar?: () => VNode[];
    /**
     * @zh 标题
     * @en Title of card
     */
    title?: () => VNode[];
    /**
     * @zh 描述
     * @en Description of card
     */
    description?: () => VNode[];
  }>();

  const prefixCls = getPrefixCls('card-meta');
  const context = inject(cardInjectionKey, undefined);
  const hasTitle = computed(() => Boolean(slots.title ?? props.title));
  const hasDescription = computed(() => Boolean(slots.description ?? props.description));
  const RenderActions = () => {
    if (context?.slots.actions) {
      return context.renderActions(context.slots.actions());
    }
    return null;
  };

  onMounted(() => {
    if (context) {
      context.hasMeta = true;
    }
  });
</script>

<script lang="ts">
  export const SIZES = ['default', 'small'] as const;
  export type SizeType = (typeof SIZES)[number];
</script>
