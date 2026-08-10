<template>
  <DefineContent>
    <div
      :class="[
        prefixCls,
        {
          [`${prefixCls}-disabled`]: disabled,
        },
      ]"
      v-bind="$attrs"
      @mousedown="onMouseDown"
    >
      <span :class="`${prefixCls}-content`"><slot /></span>
    </div>
  </DefineContent>

  <template v-if="hasContent()">
    <Tooltip v-if="name" :class="`${prefixCls}-tooltip`" :content="name">
      <ReuseContent />
    </Tooltip>
    <ReuseContent v-else />
  </template>
</template>

<script setup lang="ts">
  import { useSlots } from 'vue';

  import { createReusableTemplate } from '@vueuse/core';

  import { getPrefixCls } from '../_utils/global-config';
  import Tooltip from '../tooltip';

  /**
   * @version 2.17.0
   */
  defineOptions({
    name: 'ImagePreviewAction',
    inheritAttrs: false,
  });

  defineProps({
    /**
     * @zh 名称
     * @en the name of the action
     */
    name: {
      type: String,
    },
    /**
     * @zh 是否禁用
     * @en Whether to disable the action
     */
    disabled: {
      type: Boolean,
    },
  });

  const slots = useSlots();
  const prefixCls = getPrefixCls('image-preview-toolbar-action');
  const [DefineContent, ReuseContent] = createReusableTemplate();

  const hasContent = () => Boolean(slots.default?.().length);
  const onMouseDown = (event: MouseEvent) => {
    /** 解决快速点击按钮的情况下 tooltip 被选中 */
    event.preventDefault();
  };
</script>
