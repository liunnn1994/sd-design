<template>
  <div :class="`${prefixCls}-actions`">
    <div :class="`${prefixCls}-actions-right`">
      <span
        v-for="(action, index) in getAllElements(actions)"
        :key="`action-${index}`"
        :class="`${prefixCls}-actions-item`"
      >
        <VNodeRenderer :content="action" />
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { VNode } from 'vue';

  import { getPrefixCls } from '../_utils/global-config';
  import { getAllElements } from '../_utils/vue-utils';

  defineOptions({ name: 'CardActions' });

  defineProps<{
    actions: VNode[];
  }>();

  const VNodeRenderer = ({ content }: { content: VNode }) => content;
  const prefixCls = getPrefixCls('card');
</script>
