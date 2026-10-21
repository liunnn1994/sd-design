<template>
  <div :class="prefixCls">
    <div
      :class="[
        `${prefixCls}-left`,
        {
          [`${prefixCls}-disabled`]: !onPrev,
        },
      ]"
      @click="onPrevClick"
    >
      <icon-left />
    </div>
    <div
      :class="[
        `${prefixCls}-right`,
        {
          [`${prefixCls}-disabled`]: !onNext,
        },
      ]"
      @click="onNextClick"
    >
      <icon-right />
    </div>
  </div>
</template>
<script setup lang="ts">
  import { activatePreviewArrow } from '@sdata/web-core/image/foundation';

  import { getPrefixCls } from '../_utils/global-config';
  import IconLeft from '../icon/icon-left';
  import IconRight from '../icon/icon-right';

  defineOptions({ name: 'ImagePreviewArrow' });

  const props = defineProps({
    onPrev: {
      type: Function,
    },
    onNext: {
      type: Function,
    },
  });

  const onPrevClick = (event: MouseEvent) =>
    activatePreviewArrow(event, props.onPrev ? () => props.onPrev?.() : undefined);
  const onNextClick = (event: MouseEvent) =>
    activatePreviewArrow(event, props.onNext ? () => props.onNext?.() : undefined);
  const prefixCls = getPrefixCls('image-preview-arrow');
</script>
