<template>
  <sd-space direction="vertical" :size="16" fill>
    <div style="padding: 24px; background: #0d0d1a; border-radius: 16px">
      <sd-border-beam>
        <div
          style="
            min-width: 280px;
            padding: 20px 28px;
            color: #e0e0e0;
            background: #1a1a2e;
            border-radius: 16px;
          "
        >
          <div style="margin-bottom: 6px; font-weight: 600; font-size: 16px"
            >深色背景 — 旋转光晕</div
          >
          <div style="font-size: 13px; opacity: 0.6">theme="dark"（默认）</div>
        </div>
      </sd-border-beam>
    </div>
    <div style="padding: 24px; background: #e8e8ee; border-radius: 16px">
      <sd-border-beam theme="light">
        <div
          style="
            min-width: 280px;
            padding: 20px 28px;
            color: #333;
            background: #fff;
            border-radius: 16px;
          "
        >
          <div style="margin-bottom: 6px; font-weight: 600; font-size: 16px"
            >浅色背景 — 旋转光晕</div
          >
          <div style="font-size: 13px; opacity: 0.5">theme="light"</div>
        </div>
      </sd-border-beam>
    </div>
  </sd-space>
</template>
