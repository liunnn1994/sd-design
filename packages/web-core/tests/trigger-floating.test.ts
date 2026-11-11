import type { MiddlewareState } from '@floating-ui/dom';

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { createTriggerMiddleware } from '../dist/trigger/floating.js';

const defaults = {
  popupOffset: 10,
  position: 'bottom' as const,
  autoFitPosition: true,
  autoFitPopupSize: false,
  showArrow: false,
};

test('trigger middleware preserves placement-specific translation and collision ordering', async () => {
  const middleware = createTriggerMiddleware({ ...defaults, popupTranslate: { bottom: [3, -2] } });
  assert.deepEqual(
    middleware.map((item) => item.name),
    ['offset', 'sdTriggerTranslate', 'flip', 'shift'],
  );
  assert.deepEqual(await middleware[1].fn({ x: 20, y: 40 } as MiddlewareState), { x: 23, y: 38 });
  assert.deepEqual(
    createTriggerMiddleware({ ...defaults, autoFitPosition: false }).map((item) => item.name),
    ['offset'],
  );
});

test('trigger size middleware uses clipping padding and clamps negative available dimensions', () => {
  const middleware = createTriggerMiddleware({ ...defaults, autoFitPopupSize: true });
  const sizing = middleware.find((item) => item.name === 'size')!;
  const properties = new Map<string, string>();
  sizing.options.apply({
    availableWidth: -20,
    availableHeight: 150,
    elements: {
      floating: {
        style: { setProperty: (name: string, value: string) => properties.set(name, value) },
      },
    },
  });
  assert.equal(sizing.options.padding, 8);
  assert.equal(properties.get('--sd-trigger-available-width'), '0px');
  assert.equal(properties.get('--sd-trigger-available-height'), '150px');
});
