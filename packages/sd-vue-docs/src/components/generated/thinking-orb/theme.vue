<template>
  <div class="theme-grid">
    <sd-theme-provider theme-mode="light">
      <div class="theme-panel theme-panel--light">
        <sd-thinking-orb theme="auto" state="connecting" />
        <span>浅色模式</span>
      </div>
    </sd-theme-provider>
    <sd-theme-provider theme-mode="dark">
      <div class="theme-panel theme-panel--dark">
        <sd-thinking-orb theme="auto" state="connecting" />
        <span>深色模式</span>
      </div>
    </sd-theme-provider>
  </div>
</template>

<style scoped>
  .theme-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .theme-panel {
    display: grid;
    gap: 12px;
    justify-items: center;
    padding: 24px;
    border: 1px solid var(--sd-color-border-2);
    border-radius: 8px;
  }

  .theme-panel--light {
    color: rgb(29 33 41);
    background: #fff;
  }

  .theme-panel--dark {
    color: rgb(255 255 255 / 90%);
    background: #17171a;
  }
</style>
