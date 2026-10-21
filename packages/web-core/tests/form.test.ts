import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { FormErrors } from '../src/form/foundation.ts';
import type { FieldRule, ValidatedError, ValidateStatus } from '../src/form/types.ts';

import {
  createFieldFoundation,
  createValidationEventHandlers,
  mergeFieldRules,
} from '../dist/form/field.js';
import { createFormFoundation } from '../dist/form/foundation.js';

const error = (field: string): ValidatedError => ({
  field,
  value: field,
  type: 'string',
  isRequiredError: false,
  message: `${field} failed`,
});
function formHarness() {
  const model = { nested: { value: 'Original' } };
  const events: string[] = [];
  const scrolled: string[] = [];
  let scroll = true;
  const done = Promise.withResolvers<{
    values: Record<string, unknown>;
    errors: FormErrors | undefined;
    event: Event;
  }>();
  const form = createFormFoundation({
    getModel: () => model,
    shouldScrollToError: () => scroll,
    scrollToError: (field) => scrolled.push(field),
    onSubmitFailed: () => {
      events.push('failed');
    },
    onSubmitSuccess: () => {
      events.push('success');
    },
    onSubmit: (values, errors, event) => {
      events.push('submit');
      done.resolve({ values, errors, event });
    },
  });
  return {
    form,
    model,
    events,
    scrolled,
    done,
    setScroll: (value: boolean) => {
      scroll = value;
    },
  };
}
function registeredField(
  field: string,
  validate = () => Promise.resolve<ValidatedError | undefined>(undefined),
) {
  const calls: string[] = [];
  return {
    field,
    calls,
    validate,
    clearValidate: () => {
      calls.push('clear');
    },
    resetField: () => {
      calls.push('reset');
    },
    setField: () => {
      calls.push('set');
    },
  };
}

test('Form registry preserves field identity and selective reset/clear/set semantics', async () => {
  const { form } = formHarness();
  const first = registeredField('same');
  const second = registeredField('same');
  form.addField(registeredField(''));
  form.addField(first);
  form.addField(second);
  form.removeField(first);
  assert.deepEqual(form.fields, [second]);
  form.setFields({ same: { value: 'assigned' } });
  form.resetFields('other');
  form.clearValidate([]);
  form.resetFields(['same']);
  assert.deepEqual(first.calls, []);
  assert.deepEqual(second.calls, ['set', 'clear', 'reset']);
  assert.equal(await form.validateField([]), undefined);
});

test('parallel field errors keep registration order even when completion and registration change', async () => {
  const { form, scrolled } = formHarness();
  const one = Promise.withResolvers<ValidatedError | undefined>();
  const two = Promise.withResolvers<ValidatedError | undefined>();
  const first = registeredField('first', () => one.promise);
  form.addField(first);
  form.addField(registeredField('second', () => two.promise));
  let reported: FormErrors | undefined;
  const pending = form.validate((errors) => {
    reported = errors;
  });
  form.removeField(first);
  two.resolve(error('second'));
  one.resolve(error('first'));
  const errors = await pending;
  assert.deepEqual(Object.keys(errors!), ['first', 'second']);
  assert.equal(reported, errors);
  assert.deepEqual(scrolled, ['first']);
});

test('submit captures model values before awaiting validation and keeps failure/event ordering', async () => {
  const { form, model, done, events } = formHarness();
  const validation = Promise.withResolvers<ValidatedError | undefined>();
  form.addField(registeredField('nested.value', () => validation.promise));
  const event = new Event('submit');
  form.submit(event);
  model.nested.value = 'Edited while pending';
  validation.resolve(error('nested.value'));
  const result = await done.promise;
  assert.deepEqual(result.values, { nested: { value: 'Original' } });
  assert.equal(result.event, event);
  assert.deepEqual(events, ['failed', 'submit']);
});

function fieldHarness(value: unknown = 'Original', rules: FieldRule[] = []) {
  const state = { field: 'first', label: 'First label', value, rules };
  const statuses = new Map<string, { status: ValidateStatus | ''; message: string }>();
  const deferred: (() => void)[] = [];
  const registrations: string[] = [];
  const foundation = createFieldFoundation({
    getField: () => state.field,
    getLabel: () => state.label,
    getValue: () => state.value,
    setValue: (value) => {
      state.value = value;
    },
    getRules: () => state.rules,
    getStatus: () => statuses.get(state.field)?.status ?? '',
    getMessages: () => undefined,
    updateState: (field, status) => {
      statuses.set(field, status);
    },
    defer: (callback) => {
      deferred.push(callback);
    },
    register: () => {
      registrations.push('add');
    },
    unregister: () => {
      registrations.push('remove');
    },
  });
  return {
    state,
    statuses,
    registrations,
    foundation,
    flush: () => {
      deferred.splice(0).forEach((callback) => callback());
    },
  };
}
function pendingRule() {
  let finish!: (message?: string) => void;
  const rule: FieldRule = {
    validator: (_value, report) =>
      new Promise<void>((resolve) => {
        finish = (message) => {
          report(message);
          resolve();
        };
      }),
  };
  return { rule, finish: (message?: string) => finish(message) };
}

test('field validation returns its original identity without publishing a stale state after path change', async () => {
  const pending = pendingRule();
  const { foundation, state, statuses } = fieldHarness('Original', [pending.rule]);
  const validation = foundation.validate();
  state.field = 'second';
  state.label = 'Second label';
  state.value = 'Changed';
  foundation.changeField('second', 'first');
  pending.finish('Original error');
  assert.deepEqual(await validation, {
    label: 'First label',
    field: 'first',
    value: 'Original',
    type: 'custom',
    isRequiredError: false,
    message: 'Original error',
  });
  assert.deepEqual(statuses.get('first'), { status: '', message: '' });
  assert.equal(statuses.has('second'), false);
  assert.equal(pending.rule.type, undefined);
});

test('manual field state invalidates older validation and suppresses validation until the adapter flushes', async () => {
  const pending = pendingRule();
  const { foundation, statuses, flush } = fieldHarness('Original', [pending.rule]);
  const validation = foundation.validate();
  foundation.setField({ status: 'error', message: 'Server error' });
  assert.equal(await foundation.validate(), undefined);
  pending.finish('Obsolete error');
  await validation;
  assert.deepEqual(statuses.get('first'), { status: 'error', message: 'Server error' });
  flush();
  const fresh = foundation.validate();
  pending.finish();
  assert.equal(await fresh, undefined);
  assert.deepEqual(statuses.get('first'), { status: '', message: '' });
});

test('field reset clones its initial value on every reset and lifecycle invalidation is framework-independent', () => {
  const { foundation, state, flush, registrations } = fieldHarness({ nested: ['initial'] });
  foundation.mount();
  (state.value as { nested: string[] }).nested.push('edit');
  foundation.resetField();
  flush();
  assert.deepEqual(state.value, { nested: ['initial'] });
  (state.value as { nested: string[] }).nested.push('again');
  foundation.resetField();
  flush();
  assert.deepEqual(state.value, { nested: ['initial'] });
  state.field = '';
  foundation.changeField('', 'first');
  state.field = 'second';
  foundation.changeField('second', '');
  foundation.unmount();
  assert.deepEqual(registrations, ['add', 'remove', 'add', 'remove']);
});

test('rule precedence and input scheduling retain adapter contracts', () => {
  const inherited = { required: true };
  assert.deepEqual(mergeFieldRules([], inherited, false), []);
  assert.deepEqual(mergeFieldRules(undefined, inherited, true), [inherited]);
  const tasks: (() => void)[] = [];
  let validated = 0;
  const handlers = createValidationEventHandlers(
    ['input', 'blur'],
    () => {
      validated++;
    },
    (callback) => {
      tasks.push(callback);
    },
  );
  handlers.onInput!();
  assert.equal(validated, 0);
  handlers.onBlur!();
  assert.equal(validated, 1);
  tasks[0]();
  assert.equal(validated, 2);
});

test('path-change reset snapshots use the requested path even when publishing old state changes the current field', () => {
  let field = 'second';
  const values: Record<string, unknown> = { first: 'First', second: 'Second', third: 'Third' };
  const foundation = createFieldFoundation({
    getField: () => field,
    getLabel: () => undefined,
    getValue: (name) => values[name ?? field],
    setValue: (value) => {
      values[field] = value;
    },
    getRules: () => [],
    getStatus: () => '',
    getMessages: () => undefined,
    updateState: (name) => {
      if (name === 'first') field = 'third';
    },
    defer: (callback) => callback(),
    register: () => {},
    unregister: () => {},
  });
  foundation.changeField('second', 'first');
  field = 'second';
  values.second = 'Edited';
  foundation.resetField();
  assert.equal(values.second, 'Second');
});

test('validateField visits matching fields registered synchronously during validation while validate keeps its initial iteration', async () => {
  for (const targeted of [true, false]) {
    const { form } = formHarness();
    const late = registeredField('late', () => Promise.resolve(error('late')));
    const first = registeredField('first', () => {
      if (!form.fields.includes(late)) form.addField(late);
      return Promise.resolve(undefined);
    });
    form.addField(first);
    const result = await (targeted ? form.validateField(['first', 'late']) : form.validate());
    assert.equal(result?.late?.message, targeted ? 'late failed' : undefined);
  }
});
