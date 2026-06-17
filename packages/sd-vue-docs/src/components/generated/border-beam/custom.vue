<template>
  <sd-space direction="vertical" :size="20" fill>
    <div style="padding: 24px; background: #0d0d1a; border-radius: 16px">
      <sd-border-beam
        :border-radius="24"
        :strength="1"
        :density="1.5"
        :duration="3"
        color-variant="ocean"
      >
        <div
          style="
            padding: 22px 28px;
            background: #1a1a2e;
            border-radius: 24px;
            color: #e0e0e0;
            min-width: 300px;
          "
        >
          <div style="font-size: 15px; font-weight: 600; margin-bottom: 6px"
            >深色背景 · 自定义参数</div
          >
          <div style="font-size: 12px; opacity: 0.6">圆角 24 · 密度 1.5 · 持续 3s · ocean</div>
        </div>
      </sd-border-beam>
    </div>
    <div style="padding: 24px; background: #e8e8ee; border-radius: 16px">
      <sd-border-beam
        :border-radius="24"
        :strength="1"
        :density="1.5"
        :duration="3"
        theme="light"
        color-variant="sunset"
      >
        <div
          style="
            padding: 22px 28px;
            background: #fff;
            border-radius: 24px;
            color: #333;
            min-width: 300px;
          "
        >
          <div style="font-size: 15px; font-weight: 600; margin-bottom: 6px"
            >浅色背景 · 自定义参数</div
          >
          <div style="font-size: 12px; opacity: 0.5">圆角 24 · 密度 1.5 · 持续 3s · sunset</div>
        </div>
      </sd-border-beam>
    </div>
  </sd-space>
</template>
