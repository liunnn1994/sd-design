<template>
  <sd-space direction="vertical" :size="20" fill>
    <div style="padding: 24px; background: #0d0d1a; border-radius: 16px">
      <div style="margin-bottom: 12px; color: #999; font-size: 13px">深色背景</div>
      <sd-space :size="20">
        <sd-border-beam theme="dark">
          <div style="padding: 14px 22px; background: #1a1a2e; border-radius: 16px; color: #e0e0e0"
            >dark</div
          >
        </sd-border-beam>
        <sd-border-beam theme="auto">
          <div style="padding: 14px 22px; background: #1a1a2e; border-radius: 16px; color: #e0e0e0"
            >auto</div
          >
        </sd-border-beam>
      </sd-space>
    </div>
    <div style="padding: 24px; background: #e8e8ee; border-radius: 16px">
      <div style="margin-bottom: 12px; color: #666; font-size: 13px">浅色背景</div>
      <sd-space :size="20">
        <sd-border-beam theme="light">
          <div style="padding: 14px 22px; background: #fff; border-radius: 16px; color: #333"
            >light</div
          >
        </sd-border-beam>
        <sd-border-beam theme="auto">
          <div style="padding: 14px 22px; background: #fff; border-radius: 16px; color: #333"
            >auto</div
          >
        </sd-border-beam>
      </sd-space>
    </div>
  </sd-space>
</template>
