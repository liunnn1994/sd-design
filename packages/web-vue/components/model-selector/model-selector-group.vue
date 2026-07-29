<template>
  <section v-show="hasVisibleItems" :class="prefixCls" role="group" :aria-labelledby="headingId">
    <div v-if="heading || $slots.heading" :id="headingId" :class="`${prefixCls}-heading`">
      <slot name="heading">{{ heading }}</slot>
    </div>
    <div :class="`${prefixCls}-content`">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
  import { computed, getCurrentInstance, provide } from 'vue';

  import { getPrefixCls } from '../_utils/global-config';
  import { modelSelectorGroupInjectionKey } from './context';
  import { useModelSelectorContext } from './use-model-selector-context';

  defineOptions({ name: 'ModelSelectorGroup' });

  const { heading } = defineProps<{
    /**
     * @zh 分组标题
     * @en Group heading
     */
    heading?: string;
  }>();

  const context = useModelSelectorContext('ModelSelectorGroup');
  const prefixCls = getPrefixCls('model-selector-group');
  const uid = getCurrentInstance()!.uid;
  const id = Symbol(`model-selector-group-${uid}`);
  const headingId = `${context.listId}-group-${uid}`;
  const hasVisibleItems = computed(() => context.getVisibleItems(id).length > 0);

  provide(modelSelectorGroupInjectionKey, { id });
</script>
