<template>
  <Transition
    :name="`${headerCls}-motion`"
    @before-enter="handleBeforeEnter"
    @enter="handleEnter"
    @after-enter="handleAfterEnter"
    @before-leave="handleBeforeLeave"
    @leave="handleLeave"
    @after-leave="handleAfterLeave"
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
          <Button type="text" size="small" aria-label="关闭头部面板" @click="handleClose">
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
  import { inject, shallowRef, watch } from 'vue';

  import type { SenderHeaderProps } from './types';

  import { getPrefixCls } from '../_utils/global-config';
  import Button from '../button';
  import IconClose from '../icon/icon-close';
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

  const context = inject(senderInjectionKey, undefined);
  const prefixCls = context?.prefixCls ?? getPrefixCls('sender');
  const headerCls = `${prefixCls}-header`;
  const rendered = shallowRef(props.forceRender || props.open);

  watch(
    () => props.open,
    (open) => {
      if (open) rendered.value = true;
    },
  );

  const handleClose = () => {
    const nextOpen = !props.open;
    emit('update:open', nextOpen);
    emit('openChange', nextOpen);
  };

  const handleBeforeEnter = (element: Element) => {
    const target = element as HTMLElement;
    target.style.height = '0';
    target.style.borderBottomColor = 'transparent';
  };
  const handleEnter = (element: Element) => {
    const target = element as HTMLElement;
    requestAnimationFrame(() => {
      target.style.height = `${target.scrollHeight}px`;
      target.style.borderBottomColor = '';
    });
  };
  const handleAfterEnter = (element: Element) => {
    (element as HTMLElement).style.height = 'auto';
  };
  const handleBeforeLeave = (element: Element) => {
    const target = element as HTMLElement;
    target.style.height = `${target.scrollHeight}px`;
  };
  const handleLeave = (element: Element) => {
    const target = element as HTMLElement;
    requestAnimationFrame(() => {
      target.style.height = '0';
      target.style.borderBottomColor = 'transparent';
    });
  };
  const handleAfterLeave = () => {
    if (!props.forceRender) rendered.value = false;
  };
</script>
