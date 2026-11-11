<script setup lang="ts">
  import { shallowRef, useId } from 'vue';

  import { Button, Icon } from '@sdata/web-vue';

  const IconFont = Icon.addFromIconFontCn({});
  const id = useId();
  const symbol = shallowRef<'small' | 'large' | 'slot'>('small');
  const spin = shallowRef(false);
</script>

<template>
  <div class="sd:grid sd:gap-4">
    <svg width="0" height="0" aria-hidden="true">
      <defs>
        <symbol :id="`${id}-small`" viewBox="0 0 20 20">
          <rect x="5" y="5" width="10" height="10" />
        </symbol>
        <symbol :id="`${id}-large`" viewBox="0 0 20 20"><circle cx="10" cy="10" r="9" /></symbol>
      </defs>
    </svg>
    <IconFont
      data-testid="icon-font-demo"
      :type="symbol === 'slot' ? undefined : `${id}-${symbol}`"
      :size="48"
      :spin="spin"
      :rotate="45"
      viewBox="0 0 20 20"
      aria-label="自定义图标"
      ><path d="M10 1L19 19H1Z"
    /></IconFont>
    <div class="sd:flex sd:flex-wrap sd:gap-2">
      <Button @click="symbol = 'small'">方形 symbol</Button>
      <Button @click="symbol = 'large'">圆形 symbol</Button>
      <Button @click="symbol = 'slot'">自定义内容</Button>
      <Button @click="spin = !spin">{{ spin ? '停止旋转' : '开始旋转' }}</Button>
    </div>
  </div>
</template>
