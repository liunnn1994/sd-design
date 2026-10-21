import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { CheckboxModelValue, CheckboxValue } from '../src/checkbox/foundation.ts';
import type { SwitchBeforeChange, SwitchValue } from '../src/switch/foundation.ts';

import { normalizeChoiceOptions } from '../dist/_utils/choice-options.js';
import {
  createCheckboxFoundation,
  createCheckboxGroupFoundation,
  getCheckboxChecked,
  getCheckboxDisabled,
} from '../dist/checkbox/foundation.js';
import { createRadioFoundation, createRadioGroupFoundation } from '../dist/radio/foundation.js';
import { createSwitchFoundation } from '../dist/switch/foundation.js';

test('Choice options normalize primitive labels and preserve opaque render functions and object identity', () => {
  const label = () => {
    throw new Error('rendering belongs to the view');
  };
  const option = { value: 'a', label, disabled: true };
  const normalized = normalizeChoiceOptions([0, '', option]);
  assert.deepEqual(normalized.slice(0, 2), [
    { label: 0, value: 0 },
    { label: '', value: '' },
  ]);
  assert.equal(normalized[2], option);
  assert.deepEqual(normalizeChoiceOptions(undefined), []);
  assert.equal(normalizeChoiceOptions([NaN])[0], NaN);
});

function checkboxSetup(group = false) {
  let value: CheckboxModelValue = [false, 'a', 'a'];
  let local = false;
  const events: unknown[][] = [];
  const foundation = createCheckboxFoundation<string>({
    getValue: () => value,
    getResolvedValue: () => false,
    isGroup: () => group,
    setInternalChecked: (checked) => {
      local = checked;
      events.push(['local', checked]);
    },
    onGroupChange: (value, event) => events.push(['group', value, event]),
    onUpdate: (value) => events.push(['update', value]),
    onChange: (value, event) => events.push(['change', value, event]),
    onFormChange: (event) => events.push(['form', event]),
    afterChange: () => events.push(['after']),
  });
  return {
    foundation,
    events,
    setValue: (next: CheckboxModelValue) => {
      value = next;
    },
    getLocal: () => local,
  };
}

test('Checkbox array changes deduplicate without mutating the input and publish in native repair order', () => {
  const { foundation, events, getLocal } = checkboxSetup();
  foundation.change(false, 'native');
  assert.equal(getLocal(), false);
  assert.deepEqual(events, [
    ['local', false],
    ['update', ['a']],
    ['change', ['a'], 'native'],
    ['form', 'native'],
    ['after'],
  ]);
  assert.equal(events[1][1], events[2][1]);
});

test('Checkbox group routes array values through context while standalone booleans retain their own events', () => {
  const { foundation, events, setValue } = checkboxSetup(true);
  foundation.change(true, 'native');
  assert.deepEqual(events, [['local', true], ['group', [false, 'a'], 'native'], ['after']]);
  events.length = 0;
  setValue(false);
  foundation.change(true, 'native');
  assert.deepEqual(
    events.map((event) => event[0]),
    ['local', 'update', 'change', 'form', 'after'],
  );
  foundation.syncModel(null);
  assert.deepEqual(events.at(-1), ['local', false]);
});

test('Checkbox checked and maximum rules retain false/zero keys and allow selected items to be unchecked', () => {
  assert.equal(getCheckboxChecked([false, 0], false), true);
  assert.equal(getCheckboxChecked([false, 0], 0), true);
  assert.equal(getCheckboxChecked(false, true), false);
  assert.equal(getCheckboxDisabled(false, false, true, true), false);
  assert.equal(getCheckboxDisabled(false, false, false, true), true);
  assert.equal(getCheckboxDisabled(true, false, true, false), true);
});

test('Checkbox Group preserves controlled ownership, sync copies and callback semantics at maximum', () => {
  let model: CheckboxValue[] | undefined = [];
  let internal: CheckboxValue[] = ['local'];
  const events: string[] = [];
  const foundation = createCheckboxGroupFoundation<string>({
    getModel: () => model,
    getInternal: () => internal,
    getMax: () => 0,
    setInternal: (value) => {
      internal = value;
      events.push('local');
    },
    onUpdate: () => events.push('update'),
    onChange: () => events.push('change'),
    onFormChange: () => events.push('form'),
  });
  assert.equal(foundation.getValue(), model);
  assert.equal(foundation.isMaxed(), true);
  foundation.change(['a'], 'native');
  assert.deepEqual(events, ['local', 'update', 'change', 'form']);
  assert.deepEqual(foundation.getValue(), []);
  const next = ['b'];
  foundation.syncModel(next);
  assert.deepEqual(internal, next);
  assert.notEqual(internal, next);
  model = undefined;
  assert.equal(foundation.isChecked('b'), true);
  foundation.syncModel(undefined);
  assert.deepEqual(foundation.getValue(), []);
});

test('Radio preserves group priority, false values and live value reads during event publication', () => {
  let group = false;
  let model: string | number | boolean | undefined;
  let resolved: string | number | boolean = false;
  let internal = true;
  const events: unknown[][] = [];
  const foundation = createRadioFoundation<string>({
    isGroup: () => group,
    getGroupValue: () => 0,
    getModel: () => model,
    getInternalChecked: () => internal,
    getResolvedValue: () => resolved,
    setInternalChecked: (value) => {
      internal = value;
      events.push(['local', value]);
    },
    onGroupChange: (value, event) => events.push(['group', value, event]),
    onUpdate: (value) => {
      events.push(['update', value]);
      resolved = 'changed';
    },
    onChange: (value, event) => events.push(['change', value, event]),
    onFormChange: () => events.push(['form']),
    afterChange: () => events.push(['after']),
  });
  assert.equal(foundation.isChecked(), true);
  model = false;
  assert.equal(foundation.isChecked(), true);
  foundation.change('native');
  assert.deepEqual(events, [
    ['local', true],
    ['update', false],
    ['change', 'changed', 'native'],
    ['form'],
    ['after'],
  ]);
  group = true;
  resolved = 0;
  assert.equal(foundation.isChecked(), true);
  events.length = 0;
  foundation.change('native');
  assert.deepEqual(events, [['local', true], ['group', 0, 'native'], ['after']]);
  foundation.syncModel(undefined);
  assert.equal(internal, false);
});

test('Radio Group increments the repair generation before local/model/change/form and resets released models', () => {
  let internal: string | number | boolean = 'initial';
  let model: string | number | boolean | undefined = false;
  const events: string[] = [];
  const foundation = createRadioGroupFoundation<string>({
    getModel: () => model,
    getInternal: () => internal,
    setInternal: (value) => {
      internal = value;
      events.push('local');
    },
    incrementChangeCount: () => events.push('generation'),
    onUpdate: () => events.push('update'),
    onChange: () => events.push('change'),
    onFormChange: () => events.push('form'),
  });
  assert.equal(foundation.getValue(), false);
  foundation.change(false, 'native');
  assert.deepEqual(events, ['generation', 'local', 'update', 'change', 'form']);
  foundation.syncValue(false);
  assert.equal(events.length, 5);
  foundation.syncModel(null);
  model = undefined;
  assert.equal(foundation.getValue(), '');
});

function switchSetup() {
  let local: SwitchValue = 'off';
  let model: SwitchValue | undefined;
  let checkedValue: SwitchValue = 'on';
  let disabled = false;
  let loading = false;
  let beforeLoading = false;
  let autoLoading = false;
  let auto = false;
  let hasLoading = false;
  let hasModel = false;
  let before: SwitchBeforeChange | undefined;
  const events: unknown[][] = [];
  const foundation = createSwitchFoundation<string>({
    getCheckedValue: () => checkedValue,
    getUncheckedValue: () => 'off',
    getModel: () => model,
    getInternal: () => local,
    setInternal: (value) => {
      local = value;
      events.push(['local', value]);
    },
    isDisabled: () => disabled,
    isLoading: () => loading || beforeLoading || autoLoading,
    isAutoLoading: () => auto,
    hasLoadingProp: () => hasLoading,
    hasModelProp: () => hasModel,
    getBeforeChange: () => before,
    setBeforeLoading: (value) => {
      beforeLoading = value;
      events.push(['before', value]);
    },
    setAutoLoading: (value) => {
      autoLoading = value;
      events.push(['auto', value]);
    },
    onUpdate: (value) => events.push(['update', value]),
    onChange: (value, event) => events.push(['change', value, event]),
    onFormChange: () => events.push(['form']),
  });
  return {
    foundation,
    events,
    setBefore: (value: SwitchBeforeChange) => {
      before = value;
    },
    setDisabled: (value: boolean) => {
      disabled = value;
    },
    setLoading: (value: boolean) => {
      loading = value;
    },
    setModel: (value: SwitchValue | undefined) => {
      model = value;
    },
    setCheckedValue: (value: SwitchValue) => {
      checkedValue = value;
    },
    setBindings: (nextAuto: boolean, nextLoading: boolean, nextModel: boolean) => {
      auto = nextAuto;
      hasLoading = nextLoading;
      hasModel = nextModel;
    },
    getLocal: () => local,
    getLoading: () => beforeLoading || autoLoading,
  };
}

test('Switch toggles custom values and publishes local/update/change/form synchronously without a hook', async () => {
  const { foundation, events, setDisabled, setLoading } = switchSetup();
  const promise = foundation.click('native');
  assert.deepEqual(events, [
    ['local', 'on'],
    ['update', 'on'],
    ['change', 'on', 'native'],
    ['form'],
  ]);
  await promise;
  assert.equal(foundation.isChecked(), true);
  setDisabled(true);
  await foundation.click('disabled');
  setDisabled(false);
  setLoading(true);
  await foundation.click('loading');
  assert.equal(events.length, 4);
});

test('Switch hook veto and rejection clear loading and suppress model publication', async () => {
  for (const before of [() => false, () => Promise.reject(new Error('veto'))]) {
    const { foundation, events, setBefore, getLoading, getLocal } = switchSetup();
    setBefore(before);
    await foundation.click('native');
    assert.deepEqual(events, [
      ['before', true],
      ['before', false],
    ]);
    assert.equal(getLoading(), false);
    assert.equal(getLocal(), 'off');
  }
});

test('Switch suppresses repeated pending clicks and rechecks disabled state after the hook', async () => {
  const { foundation, events, setBefore, setDisabled, getLocal } = switchSetup();
  let resolve!: (value: boolean) => void;
  setBefore(
    () =>
      new Promise<boolean>((done) => {
        resolve = done;
      }),
  );
  const pending = foundation.click('first');
  await foundation.click('second');
  setDisabled(true);
  resolve(true);
  await pending;
  assert.equal(getLocal(), 'off');
  assert.deepEqual(events, [
    ['before', true],
    ['before', false],
  ]);
});

test('Switch accepts void hook results and uses current mapped values when an async hook completes', async () => {
  const { foundation, events, setBefore, setCheckedValue } = switchSetup();
  let resolve!: () => void;
  setBefore((value) => {
    assert.equal(value, 'on');
    return new Promise<void>((done) => {
      resolve = done;
    });
  });
  const pending = foundation.click('native');
  setCheckedValue('new-on');
  resolve();
  await pending;
  assert.deepEqual(events, [
    ['before', true],
    ['local', 'new-on'],
    ['update', 'new-on'],
    ['change', 'new-on', 'native'],
    ['form'],
    ['before', false],
  ]);
});

test('Switch auto loading follows explicit binding presence and released-model synchronization', async () => {
  const { foundation, setBindings, getLoading, setModel, getLocal } = switchSetup();
  setBindings(true, false, true);
  setModel('off');
  await foundation.click('native');
  assert.equal(getLoading(), true);
  assert.equal(foundation.isChecked(), false);
  foundation.resetAutoLoading();
  assert.equal(getLoading(), false);
  await foundation.click('again');
  setBindings(true, true, true);
  foundation.syncAutoLoading();
  assert.equal(getLoading(), false);
  await foundation.click('explicit loading');
  assert.equal(getLoading(), false);
  foundation.syncModel(undefined);
  assert.equal(getLocal(), 'off');
});
