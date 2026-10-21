import { Schema, type ValidateMessagesType } from 'b-validate';
import { cloneDeep } from 'es-toolkit';

import type {
  FieldData,
  FieldRule,
  FormItemEventHandler,
  ValidatedError,
  ValidateStatus,
  ValidateTrigger,
} from './types.js';

export function mergeFieldRules(
  own: FieldRule | FieldRule[] | undefined,
  inherited: FieldRule | FieldRule[] | undefined,
  required: boolean,
): FieldRule[] {
  const rules = ([] as FieldRule[]).concat(own ?? inherited ?? []);
  return required && !rules.some((rule) => rule.required) ? [{ required: true }, ...rules] : rules;
}

export function createFieldFoundation(adapter: {
  getField: () => string;
  getLabel: () => string | undefined;
  /** Explicit paths read snapshots; omitted paths read the current validation value. */
  getValue: (field?: string) => unknown;
  setValue: (value: unknown) => void;
  getRules: () => FieldRule[];
  getStatus: () => ValidateStatus | '';
  getMessages: () => ValidateMessagesType | undefined;
  updateState: (field: string, state: { status: ValidateStatus | ''; message: string }) => void;
  defer: (callback: () => void) => void;
  register: () => void;
  unregister: () => void;
}) {
  let initialValue = cloneDeep(adapter.getValue(adapter.getField()));
  let validateDisabled = false;
  let validationId = 0;
  const validateField = (): Promise<ValidatedError | undefined> => {
    if (validateDisabled) {
      return Promise.resolve(undefined);
    }
    const currentValidationId = ++validationId;

    const rules = adapter.getRules();
    if (!adapter.getField() || rules.length === 0) {
      if (adapter.getStatus()) {
        clearValidate();
      }
      return Promise.resolve(undefined);
    }

    const _field = adapter.getField();
    const _label = adapter.getLabel();
    const _value = adapter.getValue();
    adapter.updateState(_field, {
      status: '',
      message: '',
    });

    const schema = new Schema(
      {
        [_field]: rules.map(({ ...rule }) => {
          if (rule.validator) {
            const validator = rule.validator;
            rule.validator = async (value, callback) => {
              try {
                await validator(value, callback);
              } catch (error) {
                callback(
                  error instanceof Error && error.message
                    ? error.message
                    : String(error) || 'Error',
                );
              }
            };
          }
          if (!rule.type && !rule.validator) {
            rule.type = 'string';
          }
          return rule;
        }),
      },
      {
        ignoreEmptyString: true,
        validateMessages: adapter.getMessages(),
      },
    );

    return new Promise((resolve) => {
      schema.validate(
        { [_field]: _value },
        (
          err:
            | Record<
                string,
                { value: unknown; type: string; requiredError?: boolean; message?: string }
              >
            | undefined,
        ) => {
          const hasError = Boolean(err?.[_field]);
          if (currentValidationId === validationId) {
            adapter.updateState(_field, {
              status: hasError ? 'error' : '',
              message: err?.[_field]?.message ?? '',
            });
          }

          const error = hasError
            ? {
                label: _label,
                field: _field,
                value: err![_field].value,
                type: err![_field].type,
                isRequiredError: Boolean(err![_field].requiredError),
                message: err![_field].message ?? '',
              }
            : undefined;

          resolve(error);
        },
      );
    });
  };

  const clearValidate = () => {
    validationId++;
    if (adapter.getField()) {
      adapter.updateState(adapter.getField(), {
        status: '',
        message: '',
      });
    }
  };

  const setField = (data: FieldData) => {
    if (adapter.getField()) {
      validationId++;
      validateDisabled = true;
      if ('value' in data) adapter.setValue(data.value);

      if (data.status || data.message) {
        adapter.updateState(adapter.getField(), {
          status: data.status ?? '',
          message: data.message ?? '',
        });
      }

      adapter.defer(() => {
        validateDisabled = false;
      });
    }
  };

  const resetField = () => {
    clearValidate();
    validateDisabled = true;
    if (adapter.getField()) adapter.setValue(cloneDeep(initialValue));

    adapter.defer(() => {
      validateDisabled = false;
    });
  };

  function mount() {
    if (adapter.getField()) adapter.register();
  }
  function changeField(nextField: string, previousField: string) {
    validationId++;
    if (previousField) adapter.updateState(previousField, { status: '', message: '' });
    initialValue = cloneDeep(adapter.getValue(nextField));
    if (!previousField && nextField) adapter.register();
    else if (previousField && !nextField) adapter.unregister();
  }
  function unmount() {
    clearValidate();
    if (adapter.getField()) adapter.unregister();
  }
  return {
    validate: validateField,
    clearValidate,
    setField,
    resetField,
    mount,
    changeField,
    unmount,
  };
}

export function createValidationEventHandlers(
  triggers: ValidateTrigger[],
  validate: () => unknown,
  defer: (callback: () => void) => void,
): FormItemEventHandler {
  return triggers.reduce((events, trigger) => {
    switch (trigger) {
      case 'change':
        events.onChange = () => {
          validate();
        };
        break;
      case 'input':
        events.onInput = () => {
          defer(() => {
            validate();
          });
        };
        break;
      case 'focus':
        events.onFocus = () => {
          validate();
        };
        break;
      case 'blur':
        events.onBlur = () => {
          validate();
        };
        break;
    }
    return events;
  }, {} as FormItemEventHandler);
}
