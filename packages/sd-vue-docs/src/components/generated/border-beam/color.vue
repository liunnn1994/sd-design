<template>
  <sd-space direction="vertical" :size="20" fill>
    <div style="padding: 20px; background: #0d0d1a; border-radius: 16px">
      <div style="margin-bottom: 12px; color: #999; font-size: 13px">深色背景</div>
      <sd-space :size="16">
        <sd-border-beam color-variant="colorful">
          <div style="padding: 14px 22px; background: #1a1a2e; border-radius: 16px; color: #e0e0e0"
            >colorful</div
          >
        </sd-border-beam>
        <sd-border-beam color-variant="mono">
          <div style="padding: 14px 22px; background: #1a1a2e; border-radius: 16px; color: #e0e0e0"
            >mono</div
          >
        </sd-border-beam>
        <sd-border-beam color-variant="ocean">
          <div style="padding: 14px 22px; background: #1a1a2e; border-radius: 16px; color: #e0e0e0"
            >ocean</div
          >
        </sd-border-beam>
        <sd-border-beam color-variant="sunset">
          <div style="padding: 14px 22px; background: #1a1a2e; border-radius: 16px; color: #e0e0e0"
            >sunset</div
          >
        </sd-border-beam>
      </sd-space>
    </div>
    <div style="padding: 20px; background: #e8e8ee; border-radius: 16px">
      <div style="margin-bottom: 12px; color: #666; font-size: 13px">浅色背景</div>
      <sd-space :size="16">
        <sd-border-beam color-variant="colorful" theme="light">
          <div style="padding: 14px 22px; background: #fff; border-radius: 16px; color: #333"
            >colorful</div
          >
        </sd-border-beam>
        <sd-border-beam color-variant="mono" theme="light">
          <div style="padding: 14px 22px; background: #fff; border-radius: 16px; color: #333"
            >mono</div
          >
        </sd-border-beam>
        <sd-border-beam color-variant="ocean" theme="light">
          <div style="padding: 14px 22px; background: #fff; border-radius: 16px; color: #333"
            >ocean</div
          >
        </sd-border-beam>
        <sd-border-beam color-variant="sunset" theme="light">
          <div style="padding: 14px 22px; background: #fff; border-radius: 16px; color: #333"
            >sunset</div
          >
        </sd-border-beam>
      </sd-space>
    </div>
  </sd-space>
</template>
