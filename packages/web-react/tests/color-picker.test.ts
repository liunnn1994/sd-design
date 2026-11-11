import { ColorPicker as RootColorPicker, ConfigProvider } from '@sdata/web-react';
import { ColorPicker } from '@sdata/web-react/color-picker';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement as h } from 'react';
import { renderToStaticMarkup as render } from 'react-dom/server';

test('ColorPicker public entries render a normalized native input with popup semantics', () => {
  assert.equal(RootColorPicker, ColorPicker);
  const html = render(
    h(ColorPicker, { defaultValue: '#ff0000', format: 'HEX', id: 'picker', className: 'extra' }),
  );
  assert.match(html, /id="picker"/);
  assert.match(html, /sd-color-picker-size-medium extra/);
  assert.match(html, /value="#FF0000"/);
  assert.match(html, /aria-haspopup="dialog"/);
  assert.match(html, /aria-expanded="false"/);
  assert.doesNotMatch(html, /sd-color-picker-panel/);
});

test('ColorPicker custom triggers receive controlled visibility, format and complete color context', () => {
  const html = render(
    h(ColorPicker, {
      value: '#00ff00',
      format: 'HEX',
      enableAlpha: true,
      triggerProps: { popupVisible: true },
      renderTrigger: (state) => {
        assert.equal(state.value, '#00ff00');
        assert.equal(state.displayValue, '#00FF00FF');
        assert.equal(state.format, 'HEX8');
        assert.equal(state.popupVisible, true);
        assert.equal(state.color.green, 255);
        assert.ok(state.previewStyle.backgroundColor);
        return h('button', null, 'Custom');
      },
    }),
  );
  assert.match(html, /Custom/);
});

test('ColorPicker inline readonly panels disable editing and preserve native attributes', () => {
  const html = render(
    h(ColorPicker, {
      hideTrigger: true,
      readonly: 'Locked',
      id: 'panel',
      className: 'extra',
      defaultValue: '#ff0000',
      format: 'RGB',
    }),
  );
  assert.match(html, /id="panel"/);
  assert.match(html, /sd-color-picker-panel-disabled extra/);
  assert.match(html, /disabled=""/);
  assert.doesNotMatch(html, /sd-color-picker-trigger-input/);
});

test('ColorPicker inherits provider swatches and supports a local empty override', () => {
  const inherited = render(
    h(
      ConfigProvider,
      { colorPicker: { swatchColors: ['#ff0000', '#0000ff'] } },
      h(ColorPicker, { hideTrigger: true }),
    ),
  );
  assert.equal((inherited.match(/class="sd-color-picker-color-block"/g) ?? []).length, 2);
  const overridden = render(
    h(
      ConfigProvider,
      { colorPicker: { swatchColors: ['#ff0000'] } },
      h(ColorPicker, { hideTrigger: true, swatchColors: [] }),
    ),
  );
  assert.doesNotMatch(overridden, /sd-color-picker-color-block/);
});

test('ColorPicker renders gradient stops, angle and alpha fields from a gradient value', () => {
  const html = render(
    h(ColorPicker, {
      hideTrigger: true,
      colorModes: ['linear-gradient'],
      format: 'HEX8',
      enableAlpha: true,
      defaultValue: 'linear-gradient(90deg, #ff0000 0%, #0000ff 100%)',
    }),
  );
  assert.equal(
    (
      html.match(
        /class="sd-color-picker-gradient-thumb(?: sd-color-picker-gradient-thumb-active)?"/g,
      ) ?? []
    ).length,
    2,
  );
  assert.match(html, /sd-color-picker-gradient-degree/);
  assert.match(html, /sd-color-picker-control-bar-alpha/);
  assert.match(html, /value="100%"/);
});
