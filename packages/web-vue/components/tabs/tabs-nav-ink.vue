<template>
  <div :class="cls" :style="style" />
</template>

<script setup lang="ts">
  import type { CSSProperties } from 'vue';
  import { computed, nextTick, onMounted, onUpdated, ref } from 'vue';

  import { getTabsInkStyle } from '@sdata/web-core/tabs/navigation';

  import { Direction } from '../_utils/constant';
  import { getPrefixCls } from '../_utils/global-config';

  defineOptions({ name: 'TabsNavInk' });

  const props = defineProps<{
    activeTabRef?: HTMLElement;
    direction?: Direction;
    disabled?: boolean;
    animation?: boolean;
    capsule?: boolean;
  }>();

  const prefixCls = getPrefixCls('tabs-nav-ink');
  const position = ref(0);
  const size = ref(0);

  const style = computed<CSSProperties>(() =>
    getTabsInkStyle(props.capsule, props.direction, position.value, size.value),
  );

  const getInkStyle = () => {
    const _activeTabRef = props.activeTabRef;
    if (_activeTabRef) {
      const _position =
        props.direction === 'vertical' ? _activeTabRef.offsetTop : _activeTabRef.offsetLeft;
      const _size =
        props.direction === 'vertical' ? _activeTabRef.offsetHeight : _activeTabRef.offsetWidth;
      if (_position !== position.value || _size !== size.value) {
        position.value = _position;
        size.value = _size;
      }
    }
  };

  onMounted(() => {
    nextTick(() => getInkStyle());
  });

  onUpdated(() => {
    getInkStyle();
  });

  const cls = computed(() => [
    prefixCls,
    {
      [`${prefixCls}-animation`]: props.animation,
      [`${prefixCls}-disabled`]: props.disabled,
      [`${prefixCls}-capsule`]: props.capsule,
    },
  ]);

  defineExpose({
    getInkStyle,
  });
</script>
