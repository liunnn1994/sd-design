import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { JsonFormModel, JsonFormAdapter } from '../src/json-form/types.ts';

import {
  normalizeJsonFormField,
  getJsonFormRules,
  getJsonFormColProps,
  getJsonFormPlaceholder,
  getJsonFormComponentProps,
  filterJsonFormSlots,
  resolveJsonFormComponent,
} from '../dist/json-form/field.js';
import {
  createJsonFormFoundation,
  createJsonFormFieldFoundation,
} from '../dist/json-form/foundation.js';
import {
  parseJsonFormPath,
  getJsonFormValue,
  setJsonFormValue,
  translateA2UI_0_9_1ToJsonFormSchemas as translate,
} from '../dist/json-form/schema.js';

test('JsonForm paths preserve pointer escaping, array access and unsafe-path isolation', () => {
  const model: JsonFormModel = { items: [{ value: 1 }] };
  assert.deepEqual(parseJsonFormPath('/a~1b/~0c/', 'a2ui-0.9.1'), ['a/b', '~c', '']);
  assert.equal(getJsonFormValue(model, 'items.0.value'), 1);
  setJsonFormValue(model, '/a~1b/~0c/', 2, 'a2ui-0.9.1');
  assert.equal(getJsonFormValue(model, '/a~1b/~0c/', 'a2ui-0.9.1'), 2);
  for (const path of ['__proto__.polluted', 'constructor.prototype.polluted']) {
    setJsonFormValue(model, path, true);
    assert.equal(getJsonFormValue(model, path), undefined);
  }
  assert.equal(Object.hasOwn(model, '__proto__'), false);
  assert.equal(normalizeJsonFormField('/a.b/x~1y', 'a2ui-0.9.1'), '["a.b"]["x/y"]');
  assert.equal(normalizeJsonFormField('a..b', 'default'), 'a..b');
});

test('JsonForm field writes mutate first and publish a fresh current model', () => {
  let model: JsonFormModel = { user: { name: 'old' } };
  const original = model;
  let published: JsonFormModel | undefined;
  const field = createJsonFormFieldFoundation({
    get model() {
      return model;
    },
    field: 'user.name',
    adapter: 'default',
    onUpdate(value) {
      published = value;
    },
  });
  field.setValue('new');
  assert.equal(field.getValue(), 'new');
  assert.notEqual(published, original);
  assert.equal(published?.user, original.user);
  Object.defineProperty(model, 'swap', {
    enumerable: true,
    set() {
      model = { replacement: true };
    },
  });
  const reentrant = createJsonFormFieldFoundation({
    get model() {
      return model;
    },
    field: 'swap',
    adapter: 'default',
    onUpdate(value) {
      published = value;
    },
  });
  reentrant.setValue(1);
  assert.deepEqual(published, { replacement: true });
});

test('JsonForm model ownership, replacement and adapter precedence remain live', () => {
  let controlled: JsonFormModel | undefined;
  let internal: JsonFormModel = {};
  let localAdapter: JsonFormAdapter | undefined;
  let globalAdapter: JsonFormAdapter | undefined;
  const schemas = [{ field: 'name' }];
  const updates: JsonFormModel[] = [];
  const foundation = createJsonFormFoundation({
    getControlledModel: () => controlled,
    getInternalModel: () => internal,
    setInternalModel: (value) => {
      internal = value;
    },
    wrapModel: (value) => value,
    getAdapter: () => localAdapter,
    getGlobalAdapter: () => globalAdapter,
    getSchemas: () => schemas,
    translate: () => [{ field: 'translated' }],
    onUpdate: (value) => updates.push(value),
  });
  assert.equal(foundation.getSchemas(), schemas);
  const replacement = { name: 'shared' };
  foundation.syncModel(replacement);
  assert.equal(foundation.getWorkingModel(), replacement);
  foundation.publish(replacement);
  assert.equal(updates.length, 0);
  controlled = { name: 'controlled' };
  foundation.syncModel({ ignored: true });
  assert.equal(internal, replacement);
  foundation.publish(controlled);
  assert.equal(updates[0], controlled);
  globalAdapter = 'a2ui-0.9.1';
  assert.deepEqual(foundation.getSchemas(), [{ field: 'translated' }]);
  localAdapter = 'default';
  assert.equal(foundation.getSchemas(), schemas);
});

test('JsonForm explicit rules, zero spans and localization stay intact', () => {
  const explicit: [] = [];
  assert.equal(
    getJsonFormRules({ required: true, formItemRules: explicit }, () => 'unused'),
    explicit,
  );
  assert.deepEqual(
    getJsonFormRules({ required: true, label: 'Name' }, (key, label) => `${key}:${label}`),
    [{ required: true, message: 'jsonForm.requiredField:Name' }],
  );
  assert.deepEqual(getJsonFormColProps({ span: 0 }), { span: 0 });
  const col = { span: 3 };
  assert.equal(getJsonFormColProps({ colProps: col, span: 0 }), col);
  assert.equal(
    getJsonFormPlaceholder('select', 'Role', (key, label) => `${key}:${label}`),
    'jsonForm.selectPlaceholder:Role',
  );
  assert.equal(
    getJsonFormPlaceholder('input', undefined, () => 'unused'),
    undefined,
  );
});

test('JsonForm component policy preserves explicit placeholders, classes and slot overrides', () => {
  const props = { placeholder: '', class: ['custom'] };
  const result = getJsonFormComponentProps({ componentProps: props }, 'test', () => {
    throw new Error('explicit placeholder');
  });
  assert.deepEqual(result, { placeholder: '', class: [['custom'], 'test-control'] });
  assert.deepEqual(props, { placeholder: '', class: ['custom'] });
  assert.deepEqual(
    filterJsonFormSlots(['default', 'label', 'help', 'extra'], ['default'], { help: true }),
    ['label', 'extra'],
  );
  const input = {};
  assert.equal(resolveJsonFormComponent({ input }, 'missing'), input);
});

test('A2UI traversal preserves order, cycle prevention, duplicate-id precedence and lazy prefixes', () => {
  let prefixReads = 0;
  const nodes = [
    { id: 'root', component: 'Column', children: ['row', 'name', 'choice'] },
    { id: 'row', component: 'Row', children: ['name', 'root'] },
    { id: 'name', component: 'TextField', value: { path: '/old' } },
    {
      id: 'name',
      component: 'TextField',
      value: { path: '/name' },
      label: { path: '/label' },
      variant: 'obscured',
    },
    {
      id: 'choice',
      component: 'ChoicePicker',
      value: { path: '/choice' },
      displayStyle: 'chips',
      options: [{ value: 'zero', label: { path: '/label' } }],
    },
  ];
  const output = translate(nodes, { label: 0 }, () => {
    prefixReads++;
    return 'custom';
  });
  assert.equal(prefixReads, 1);
  assert.deepEqual(output[0], {
    field: 'row',
    type: 'row',
    children: [{ field: '/name', label: '0', type: 'inputPassword', componentProps: undefined }],
  });
  assert.deepEqual(output[1]?.componentProps, {
    options: [{ label: '0', value: 'zero' }],
    max: 1,
    class: 'custom-chips',
  });
  assert.deepEqual(
    translate([{ id: 'missing', component: 'TextField', value: { path: '/x' } }]),
    [],
  );
});
