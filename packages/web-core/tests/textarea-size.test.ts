import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  getSizeStyles,
  getTextareaHeightLimits,
  getTextareaAutoStyle,
} from '../dist/textarea/size.js';

test('Textarea mirror styles and integer row metrics preserve border and padding rules', () => {
  const values = {
    'line-height': '20.8px',
    'border-width': '1.9px',
    'padding-top': '4.8px',
    'padding-bottom': '5.9px',
    'width': '300px',
  };
  const styles = getSizeStyles({
    getPropertyValue: (key) => values[key as keyof typeof values] ?? '',
  });
  assert.equal(styles.width, '300px');
  assert.equal(Object.keys(styles).length, 18);
  assert.deepEqual(getTextareaHeightLimits(styles, { minRows: 2, maxRows: 4 }), {
    minHeight: 51,
    maxHeight: 91,
  });
  assert.deepEqual(getTextareaHeightLimits(styles, true), { minHeight: 0, maxHeight: 0 });
});

test('Textarea applies minimum then maximum and enables scrolling only above the maximum', () => {
  assert.deepEqual(getTextareaAutoStyle(20, { minHeight: 50, maxHeight: 100 }), {
    height: '50px',
    resize: 'none',
    overflow: 'hidden',
  });
  assert.deepEqual(getTextareaAutoStyle(100, { minHeight: 50, maxHeight: 100 }), {
    height: '100px',
    resize: 'none',
    overflow: 'hidden',
  });
  assert.deepEqual(getTextareaAutoStyle(101, { minHeight: 50, maxHeight: 100 }), {
    height: '100px',
    resize: 'none',
    overflow: 'auto',
  });
  assert.deepEqual(getTextareaAutoStyle(0, { minHeight: 100, maxHeight: 50 }), {
    height: '50px',
    resize: 'none',
    overflow: 'auto',
  });
});
