<template>
  <sd-button type="primary" @click="visible = true">自定义 PDF 渲染</sd-button>
  <sd-file-previewer
    v-model:visible="visible"
    title="自定义 PDF 渲染"
    type="pdf"
    src="https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf"
  >
    <template #pdf="{ doc, page, numPages, render, prev, next }">
      <div class="pdf-slot">
        <div class="pdf-slot__canvas-wrap">
          <PdfSlotCanvas :doc="doc" :page="page" :render="render" />
        </div>
        <div class="pdf-slot__toolbar">
          <sd-button size="small" :disabled="page <= 1" @click="prev">上一页</sd-button>
          <span class="pdf-slot__page">{{ page }} / {{ numPages }}</span>
          <sd-button size="small" :disabled="page >= numPages" @click="next">下一页</sd-button>
        </div>
      </div>
    </template>
  </sd-file-previewer>
</template>

<script setup lang="ts">
  import type { PDFDocumentProxy } from 'pdfjs-dist';

  import type { PropType } from 'vue';
  import { defineComponent, h, ref, shallowRef, watch } from 'vue';

  const visible = ref(false);

  // 通过 #pdf 插槽拿到 render 方法后，由使用方决定渲染到哪个 canvas，并在翻页时重新渲染。
  const PdfSlotCanvas = defineComponent({
    name: 'PdfSlotCanvas',
    props: {
      doc: { type: Object as PropType<PDFDocumentProxy | null>, default: null },
      page: { type: Number, default: 1 },
      render: {
        type: Function as PropType<(canvas: HTMLCanvasElement, page?: number) => Promise<void>>,
        default: undefined,
      },
    },
    setup(props) {
      const canvasRef = shallowRef<HTMLCanvasElement | null>(null);
      watch(
        () => [props.doc, props.page] as const,
        () => {
          if (canvasRef.value && props.render) void props.render(canvasRef.value, props.page);
        },
        { flush: 'post' },
      );
      return () => h('canvas', { ref: canvasRef, class: 'pdf-slot__canvas' });
    },
  });
</script>

<style scoped>
  .pdf-slot {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: min(720px, 100%);
    height: 100%;
    max-height: 78vh;
  }

  .pdf-slot__canvas-wrap {
    flex: 1;
    display: flex;
    justify-content: center;
    overflow: auto;
    background: #fff;
    border-radius: 8px;
  }

  .pdf-slot__canvas {
    display: block;
  }

  .pdf-slot__toolbar {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    gap: 12px;
  }

  .pdf-slot__page {
    min-width: 64px;
    color: #fff;
    text-align: center;
  }
</style>
