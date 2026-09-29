<template>
  <div class="voice-glow-variants">
    <sd-voice-glow type="pill" theme="dark" color-variant="ocean" :level="0.6">
      <div class="voice-glow-pill">海洋配色</div>
    </sd-voice-glow>
    <sd-voice-glow type="pill" theme="dark" color-variant="sunset" :level="0.6">
      <div class="voice-glow-pill">日落配色</div>
    </sd-voice-glow>
  </div>
</template>

<style scoped>
  .voice-glow-variants {
    display: flex;
    gap: 24px;
    padding: 32px;
    background: #11121b;
    border-radius: 16px;
  }

  .voice-glow-pill {
    padding: 12px 24px;
    color: #fff;
    background: #232432;
    border-radius: 999px;
  }
</style>
