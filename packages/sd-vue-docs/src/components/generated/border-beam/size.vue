<template>
  <sd-space direction="vertical" :size="20" fill>
    <div style="padding: 20px; background: #0d0d1a; border-radius: 16px">
      <div style="margin-bottom: 12px; color: #999; font-size: 13px">深色背景 (theme="dark")</div>
      <sd-space direction="vertical" :size="16" fill>
        <sd-border-beam size="sm">
          <sd-button type="primary" size="small">小尺寸 sm</sd-button>
        </sd-border-beam>
        <sd-border-beam size="md">
          <div style="padding: 18px 24px; background: #1a1a2e; border-radius: 16px; color: #e0e0e0"
            >中尺寸 md（默认）</div
          >
        </sd-border-beam>
        <sd-border-beam size="line">
          <div
            style="
              padding: 18px 24px;
              background: #1a1a2e;
              border-radius: 16px;
              color: #e0e0e0;
              min-width: 300px;
            "
            >线条 line</div
          >
        </sd-border-beam>
        <sd-border-beam size="pulse-inner">
          <div
            style="
              padding: 18px 24px;
              background: #1a1a2e;
              border-radius: 16px;
              color: #e0e0e0;
              min-width: 300px;
            "
            >脉冲内 pulse-inner</div
          >
        </sd-border-beam>
        <sd-border-beam size="pulse-outside">
          <div
            style="
              padding: 18px 24px;
              background: #1a1a2e;
              border-radius: 16px;
              color: #e0e0e0;
              min-width: 300px;
            "
            >脉冲外 pulse-outside</div
          >
        </sd-border-beam>
      </sd-space>
    </div>
    <div style="padding: 20px; background: #e8e8ee; border-radius: 16px">
      <div style="margin-bottom: 12px; color: #666; font-size: 13px">浅色背景 (theme="light")</div>
      <sd-space direction="vertical" :size="16" fill>
        <sd-border-beam size="sm" theme="light">
          <sd-button type="primary" size="small">小尺寸 sm</sd-button>
        </sd-border-beam>
        <sd-border-beam size="md" theme="light">
          <div style="padding: 18px 24px; background: #fff; border-radius: 16px; color: #333"
            >中尺寸 md（默认）</div
          >
        </sd-border-beam>
        <sd-border-beam size="line" theme="light">
          <div
            style="
              padding: 18px 24px;
              background: #fff;
              border-radius: 16px;
              color: #333;
              min-width: 300px;
            "
            >线条 line</div
          >
        </sd-border-beam>
        <sd-border-beam size="pulse-inner" theme="light">
          <div
            style="
              padding: 18px 24px;
              background: #fff;
              border-radius: 16px;
              color: #333;
              min-width: 300px;
            "
            >脉冲内 pulse-inner</div
          >
        </sd-border-beam>
        <sd-border-beam size="pulse-outside" theme="light">
          <div
            style="
              padding: 18px 24px;
              background: #fff;
              border-radius: 16px;
              color: #333;
              min-width: 300px;
            "
            >脉冲外 pulse-outside</div
          >
        </sd-border-beam>
      </sd-space>
    </div>
  </sd-space>
</template>
