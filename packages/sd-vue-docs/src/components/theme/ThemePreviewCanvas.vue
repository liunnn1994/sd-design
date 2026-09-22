<script setup lang="ts">
  import { useId, useTemplateRef } from 'vue';

  import { usePreviewCanvas } from './usePreviewCanvas';

  const pageWidth = 1160;
  const viewport = useTemplateRef<SVGSVGElement>('viewport');
  const content = useTemplateRef<HTMLElement>('content');
  const helpId = useId();
  const { scale, matrix, height, hand, space, dragging, fit, zoom } = usePreviewCanvas(
    viewport,
    content,
    pageWidth,
  );
</script>

<template>
  <section class="preview-canvas" data-testid="preview-canvas">
    <sd-space class="canvas-toolbar" wrap>
      <sd-button :type="hand ? 'primary' : 'secondary'" :aria-pressed="hand" @click="hand = !hand"
        >抓手</sd-button
      >
      <sd-button aria-label="缩小画布" :disabled="scale <= 0.1" @click="zoom(scale / 1.2)"
        >−</sd-button
      >
      <sd-button aria-label="恢复画布实际尺寸" @click="zoom(1)"
        >{{ Math.round(scale * 100) }}%</sd-button
      >
      <sd-button aria-label="放大画布" :disabled="scale >= 2" @click="zoom(scale * 1.2)"
        >+</sd-button
      >
      <sd-button @click="fit">适应宽度</sd-button>
      <sd-tag>1160 px 页面</sd-tag>
    </sd-space>
    <svg
      ref="viewport"
      class="canvas-viewport"
      :class="{ 'is-hand': hand || space, 'is-dragging': dragging }"
      tabindex="0"
      role="group"
      aria-label="业务页面预览画布"
      :aria-describedby="helpId"
      data-testid="canvas-viewport"
    >
      <g :transform="matrix" data-testid="canvas-transform">
        <foreignObject :width="pageWidth" :height="height">
          <div ref="content" xmlns="http://www.w3.org/1999/xhtml" class="canvas-page"><slot /></div>
        </foreignObject>
      </g>
    </svg>
    <sd-typography-text :id="helpId" type="secondary" class="canvas-help">
      空白处拖动 · 抓手模式可拖动页面 · Ctrl/⌘ + 滚轮缩放。聚焦画布后：空格拖动，方向键平移，+/−
      缩放，0 适应宽度，Esc 退出抓手。
    </sd-typography-text>
  </section>
</template>

<style scoped lang="scss">
  .preview-canvas {
    overflow: hidden;
    color: var(--sd-color-text-1);
    background: var(--sd-color-bg-2);
    border: 1px solid var(--sd-color-border-2);
    border-radius: var(--sd-border-radius-medium);
  }

  .canvas-toolbar {
    padding: 12px;
    border-bottom: 1px solid var(--sd-color-border-2);
  }

  .canvas-viewport {
    display: block;
    width: 100%;
    height: clamp(480px, 68vh, 800px);
    background: var(--sd-color-fill-2);
    outline-offset: -2px;
  }

  .canvas-viewport:focus-visible {
    outline: 2px solid rgb(var(--sd-primary-6));
  }

  .canvas-viewport.is-hand {
    cursor: grab;
    touch-action: none;
  }

  .canvas-viewport.is-dragging {
    cursor: grabbing;
    user-select: none;
  }

  .canvas-page {
    width: 100%;
    color: var(--sd-color-text-1);
    font-size: 14px;
    line-height: 1.5;
    background: var(--sd-color-bg-2);
  }

  .canvas-help {
    display: block;
    padding: 12px;
    font-size: 12px;
  }
</style>
