import { cloneDeep } from 'es-toolkit';

import type { FieldData, ValidatedError } from './types.js';

import { isArray } from '../_utils/is.js';

export interface FormField {
  field: string;
  validate: () => Promise<ValidatedError | undefined>;
  clearValidate: () => void;
  resetField: () => void;
  setField: (data: FieldData) => void;
}

export type FormErrors = Record<string, ValidatedError>;
export interface FormAdapter {
  getModel: () => Record<string, unknown>;
  shouldScrollToError: () => boolean;
  scrollToError: (field: string) => void;
  onSubmitFailed: (values: Record<string, unknown>, errors: FormErrors, event: Event) => void;
  onSubmitSuccess: (values: Record<string, unknown>, event: Event) => void;
  onSubmit: (values: Record<string, unknown>, errors: FormErrors | undefined, event: Event) => void;
}

/** Field identity, validation ordering and submission snapshots are shared rules. */
export function createFormFoundation<Field extends FormField = FormField>(adapter: FormAdapter) {
  const fields: Field[] = [];
  function addField(field: Field) {
    if (field && field.field) fields.push(field);
  }
  function removeField(field: Field) {
    const index = fields.indexOf(field);
    if (index !== -1) fields.splice(index, 1);
  }
  function setFields(data: Record<string, FieldData>) {
    fields.forEach((field) => {
      if (data[field.field]) field.setField(data[field.field]);
    });
  }
  function resetFields(field?: string | string[]) {
    const names = field ? ([] as string[]).concat(field) : [];
    fields.forEach((field) => {
      if (!names.length || names.includes(field.field)) field.resetField();
    });
  }
  function clearValidate(field?: string | string[]) {
    const names = field ? ([] as string[]).concat(field) : [];
    fields.forEach((field) => {
      if (!names.length || names.includes(field.field)) field.clearValidate();
    });
  }
  function runValidation(
    names: string | string[] | undefined,
    callback?: (errors: FormErrors | undefined) => void,
  ) {
    const list: Promise<ValidatedError | undefined>[] = [];
    if (names === undefined) {
      fields.forEach((field) => {
        list.push(field.validate());
      });
    } else {
      // Partial validation has always walked the live registry. A validator
      // may synchronously register another requested field before this loop ends.
      for (const field of fields) {
        if ((isArray(names) && names.includes(field.field)) || names === field.field) {
          list.push(field.validate());
        }
      }
    }
    return Promise.all(list).then((results) => {
      const errors: FormErrors = {};
      let hasError = false;
      results.forEach((item) => {
        if (item) {
          hasError = true;
          errors[item.field] = item;
        }
      });
      if (hasError && adapter.shouldScrollToError()) adapter.scrollToError(Object.keys(errors)[0]);
      const result = hasError ? errors : undefined;
      if (typeof callback === 'function') callback(result);
      return result;
    });
  }
  function validate(callback?: (errors: FormErrors | undefined) => void) {
    return runValidation(undefined, callback);
  }
  function validateField(
    field: string | string[],
    callback?: (errors: FormErrors | undefined) => void,
  ) {
    return runValidation(field, callback);
  }
  function submit(event: Event) {
    const values = cloneDeep(adapter.getModel());
    validate().then((errors) => {
      if (errors) adapter.onSubmitFailed(values, errors, event);
      else adapter.onSubmitSuccess(values, event);
      adapter.onSubmit(values, errors, event);
    });
  }
  return {
    fields,
    addField,
    removeField,
    setFields,
    resetFields,
    clearValidate,
    validate,
    validateField,
    submit,
  };
}
