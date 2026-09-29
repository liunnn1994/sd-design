<template>
  <div class="voice-glow-themes">
    <div class="voice-glow-stage voice-glow-stage-dark">
      <span class="voice-glow-label">深色模式</span>
      <sd-voice-glow theme="dark" :level="0.45">
        <div class="voice-glow-card voice-glow-card-dark">正在聆听你的声音</div>
      </sd-voice-glow>
    </div>
    <div class="voice-glow-stage voice-glow-stage-light">
      <span class="voice-glow-label">浅色模式</span>
      <sd-voice-glow theme="light" :level="0.45">
        <div class="voice-glow-card voice-glow-card-light">正在聆听你的声音</div>
      </sd-voice-glow>
    </div>
  </div>
</template>

<style scoped>
  .voice-glow-themes {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 16px;
  }

  .voice-glow-stage {
    display: grid;
    gap: 12px;
    padding: 28px;
    border-radius: 16px;
  }

  .voice-glow-stage-dark {
    color: #fff;
    background: #11121b;
  }

  .voice-glow-stage-light {
    color: #303242;
    background: #f2f3f8;
  }

  .voice-glow-label {
    font-size: 13px;
  }

  .voice-glow-card {
    padding: 24px;
    border-radius: 16px;
    margin-inline: auto;
  }

  .voice-glow-card-dark {
    color: #fff;
  }

  .voice-glow-card-light {
    color: #303242;
  }
</style>
