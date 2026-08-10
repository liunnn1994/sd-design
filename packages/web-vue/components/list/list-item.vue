<template>
  <div role="listitem" :class="prefixCls">
    <DefineAction v-slot="{ actions }">
      <ul v-if="actions.length > 0" :class="`${prefixCls}-action`">
        <li v-for="(action, index) in actions" :key="`${prefixCls}-action-${index}`">
          <RenderVNode :content="action" />
        </li>
      </ul>
    </DefineAction>

    <div :class="`${prefixCls}-main`">
      <slot name="meta" />
      <div :class="`${prefixCls}-content`">
        <slot />
      </div>
      <ReuseAction v-if="actionLayout === 'vertical'" :actions="$slots.actions?.() ?? []" />
    </div>
    <ReuseAction v-if="actionLayout === 'horizontal'" :actions="$slots.actions?.() ?? []" />
    <div v-if="$slots.extra" :class="`${prefixCls}-extra`">
      <slot name="extra" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { PropType, VNode } from 'vue';
  import { defineComponent } from 'vue';

  import { createReusableTemplate } from '@vueuse/core';

  import type { Direction } from '../_utils/constant';

  import { getPrefixCls } from '../_utils/global-config';

  defineOptions({ name: 'ListItem' });

  withDefaults(
    defineProps<{
      /**
       * @zh 操作组排列方向
       * @en Operation group arrangement direction
       */
      actionLayout?: Direction;
    }>(),
    {
      actionLayout: 'horizontal',
    },
  );

  defineSlots<{
    default?: () => VNode[];
    /** @zh 操作组 @en Actions */
    actions?: () => VNode[];
    /** @zh 额外内容 @en Extra content */
    extra?: () => VNode[];
    /** @zh meta信息 @en Meta data */
    meta?: () => VNode[];
  }>();

  const [DefineAction, ReuseAction] = createReusableTemplate<{ actions: VNode[] }>();
  const RenderVNode = defineComponent({
    name: 'ListItemRenderVNode',
    props: {
      content: {
        type: null as unknown as PropType<VNode>,
        required: true,
      },
    },
    setup(props) {
      return () => props.content;
    },
  });
  const prefixCls = getPrefixCls('list-item');
</script>
