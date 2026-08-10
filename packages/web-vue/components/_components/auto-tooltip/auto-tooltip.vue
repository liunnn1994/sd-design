<template>
  <DefineContent>
    <span ref="containerRef" :class="prefix" v-bind="$attrs">
      <ResizeObserver @resize="onResize">
        <span ref="contentRef" :class="`${prefix}-content`">
          <slot />
        </span>
      </ResizeObserver>
    </span>
  </DefineContent>
  <Tooltip v-if="showTooltip" v-bind="{ content: text, ...tooltipProps }">
    <ReuseContent />
  </Tooltip>
  <ResizeObserver v-else @resize="onResize">
    <ReuseContent />
  </ResizeObserver>
</template>

<script setup lang="ts">
  import type { VNode } from 'vue';
  import { onMounted, onUpdated, ref } from 'vue';

  import { createReusableTemplate } from '@vueuse/core';

  import type { TooltipProps } from '../../tooltip/interface';

  import { getPrefixCls } from '../../_utils/global-config';
  import Tooltip from '../../tooltip';
  import ResizeObserver from '../resize-observer-v2';

  defineOptions({ name: 'AutoTooltip', inheritAttrs: false });

  defineProps<{
    tooltipProps?: TooltipProps;
  }>();
  defineSlots<{
    default?: () => VNode[];
  }>();

  const [DefineContent, ReuseContent] = createReusableTemplate();
  const prefix = getPrefixCls('auto-tooltip');
  const containerRef = ref<HTMLElement | null>(null);
  const contentRef = ref<HTMLElement | null>(null);
  const text = ref('');
  const showTooltip = ref(false);
  const calculateTooltip = () => {
    if (containerRef.value && contentRef.value) {
      const shouldShow = contentRef.value.offsetWidth > containerRef.value.offsetWidth;
      if (shouldShow !== showTooltip.value) {
        showTooltip.value = shouldShow;
      }
    }
  };
  const updateText = () => {
    if (contentRef.value?.textContent && contentRef.value.textContent !== text.value) {
      text.value = contentRef.value.textContent;
    }
  };
  const onResize = () => {
    updateText();
    calculateTooltip();
  };

  onMounted(onResize);
  onUpdated(onResize);
</script>
