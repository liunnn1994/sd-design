<script setup lang="ts">
  import { nextTick, ref, useTemplateRef } from 'vue';

  import { Button, LiquidGlassLogo, Space } from '@sdata/web-vue';
  const glass = useTemplateRef('glass');
  const paused = ref(false);
  async function replay() {
    paused.value = false;
    await nextTick();
    glass.value?.replay();
  }
</script>
<template>
  <div class="liquid-glass-interactive">
    <Space wrap>
      <Button type="primary" @click="replay">重新播放</Button>
      <Button type="outline" :status="paused ? 'success' : 'warning'" @click="paused = !paused">{{
        paused ? '继续播放' : '暂停播放'
      }}</Button>
      <Button type="outline" @click="glass?.seek(3.3)">查看最终字标</Button>
    </Space>
    <LiquidGlassLogo
      :auto-width="false"
      ref="glass"
      logo="/logo-icon.png"
      logo-color="original"
      mark="logo"
      text="Design"
      ending="wordmark"
      :paused="paused"
      :height="320"
    />
  </div>
</template>

<style scoped lang="scss">
  .liquid-glass-interactive {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
</style>
