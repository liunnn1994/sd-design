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
    >
      <icon-hover><icon-close /></icon-hover>
    </button>
  </div>
</template>

<script setup lang="ts">
  import type { PropType } from 'vue';
  import { computed, inject } from 'vue';

  import type { TabData } from './interface';

  import IconHover from '../_components/icon-hover.vue';
  import { getPrefixCls } from '../_utils/global-config';
  import { KEYBOARD_KEY } from '../_utils/keyboard';
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
  const tabId = computed(() => `${tabsId.value}-${props.tab.key}-tab`);
  const panelId = computed(() => `${tabsId.value}-${props.tab.key}-panel`);
  const handleClick = (e: Event) => {
    if (!props.tab.disabled) {
      emit('click', props.tab.key, e);
    }
  };

  const onKeyDown = (ev: KeyboardEvent) => {
    // Enter / Space 激活当前 tab；方向键与 Home/End 在 tablist（tabs-nav）层统一处理
    if (ev.key === KEYBOARD_KEY.ENTER) {
      handleClick(ev);
    } else if (ev.key === KEYBOARD_KEY.SPACE) {
      ev.preventDefault();
      handleClick(ev);
    }
  };

  const eventHandlers = computed(() => {
    return Object.assign(
      tabsCtx.trigger === 'click' ? { onClick: handleClick } : { onMouseover: handleClick },
      { onKeydown: onKeyDown },
    );
  });

  const handleDelete = (e: Event) => {
    if (!props.tab.disabled) {
      emit('delete', props.tab.key, e);
    }
  };

  const cls = computed(() => [
    prefixCls,
    {
      [`${prefixCls}-active`]: props.active,
      [`${prefixCls}-closable`]: props.editable && props.tab.closable,
      [`${prefixCls}-disabled`]: props.tab.disabled,
    },
  ]);
</script>
