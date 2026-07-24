<template>
  <Trigger
    :class="prefixCls"
    trigger="hover"
    :position="position"
    :popup-visible="computedPopupVisible"
    :disabled="disabled"
    :popup-offset="10"
    show-arrow
    :content-class="contentCls"
    :content-style="computedContentStyle"
    :arrow-class="arrowCls"
    :arrow-style="computedArrowStyle"
    :popup-container="popupContainer"
    :floating-options="floatingOptions"
    animation-name="zoom-in-fade-out"
    auto-fit-transform-origin
    role="tooltip"
    aria-describedby-popup
    @popup-visible-change="handlePopupVisibleChange"
  >
    <slot />
    <template #content>
      <slot name="content">{{ content }}</slot>
    </template>
  </Trigger>
</template>

<script setup lang="ts">
  import { computed, CSSProperties, ref } from 'vue';

  import type { TooltipProps } from './interface';

  import { getPrefixCls } from '../_utils/global-config';
  import Trigger from '../trigger';

  defineOptions({ name: 'Tooltip' });

  const props = withDefaults(defineProps<TooltipProps>(), {
    popupVisible: undefined,
    defaultPopupVisible: false,
    disabled: false,
    position: 'top',
    mini: false,
  });

  const emit = defineEmits<{
    'update:popupVisible': [_visible: boolean];
    /**
     * @zh 文字气泡显示状态改变时触发
     * @en Emitted when the tooltip display status changes
     * @param {boolean} visible
     */
    'popupVisibleChange': [_visible: boolean];
  }>();
  /**
   * @zh 内容
   * @en Content
   * @slot content
   */

  const prefixCls = getPrefixCls('tooltip');

  const _popupVisible = ref(props.defaultPopupVisible);
  const computedPopupVisible = computed(() => props.popupVisible ?? _popupVisible.value);

  const handlePopupVisibleChange = (visible: boolean) => {
    _popupVisible.value = visible;
    emit('update:popupVisible', visible);
    emit('popupVisibleChange', visible);
  };

  const contentCls = computed(() => [
    `${prefixCls}-content`,
    props.contentClass,
    { [`${prefixCls}-mini`]: props.mini },
  ]);

  const computedContentStyle = computed<CSSProperties | undefined>(() => {
    if (props.backgroundColor || props.contentStyle) {
      return {
        backgroundColor: props.backgroundColor,
        ...props.contentStyle,
      };
    }
    return undefined;
  });

  const arrowCls = computed(() => [`${prefixCls}-popup-arrow`, props.arrowClass]);

  const computedArrowStyle = computed<CSSProperties | undefined>(() => {
    if (props.backgroundColor || props.arrowStyle) {
      return {
        backgroundColor: props.backgroundColor,
        ...props.arrowStyle,
      };
    }
    return undefined;
  });
</script>
