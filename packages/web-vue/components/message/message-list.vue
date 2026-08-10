<template>
  <TransitionGroup
    :class="[prefixCls, `${prefixCls}-${position}`]"
    name="fade-message"
    tag="ul"
    :style="{ zIndex }"
    @after-leave="emit('afterClose')"
  >
    <Message
      v-for="item in messages"
      :key="item.id"
      :type="item.type"
      :duration="item.duration"
      :closable="item.closable"
      :reset-on-update="item.resetOnUpdate"
      :reset-on-hover="item.resetOnHover"
      @close="emit('close', item.id)"
    >
      <component :is="getSlotFunction(item.content)" />
      <template v-if="item.icon" #icon>
        <component :is="getSlotFunction(item.icon)" />
      </template>
    </Message>
  </TransitionGroup>
</template>

<script setup lang="ts">
  import type { PropType } from 'vue';

  import type { MessageItem, MessagePosition } from './interface';

  import usePopupManager from '../_hooks/use-popup-manager';
  import { getPrefixCls } from '../_utils/global-config';
  import { getSlotFunction } from '../_utils/vue-utils';
  import Message from './message.vue';

  defineOptions({ name: 'MessageList' });

  defineProps({
    messages: {
      type: Array as PropType<MessageItem[]>,
      default: () => [],
    },
    position: {
      type: String as PropType<MessagePosition>,
      default: 'top',
    },
  });

  const emit = defineEmits<{
    close: [id: number | string];
    afterClose: [];
  }>();

  const prefixCls = getPrefixCls('message-list');
  const { zIndex } = usePopupManager('message', { runOnMounted: true });
</script>
