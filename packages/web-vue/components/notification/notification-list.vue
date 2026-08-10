<template>
  <TransitionGroup
    :class="[prefixCls, `${prefixCls}-${kebabPosition}`]"
    :style="{ zIndex }"
    :name="`slide-${isRight ? 'right' : 'left'}-notification`"
    tag="ul"
    @after-leave="emit('afterClose')"
  >
    <Notification
      v-for="item in notifications"
      :key="item.id"
      :type="item.type"
      :style="item.style"
      :class="item.class"
      :duration="item.duration"
      :closable="item.closable"
      :show-icon="item.showIcon"
      :reset-on-update="item.resetOnUpdate"
      @close="emit('close', item.id)"
    >
      <component :is="getSlotFunction(item.title)" />
      <template #content>
        <component :is="getSlotFunction(item.content)" />
      </template>
      <template v-if="item.icon" #icon>
        <component :is="getSlotFunction(item.icon)" />
      </template>
      <template v-if="item.footer" #footer>
        <component :is="getSlotFunction(item.footer)" />
      </template>
      <template v-if="item.closeIcon" #closeIcon>
        <component :is="getSlotFunction(item.closeIcon)" />
      </template>
      <template v-if="item.closeIconElement" #closeIconElement>
        <component :is="getSlotFunction(item.closeIconElement)" />
      </template>
    </Notification>
  </TransitionGroup>
</template>

<script setup lang="ts">
  import type { PropType } from 'vue';

  import type { NotificationItem, NotificationPosition } from './interface';

  import usePopupManager from '../_hooks/use-popup-manager';
  import { toKebabCase } from '../_utils/convert-case';
  import { getPrefixCls } from '../_utils/global-config';
  import { getSlotFunction } from '../_utils/vue-utils';
  import { NOTIFICATION_POSITION } from './interface';
  import Notification from './notification.vue';

  defineOptions({ name: 'NotificationList' });

  const props = defineProps({
    notifications: {
      type: Array as PropType<NotificationItem[]>,
      default: () => [],
    },
    position: {
      type: String as PropType<NotificationPosition>,
      default: 'topRight',
      validator: (value: unknown) => NOTIFICATION_POSITION.includes(value as NotificationPosition),
    },
  });

  const emit = defineEmits<{
    close: [id: number | string];
    afterClose: [];
  }>();

  const prefixCls = getPrefixCls('notification-list');
  const kebabPosition = toKebabCase(props.position);
  const isRight = props.position.includes('Right');
  const { zIndex } = usePopupManager('message', { runOnMounted: true });
</script>
