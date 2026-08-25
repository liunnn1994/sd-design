<template>
  <Ellipsis v-bind="$attrs" :class="prefixCls" :tooltip="ellipsisTooltipProps">
    <slot />
    <template v-if="props.tooltipProps?.content !== undefined" #tooltip>
      {{ props.tooltipProps.content }}
    </template>
  </Ellipsis>
</template>

<script setup lang="ts">
  import type { VNode } from 'vue';
  import { computed } from 'vue';

  import type { EllipsisTooltipProps } from '../../ellipsis';
  import type { TooltipProps } from '../../tooltip/interface';

  import { getPrefixCls } from '../../_utils/global-config';
  import Ellipsis from '../../ellipsis';

  defineOptions({ name: 'AutoTooltip', inheritAttrs: false });

  const props = defineProps<{
    tooltipProps?: TooltipProps;
  }>();
  defineSlots<{
    default?: () => VNode[];
  }>();

  const prefixCls = getPrefixCls('auto-tooltip');
  const ellipsisTooltipProps = computed(
    () => props.tooltipProps as EllipsisTooltipProps | undefined,
  );
</script>
