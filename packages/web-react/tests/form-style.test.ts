import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { build } from 'vite';

for (const component of [
  'form',
  'input',
  'textarea',
  'input-number',
  'checkbox',
  'radio',
  'rate',
  'slider',
  'verification-code',
  'input-mask',
  'message',
  'notification',
  'copy',
  'secret',
  'input-tag',
  'select-view',
  'virtual-list',
  'select',
  'pagination',
  'auto-complete',
  'modal',
  'model-selector',
  'list',
  'carousel',
  'mention',
  'selectable-card',
  'qr-code',
  'typography',
  'skeleton-reveal',
  'thinking-orb',
  'liquid-glass-logo',
  'border-beam',
  'voice-glow',
  'bloom-menu',
  'kv-list',
  'panel-group',
  'icon',
  'icon-component',
  'image',
  'transfer',
  'tour',
  'cropper',
])
  test(`${component} standalone styles include base icons and component dependencies`, async () => {
    const result = await build({
      configFile: false,
      logLevel: 'silent',
      root: fileURLToPath(new URL('..', import.meta.url)),
      build: {
        write: false,
        minify: false,
        cssMinify: false,
        lib: {
          entry: fileURLToPath(new URL(`./fixtures/${component}-style.ts`, import.meta.url)),
          formats: ['es'],
        },
      },
    });
    const css = (Array.isArray(result) ? result : [result])
      .flatMap((item) => ('output' in item ? item.output : []))
      .filter((item) => item.type === 'asset' && item.fileName.endsWith('.css'))
      .map((item) => (item.type === 'asset' ? String(item.source) : ''))
      .join('\n');
    assert.match(css, /\.sd-icon\s*\{/);
    assert.match(css, /--sd-color-white:/);
    if (component === 'form') assert.match(css, /\.sd-row\s*\{/);
    else if (component === 'input') {
      assert.match(css, /:focus-within \.sd-input-clear-btn/);
      assert.match(css, /\.sd-btn-primary/);
    } else if (component === 'textarea') assert.match(css, /\.sd-textarea-mirror/);
    else if (component === 'input-number') assert.match(css, /\.sd-input-number-step/);
    else if (component === 'model-selector') {
      assert.match(css, /\.sd-model-selector-group-content--collapsed/);
      assert.match(css, /\.sd-input-wrapper/);
      assert.match(css, /\.sd-modal-container/);
      assert.match(css, /\.os-scrollbar/);
    } else if (component === 'slider') {
      assert.match(css, /\.sd-slider-track/);
      assert.match(css, /\.sd-input-number/);
    } else if (component === 'icon' || component === 'icon-component') {
      assert.match(css, /\.sd-icon-spin/);
      assert.match(css, /\.sd-icon-loading/);
    } else if (component === 'cropper') {
      assert.match(css, /\.sd-cropper\s*\{/);
      assert.match(css, /\.sd-cropper-source-image/);
    } else if (component === 'tour') {
      assert.match(css, /\.driver-overlay/);
      assert.match(css, /\.driver-popover/);
      assert.match(css, /\.driver-popover-next-btn/);
    } else if (component === 'transfer') {
      assert.match(css, /\.sd-transfer-view/);
      assert.match(css, /\.sd-checkbox/);
      assert.match(css, /\.sd-input-wrapper/);
      assert.match(css, /\.sd-list/);
      assert.match(css, /\.os-scrollbar/);
    } else if (component === 'image') {
      assert.match(css, /\.sd-image-preview-wrapper/);
      assert.match(css, /\.sd-image-footer/);
      assert.match(css, /\.image-fade-enter-active/);
    } else if (component === 'panel-group') {
      assert.match(css, /\.sd-panel-separator-grip/);
      assert.match(css, /\.sd-resizebox-trigger-icon-wrapper/);
    } else if (component === 'kv-list') {
      assert.match(css, /\.sd-kv-list-row/);
      assert.match(css, /\.sd-input-wrapper/);
      assert.match(css, /\.sd-textarea-mirror/);
      assert.match(css, /\.sd-trigger-popup/);
    } else if (component === 'bloom-menu') {
      assert.match(css, /\.sd-bloom-menu-panel/);
      assert.match(css, /\.sd-trigger-popup/);
      assert.match(css, /\.sd-btn-primary/);
    } else if (component === 'voice-glow') {
      assert.match(css, /\.sd-voice-glow\s*\{/);
      assert.match(css, /\.sd-voice-glow-filter/);
    } else if (component === 'border-beam') assert.match(css, /\.sd-border-beam\s*\{/);
    else if (component === 'liquid-glass-logo') {
      assert.match(css, /\.sd-liquid-glass-logo-fallback/);
      assert.match(css, /--sd-liquid-glass-logo-auto-width/);
    } else if (component === 'thinking-orb') assert.match(css, /\.sd-thinking-orb\s*\{/);
    else if (component === 'skeleton-reveal') {
      assert.match(css, /\.sd-skeleton-reveal-overlay/);
      assert.match(css, /prefers-reduced-motion/);
    } else if (component === 'typography') {
      assert.match(css, /\.sd-typography-operation-copy/);
      assert.match(css, /\.sd-input-wrapper/);
      assert.match(css, /\.sd-popover-content/);
    } else if (component === 'qr-code') {
      assert.match(css, /\.sd-qr-code-cover/);
      assert.match(css, /\.sd-spin-icon/);
      assert.match(css, /\.sd-dot-loading/);
    } else if (component === 'selectable-card') {
      assert.match(css, /\.sd-selectable-card--selected/);
      assert.match(css, /\.sd-selectable-card-input/);
      assert.match(css, /\.sd-selectable-card--color-green/);
    } else if (component === 'mention') {
      assert.match(css, /\.sd-mention-measure/);
      assert.match(css, /\.sd-select-option/);
      assert.match(css, /\.sd-textarea/);
    } else if (component === 'carousel') {
      assert.match(css, /\.sd-carousel-slide/);
      assert.match(css, /\.sd-carousel-indicator/);
      assert.match(css, /\.sd-carousel-arrow/);
    } else if (component === 'list') {
      assert.match(css, /\.sd-list-item-meta/);
      assert.match(css, /\.sd-pagination/);
      assert.match(css, /\.sd-virtual-list-scroller/);
      assert.match(css, /\.sd-row/);
    } else if (component === 'modal') {
      assert.match(css, /\.sd-modal-wrapper/);
      assert.match(css, /\.sd-btn-primary/);
      assert.match(css, /\.zoom-modal-enter-active/);
    } else if (component === 'auto-complete') {
      assert.match(css, /\.sd-auto-complete-dropdown/);
      assert.match(css, /\.sd-select-option/);
      assert.match(css, /\.sd-input-wrapper/);
    } else if (component === 'pagination') {
      assert.match(css, /\.sd-pagination-item/);
      assert.match(css, /\.sd-select-option/);
      assert.match(css, /\.sd-input-number/);
    } else if (component === 'select') {
      assert.match(css, /\.sd-select-option/);
      assert.match(css, /\.sd-select-view-single/);
      assert.match(css, /\.sd-checkbox/);
      assert.match(css, /\.os-scrollbar/);
    } else if (component === 'virtual-list') {
      assert.match(css, /\.sd-virtual-list-scroller/);
      assert.match(css, /\.os-scrollbar/);
    } else if (component === 'select-view') {
      assert.match(css, /\.sd-select-view-single/);
      assert.match(css, /\.sd-select-view-multiple/);
      assert.match(css, /\.sd-input-label/);
    } else if (component === 'input-tag') {
      assert.match(css, /\.sd-input-tag-inner/);
      assert.match(css, /\.sd-tag-close-btn/);
      assert.match(css, /\.input-tag-zoom-leave-active/);
    } else if (component === 'copy' || component === 'secret') {
      assert.match(css, /\.sd-copy-feedback/);
      assert.match(css, /\.sd-message-list/);
      assert.match(css, /\.sd-btn-primary/);
      if (component === 'secret') assert.match(css, /\.sd-secret-placeholder/);
    } else if (component === 'message' || component === 'notification')
      assert.ok(css.includes(`.sd-${component}-list`));
    else if (component === 'input-mask') {
      assert.match(css, /\.sd-input-mask/);
      assert.match(css, /\.sd-input-wrapper/);
    } else if (component === 'verification-code') {
      assert.match(css, /\.sd-verification-code/);
      assert.match(css, /\.sd-input-wrapper/);
    } else if (component === 'rate') assert.match(css, /\.sd-rate-character/);
    else assert.ok(css.includes(`.sd-${component}-icon`));
    if (
      ![
        'checkbox',
        'radio',
        'message',
        'notification',
        'virtual-list',
        'carousel',
        'selectable-card',
        'qr-code',
        'skeleton-reveal',
        'thinking-orb',
        'liquid-glass-logo',
        'border-beam',
        'voice-glow',
        'bloom-menu',
        'kv-list',
        'panel-group',
        'icon',
        'icon-component',
        'tour',
        'cropper',
      ].includes(component)
    )
      assert.match(css, /\.sd-tooltip-content\s*\{/);
  });
