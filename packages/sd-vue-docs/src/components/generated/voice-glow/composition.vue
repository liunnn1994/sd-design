<template>
  <div class="voice-glow-composition">
    <sd-voice-glow theme="dark" :level="0.5">
      <div class="voice-glow-card">
        <strong>自定义内容</strong>
        <span>插槽内可以放入任意卡片或输入区域。</span>
      </div>
    </sd-voice-glow>
  </div>
</template>

<style scoped>
  .voice-glow-composition {
    padding: 28px;
    background: #11121b;
    border-radius: 16px;
  }

  .voice-glow-card {
    display: grid;
    gap: 8px;
    min-width: 300px;
    padding: 24px;
    color: #fff;
    background: #232432;
    border-radius: 16px;
  }

  .voice-glow-card span {
    opacity: 0.7;
  }
</style>
