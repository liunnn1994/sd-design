<template>
  <Transition
    :name="`${headerCls}-motion`"
    @before-enter="handleBeforeEnter"
    @enter="handleEnter"
    @after-enter="handleAfterEnter"
    @enter-cancelled="cancelFrame"
    @before-leave="handleBeforeLeave"
    @leave="handleLeave"
    @after-leave="handleAfterLeave"
    @leave-cancelled="handleAfterEnter"
  >
    <div v-if="rendered" v-show="open" :class="[prefixCls, headerCls]" v-bind="$attrs">
      <div
        v-if="closable || title !== undefined || $slots.title"
        :class="[`${headerCls}-header`, classNames?.header]"
        :style="styles?.header"
      >
        <div :class="`${headerCls}-title`">
          <slot name="title">{{ title }}</slot>
        </div>
        <div v-if="closable" :class="`${headerCls}-close`">
          <Button
            type="text"
            size="small"
            :aria-label="t('sender.closeHeader')"
            @click="handleClose"
          >
            <template #icon><IconClose /></template>
          </Button>
        </div>
      </div>
      <div
        v-if="$slots.default"
        :class="[`${headerCls}-content`, classNames?.content]"
        :style="styles?.content"
      >
        <slot />
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
  import { inject, onBeforeUnmount, shallowRef, watch } from 'vue';

  import { createSenderHeader } from '@sdata/web-core/sender/controls';

  import type { SenderHeaderProps } from './types';

  import { getPrefixCls } from '../_utils/global-config';
  import Button from '../button';
  import IconClose from '../icon/icon-close';
  import { useI18n } from '../locale';
  import { senderInjectionKey } from './context';

  defineOptions({ name: 'SenderHeader', inheritAttrs: false });

  const props = withDefaults(defineProps<SenderHeaderProps>(), {
    open: false,
    forceRender: false,
    closable: true,
    classNames: () => ({}),
    styles: () => ({}),
  });
  const emit = defineEmits<{
    'update:open': [open: boolean];
    'openChange': [open: boolean];
  }>();

  const { t } = useI18n();

  const context = inject(senderInjectionKey, undefined);
  const prefixCls = context?.prefixCls ?? getPrefixCls('sender');
  const headerCls = `${prefixCls}-header`;
  const rendered = shallowRef(false);
  const foundation = createSenderHeader(
    {
      get props() {
        return props;
      },
      get rendered() {
        return rendered.value;
      },
      set rendered(value) {
        rendered.value = value;
      },
    },
    { update: (open) => emit('update:open', open), change: (open) => emit('openChange', open) },
  );
  watch([() => props.open, () => props.forceRender], ([open, forceRender]) =>
    foundation.syncRendered(open, forceRender),
  );
  const {
    close: handleClose,
    cancelFrame,
    beforeEnter: handleBeforeEnter,
    enter: handleEnter,
    afterEnter: handleAfterEnter,
    beforeLeave: handleBeforeLeave,
    leave: handleLeave,
    afterLeave: handleAfterLeave,
  } = foundation;
  onBeforeUnmount(cancelFrame);
</script>
