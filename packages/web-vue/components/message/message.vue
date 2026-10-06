<template>
  <li
    role="alert"
    :class="[prefixCls, `${prefixCls}-${type}`, { [`${prefixCls}-closable`]: closable }]"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <span v-if="showIcon && !(type === 'normal' && !$slots.icon)" :class="`${prefixCls}-icon`">
      <slot name="icon">
        <icon-info-circle-fill v-if="type === 'info'" />
        <icon-check-circle-fill v-else-if="type === 'success'" />
        <icon-exclamation-circle-fill v-else-if="type === 'warning'" />
        <icon-close-circle-fill v-else-if="type === 'error'" />
        <icon-loading v-else-if="type === 'loading'" />
      </slot>
    </span>
    <span :class="`${prefixCls}-content`">
      <slot />
    </span>
    <span
      v-if="closable"
      :class="`${prefixCls}-close-btn`"
      role="button"
      tabindex="0"
      :aria-label="t('a11y.close')"
      @click="handleClose"
      @keydown="handleCloseKeydown"
    >
      <a-icon-hover>
        <icon-close />
      </a-icon-hover>
    </span>
  </li>
</template>

<script setup lang="ts">
  import type { PropType } from 'vue';
  import { onMounted, onUnmounted, onUpdated } from 'vue';

  import AIconHover from '../_components/icon-hover.vue';
  import { MessageType } from '../_utils/constant';
  import { getPrefixCls } from '../_utils/global-config';
  import { onActivate } from '../_utils/keyboard';
  import IconCheckCircleFill from '../icon/icon-check-circle-fill';
  import IconClose from '../icon/icon-close';
  import IconCloseCircleFill from '../icon/icon-close-circle-fill';
  import IconExclamationCircleFill from '../icon/icon-exclamation-circle-fill';
  import IconInfoCircleFill from '../icon/icon-info-circle-fill';
  import IconLoading from '../icon/icon-loading';
  import { useI18n } from '../locale';

  defineOptions({ name: 'Message' });

  const props = defineProps({
    type: {
      type: String as PropType<MessageType | 'loading' | 'normal'>,
      default: 'info',
    },
    closable: {
      type: Boolean,
      default: false,
    },
    showIcon: {
      type: Boolean,
      default: true,
    },
    duration: {
      type: Number,
      default: 3000,
    },
    resetOnUpdate: {
      type: Boolean,
      default: false,
    },
    resetOnHover: {
      type: Boolean,
      default: true,
    },
  });

  const emit = defineEmits<{ close: [] }>();

  const prefixCls = getPrefixCls('message');
  const { t } = useI18n();
  let timer = 0;
  let hovered = false;

  const handleClose = () => {
    emit('close');
  };
  const handleCloseKeydown = onActivate(handleClose);

  const startTimer = () => {
    if (props.duration > 0 && !(props.resetOnHover && hovered)) {
      timer = window.setTimeout(handleClose, props.duration);
    }
  };

  const clearTimer = () => {
    if (timer) {
      window.clearTimeout(timer);
      timer = 0;
    }
  };

  onMounted(() => {
    startTimer();
  });

  onUpdated(() => {
    if (props.resetOnUpdate) {
      clearTimer();
      startTimer();
    }
  });

  onUnmounted(() => {
    clearTimer();
  });

  const handleMouseEnter = () => {
    hovered = true;
    if (props.resetOnHover) {
      clearTimer();
    }
  };

  const handleMouseLeave = () => {
    hovered = false;
    if (props.resetOnHover) {
      startTimer();
    }
  };
</script>
