/** * NumberFlowGroup synchronizes animation timing across child NumberFlow instances. * Children
whose value changes in the same flush are triggered to animate * on the same frame for a cohesive
visual effect. Children whose value did not change stay idle. */

<script setup lang="ts">
  import { nextTick, provide, watch } from 'vue';

  import { createNumberFlowGroup } from '@sdata/web-core/number-flow/group';

  import { getPrefixCls } from '../_utils/global-config';
  import { GROUP_KEY } from './group-key';

  defineOptions({ name: 'NumberFlowGroup' });

  defineSlots<{
    /**
     * @zh 需要同步更新的 NumberFlow 组件
     * @en NumberFlow components that should update together
     */
    default(): unknown;
  }>();

  const foundation = createNumberFlowGroup({ afterRender: () => nextTick() });

  provide(GROUP_KEY, {
    register(child) {
      const unregister = foundation.register(child);

      const stopWatch = watch(child.value, foundation.animate, { flush: 'pre' });

      return () => {
        stopWatch();
        unregister();
      };
    },
  });

  const prefixCls = getPrefixCls('number-flow-group');
</script>

<template>
  <span :class="prefixCls">
    <slot />
  </span>
</template>
