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

  import {
    createModelSelectorGroupFoundation,
    getModelSelectorGroupInitialExpanded,
  } from '@sdata/web-core/model-selector/group';

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
  const expanded = shallowRef(
    getModelSelectorGroupInitialExpanded(heading || slots.heading, context.defaultExpanded),
  );
  const searchExpanded = shallowRef<boolean>();
  const foundation: ReturnType<typeof createModelSelectorGroupFoundation> =
    createModelSelectorGroupFoundation({
      get query() {
        return context.query.value;
      },
      get isSearching(): boolean {
        return isSearching.value;
      },
      get isExpanded(): boolean {
        return isExpanded.value;
      },
      get expanded() {
        return expanded.value;
      },
      set expanded(value) {
        expanded.value = value;
      },
      get searchExpanded() {
        return searchExpanded.value;
      },
      set searchExpanded(value) {
        searchExpanded.value = value;
      },
    });
  const isSearching = computed(() => foundation.getIsSearching());
  const isExpanded = computed(() => foundation.getIsExpanded());
  const hasVisibleItems = computed(() => context.getVisibleItems(id).length > 0);
  const { toggleExpanded } = foundation;
  watch(() => context.query.value.trim(), foundation.syncQuery, { flush: 'sync' });
  context.registerGroup(id, isExpanded);
  onBeforeUnmount(() => context.unregisterGroup(id));
  provide(modelSelectorGroupInjectionKey, { id });
</script>
