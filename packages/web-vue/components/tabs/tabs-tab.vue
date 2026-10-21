<template>
  <div
    :id="tabId"
    :class="cls"
    role="tab"
    :tabindex="active && !tab.disabled ? 0 : -1"
    :aria-selected="active"
    :aria-disabled="tab.disabled || undefined"
    :aria-controls="panelId"
    v-bind="eventHandlers"
  >
    <span :class="`${prefixCls}-title`">
      <slot />
    </span>
    <button
      v-if="editable && tab.closable"
      type="button"
      :class="`${prefixCls}-close-btn`"
      :aria-label="t('a11y.closeTab')"
      @click.stop="handleDelete"
      @keydown.stop
    >
      <icon-hover><icon-close /></icon-hover>
    </button>
  </div>
</template>

<script setup lang="ts">
  import type { PropType } from 'vue';
  import { computed, inject } from 'vue';

  import { activateTab, activateTabKey } from '@sdata/web-core/tabs/foundation';

  import type { TabData } from './interface';

  import IconHover from '../_components/icon-hover.vue';
  import { getPrefixCls } from '../_utils/global-config';
  import IconClose from '../icon/icon-close';
  import { useI18n } from '../locale';
  import { TabsContext, tabsInjectionKey } from './context';

  defineOptions({ name: 'TabsTab' });

  const props = defineProps({
    tab: {
      type: Object as PropType<TabData>,
      required: true,
    },
    active: Boolean,
    editable: Boolean,
  });

  const emit = defineEmits<{
    click: [_key: string | number, _e: Event];
    delete: [_key: string | number, _e: Event];
  }>();

  const prefixCls = getPrefixCls('tabs-tab');
  const { t } = useI18n();
  const tabsCtx = inject<Partial<TabsContext>>(tabsInjectionKey, {});
  const tabsId = computed(() => tabsCtx.tabsId ?? '');
  const tabId = computed(() => `${tabsId.value}-${typeof props.tab.key}-${props.tab.key}-tab`);
  const panelId = computed(() => `${tabsId.value}-${typeof props.tab.key}-${props.tab.key}-panel`);
  const handleClick = (event: Event) =>
    activateTab(props.tab, event, (key, event) => emit('click', key, event));
  const onKeyDown = (event: KeyboardEvent) => activateTabKey(event, handleClick);

  const eventHandlers = computed(() => {
    return Object.assign(
      tabsCtx.trigger === 'click' ? { onClick: handleClick } : { onMouseover: handleClick },
      { onKeydown: onKeyDown },
    );
  });

  const handleDelete = (event: Event) =>
    activateTab(props.tab, event, (key, event) => emit('delete', key, event));

  const cls = computed(() => [
    prefixCls,
    {
      [`${prefixCls}-active`]: props.active,
      [`${prefixCls}-closable`]: props.editable && props.tab.closable,
      [`${prefixCls}-disabled`]: props.tab.disabled,
    },
  ]);
</script>
