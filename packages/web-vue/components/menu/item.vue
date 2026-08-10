<template>
  <DefineItemElement>
    <div
      ref="refItemElement"
      role="menuitem"
      :tabindex="disabled ? undefined : 0"
      :aria-disabled="disabled || undefined"
      :aria-current="isSelected ? 'page' : undefined"
      :class="[
        `${prefixCls}-item`,
        {
          [`${prefixCls}-disabled`]: disabled,
          [`${prefixCls}-selected`]: isSelected,
          [`${prefixCls}-has-icon`]: Boolean($slots.icon),
          [`${prefixCls}-item-indented`]: showIndent,
        },
      ]"
      v-bind="$attrs"
      @click="onClick"
      @keydown="onKeydown"
    >
      <MenuIndent v-if="showIndent" :level="level" />
      <span v-if="$slots.icon" :class="`${prefixCls}-icon`">
        <slot name="icon" />
      </span>
      <span v-if="menuContext.ellipsis" :class="[titleClassNames, `${prefixCls}-ellipsis-wrapper`]">
        <Ellipsis :class="`${prefixCls}-ellipsis`" v-bind="menuContext.ellipsisProps || {}">
          <slot />
        </Ellipsis>
      </span>
      <span v-else-if="showIndent || $slots.icon" :class="titleClassNames">
        <slot />
      </span>
      <slot v-else />
      <div
        v-if="isSelected && menuContext.mode === 'horizontal'"
        :class="`${prefixCls}-selected-label`"
      />
    </div>
  </DefineItemElement>

  <Tooltip
    v-if="needTooltip"
    position="right"
    :class="tooltipClassNames"
    v-bind="omit(menuContext.tooltipProps || {}, ['class'])"
  >
    <ReuseItemElement />
    <template #content>
      <slot />
    </template>
  </Tooltip>
  <ReuseItemElement v-else />
</template>

<script setup lang="ts">
  import { computed, onMounted, onUnmounted, ref, useSlots, watch } from 'vue';

  import { createReusableTemplate } from '@vueuse/core';
  import scrollIntoView from 'scroll-into-view-if-needed';

  import { isActivationKey } from '../_utils/keyboard';
  import { omit } from '../_utils/omit';
  import Ellipsis from '../ellipsis';
  import Tooltip from '../tooltip';
  import useLevel from './hooks/use-level';
  import useMenu from './hooks/use-menu';
  import useMenuContext from './hooks/use-menu-context';
  import { useMenuDataCollectorContext } from './hooks/use-menu-data-collector';
  import MenuIndent from './indent.vue';

  defineOptions({
    name: 'MenuItem',
    inheritAttrs: false,
  });

  const props = defineProps({
    /**
     * @zh 是否禁用
     * @en Whether to disable
     */
    disabled: {
      type: Boolean,
      default: false,
    },
  });

  const emit = defineEmits<{
    click: [event: MouseEvent];
  }>();

  const { key } = useMenu();
  const { level } = useLevel();
  const menuContext = useMenuContext();
  const menuDataCollector = useMenuDataCollectorContext();
  const slots = useSlots();
  const refItemElement = ref<HTMLDivElement>();
  const [DefineItemElement, ReuseItemElement] = createReusableTemplate();

  const prefixCls = computed(() => menuContext.prefixCls);
  const isSelected = computed(() => (menuContext.selectedKeys || []).includes(key.value));
  const needTooltip = computed(() =>
    Boolean(menuContext.collapsed && !menuContext.inTrigger && level.value === 1),
  );
  const showIndent = computed(
    () =>
      Boolean(menuContext.mode === 'vertical' && level.value > 1) &&
      !menuContext.inTrigger &&
      !menuContext.collapsed,
  );
  const titleClassNames = computed(() => [
    `${prefixCls.value}-item-inner`,
    {
      [`${prefixCls.value}-title`]: Boolean(slots.icon),
    },
  ]);
  const tooltipClassNames = computed(() =>
    [`${prefixCls.value}-item-tooltip`, menuContext.tooltipProps?.class].filter(Boolean),
  );

  const scrollTo = () => {
    if (menuContext.autoScrollIntoView && refItemElement.value && isSelected.value) {
      scrollIntoView(refItemElement.value, {
        behavior: 'smooth',
        block: 'nearest',
        scrollMode: 'if-needed',
        boundary: document.documentElement,
        ...menuContext.scrollConfig,
      });
    }
  };

  const onClick = (event: MouseEvent) => {
    if (props.disabled) return;
    menuContext.onMenuItemClick?.(key.value);
    emit('click', event);
  };

  const onKeydown = (event: KeyboardEvent) => {
    if (isActivationKey(event)) {
      event.preventDefault();
      onClick(event as unknown as MouseEvent);
    }
  };

  let timer: ReturnType<typeof setTimeout>;
  onMounted(() => {
    menuDataCollector?.collectMenuItem(key.value);
    timer = setTimeout(scrollTo, 500);
  });
  onUnmounted(() => {
    menuDataCollector?.removeMenuItem(key.value);
    clearTimeout(timer);
  });
  watch([isSelected], scrollTo);

  defineExpose({ menuContext, level, isSelected, refItemElement, onClick });
</script>
