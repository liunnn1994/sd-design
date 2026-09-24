<template>
  <section v-show="hasVisibleItems" :class="prefixCls" role="group" :aria-labelledby="headingId">
    <button
      v-if="heading || $slots.heading"
      :id="headingId"
      type="button"
      :class="`${prefixCls}-heading`"
      :aria-controls="contentId"
      :aria-expanded="isExpanded"
      @click="toggleExpanded"
    >
      <span :class="`${prefixCls}-heading-text`">
        <slot name="heading">{{ heading }}</slot>
      </span>
      <IconRight
        :class="[`${prefixCls}-chevron`, { [`${prefixCls}-chevron--expanded`]: isExpanded }]"
        aria-hidden="true"
      />
    </button>
    <div
      :id="contentId"
      :class="[`${prefixCls}-content`, { [`${prefixCls}-content--collapsed`]: !isExpanded }]"
      :aria-hidden="!isExpanded"
      :inert="!isExpanded"
    >
      <div :class="`${prefixCls}-content-inner`">
        <slot />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
  import {
    computed,
    getCurrentInstance,
    onBeforeUnmount,
    provide,
    shallowRef,
    useSlots,
    watch,
  } from 'vue';

  import { getPrefixCls } from '../_utils/global-config';
  import IconRight from '../icon/icon-right';
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
  const slots = useSlots();
  const id = Symbol(`model-selector-group-${uid}`);
  const headingId = `${context.listId}-group-${uid}`;
  const contentId = `${headingId}-content`;
  const expanded = shallowRef(heading || slots.heading ? context.defaultExpanded : true);
  const searchExpanded = shallowRef<boolean>();
  const isSearching = computed(() => context.query.value.trim().length > 0);
  const isExpanded = computed(() =>
    isSearching.value ? (searchExpanded.value ?? true) : expanded.value,
  );
  const hasVisibleItems = computed(() => context.getVisibleItems(id).length > 0);

  function toggleExpanded() {
    if (isSearching.value) {
      searchExpanded.value = !isExpanded.value;
    } else {
      expanded.value = !expanded.value;
    }
  }

  watch(
    () => context.query.value.trim(),
    () => {
      searchExpanded.value = undefined;
    },
    { flush: 'sync' },
  );

  context.registerGroup(id, isExpanded);
  onBeforeUnmount(() => context.unregisterGroup(id));
  provide(modelSelectorGroupInjectionKey, { id });
</script>
