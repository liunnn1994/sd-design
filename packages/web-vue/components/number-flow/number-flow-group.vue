/** * NumberFlowGroup synchronizes animation timing across child NumberFlow instances. * When any
child's value changes, all children in the group are triggered to animate * on the same frame for a
cohesive visual effect. */

<script setup lang="ts">
  import { nextTick, provide, watch } from 'vue';

  import { getPrefixCls } from '../_utils/global-config';
  import { GROUP_KEY, type GroupChild } from './group-key';

  defineOptions({ name: 'NumberFlowGroup' });

  defineSlots<{
    /**
     * @zh 需要同步更新的 NumberFlow 组件
     * @en NumberFlow components that should update together
     */
    default(): unknown;
  }>();

  const children = new Set<GroupChild>();
  let updating = false;
  let pending = false;

  async function animateChildren() {
    if (updating) {
      pending = true;
      return;
    }

    updating = true;
    try {
      do {
        pending = false;
        const preparedChildren = [...children].flatMap((child) => {
          const version = child.prepare();
          return version === undefined ? [] : [{ child, version }];
        });
        if (preparedChildren.length === 0) continue;

        await nextTick();
        const committedChildren = preparedChildren.filter(({ child, version }) =>
          child.commit(version),
        );
        committedChildren.forEach(({ child, version }) => child.start(version));
      } while (pending);
    } finally {
      updating = false;
    }
  }

  provide(GROUP_KEY, {
    register(child) {
      children.add(child);

      const stopWatch = watch(child.value, animateChildren, { flush: 'pre' });

      return () => {
        stopWatch();
        children.delete(child);
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
