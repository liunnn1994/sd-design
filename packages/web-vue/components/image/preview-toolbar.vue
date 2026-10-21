<template>
  <div :class="prefixCls">
    <PreviewAction
      v-for="action in resultActions"
      :key="action.key"
      :name="action.name"
      :disabled="action.disabled"
      @click="action.onClick"
    >
      <component :is="action.content" />
    </PreviewAction>
    <slot />
  </div>
</template>
<script setup lang="ts">
  import type { Component, PropType } from 'vue';
  import { computed, toRefs } from 'vue';

  import { getPreviewActions } from '@sdata/web-core/image/foundation';

  import { getPrefixCls } from '../_utils/global-config';
  import PreviewAction from './preview-action.vue';

  export interface ActionType {
    key: string;
    name: string;
    content: Component;
    onClick: () => void;
    disabled?: boolean;
  }

  defineOptions({ name: 'ImagePreviewToolbar' });

  const props = defineProps({
    actions: {
      type: Array as PropType<ActionType[]>,
      default: () => [],
    },
    /** 控制条的布局 */
    actionsLayout: {
      type: Array as PropType<string[]>,
      default: () => [],
    },
  });

  const { actions, actionsLayout } = toRefs(props);

  const prefixCls = getPrefixCls('image-preview-toolbar');

  const resultActions = computed(() => getPreviewActions(actions.value, actionsLayout.value));
</script>
