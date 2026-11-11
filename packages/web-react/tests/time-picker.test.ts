import { TimePicker as RootTimePicker } from '@sdata/web-react';
import { TimePicker } from '@sdata/web-react/time-picker';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement as h } from 'react';
import { renderToStaticMarkup as render } from 'react-dom/server';

test('TimePicker public entries preserve formatted values and native attributes', () => {
  assert.equal(RootTimePicker, TimePicker);
  const html = render(
    h(TimePicker, {
      defaultValue: '09:15:30',
      id: 'time',
      inputProps: { 'aria-label': 'Appointment' },
    }),
  );
  assert.match(html, /id="time"/);
  assert.match(html, /value="09:15:30"/);
  assert.match(html, /aria-label="Appointment"/);
  assert.match(html, /aria-haspopup="dialog"/);
  assert.match(html, /aria-expanded="false"/);
});

test('TimePicker range renders both values with native disabled state', () => {
  const html = render(
    h(TimePicker, {
      type: 'time-range',
      value: ['09:00:00', '17:00:00'],
      disabled: true,
    }),
  );
  assert.match(html, /value="09:00:00"/);
  assert.match(html, /value="17:00:00"/);
  assert.equal((html.match(/disabled=""/g) ?? []).length, 2);
  assert.doesNotMatch(html, /sd-picker-clear-icon/);
});

test('TimePicker custom triggers receive controlled range values and dates', () => {
  const html = render(
    h(TimePicker, {
      type: 'time-range',
      value: ['09:00:00', '17:00:00'],
      popupVisible: false,
      renderTrigger: (state) => {
        assert.deepEqual(state.value, ['09:00:00', '17:00:00']);
        assert.deepEqual(state.displayValue, state.value);
        assert.ok(Array.isArray(state.date));
        assert.ok(state.date.every((date) => date instanceof Date));
        assert.equal(state.range, true);
        assert.equal(state.popupVisible, false);
        return h('button', null, 'Choose time');
      },
    }),
  );
  assert.match(html, /Choose time/);
});
