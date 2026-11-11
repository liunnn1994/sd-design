import assert from 'node:assert/strict';
import test from 'node:test';

import { getKvListFieldProps, getKvListKeyProps } from '../dist/kv-list/fields.js';
test('field props retain user placeholders and callbacks but cannot override list disabling', () => {
  const onFocus = () => {};
  const props = { placeholder: 'Custom', disabled: false, onFocus };
  assert.deepEqual(getKvListFieldProps(props, true, 'Default'), { ...props, disabled: true });
  assert.equal(getKvListFieldProps({ disabled: true }, false, 'Default').disabled, true);
  assert.deepEqual(getKvListFieldProps(undefined, false, 'Default'), {
    placeholder: 'Default',
    disabled: false,
  });
});
test('header suggestions are copied per field and explicit data wins over the preset', () => {
  const first = getKvListKeyProps(undefined, false, 'Key', 'http-header');
  const next = getKvListKeyProps(undefined, false, 'Key', 'http-header');
  assert.ok(first.data?.includes('Authorization'));
  assert.notEqual(first.data, next.data);
  assert.equal(getKvListKeyProps(undefined, false, 'Key').data, undefined);
  const data = ['X-Custom'];
  assert.equal(
    getKvListKeyProps({ data, disabled: false }, false, 'Key', 'http-header').data,
    data,
  );
});
