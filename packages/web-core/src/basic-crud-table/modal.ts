import type { UnknownRecord } from 'type-fest';

import { cloneDeep } from 'es-toolkit';

import type { BasicCrudTableModalSubmitContext, MaybePromise } from './types.js';
export interface BasicCrudModalFoundationState<Row extends Record<string, unknown>> {
  readonly props: {
    readonly createApi: ((data: UnknownRecord) => MaybePromise<unknown>) | undefined;
    readonly updateApi: ((data: UnknownRecord) => MaybePromise<unknown>) | undefined;
    readonly detailApi: ((row: Row) => MaybePromise<UnknownRecord>) | undefined;
    readonly valueTransformer: ((data: UnknownRecord) => UnknownRecord) | undefined;
    readonly beforeSubmit:
      | ((context: BasicCrudTableModalSubmitContext<Row>) => MaybePromise<boolean | void>)
      | undefined;
  };
  visible: boolean;
  model: UnknownRecord;
  type: 'create' | 'edit';
  editingRow: Row | undefined;
}
export function createBasicCrudModalFoundation<Row extends Record<string, unknown>>(
  state: BasicCrudModalFoundationState<Row>,
  callbacks: {
    afterRender(): Promise<unknown>;
    validate(): Promise<unknown> | undefined;
    resetFields(): void;
    clearValidate(): void;
    success(result: unknown, context: BasicCrudTableModalSubmitContext<Row>): void;
    close(): void;
    error(error: unknown): void;
  },
) {
  const initialModel = cloneDeep(state.model);
  let openRequestId = 0;
  async function open(row?: Row) {
    const requestId = ++openRequestId;
    state.type = row ? 'edit' : 'create';
    state.editingRow = row;
    state.model = cloneDeep(initialModel);
    if (row) {
      try {
        const detail = state.props.detailApi
          ? await state.props.detailApi(row)
          : cloneDeep({ ...row });
        if (requestId !== openRequestId) return false;
        state.model = state.props.valueTransformer ? state.props.valueTransformer(detail) : detail;
      } catch (error) {
        if (requestId === openRequestId) callbacks.error(error);
        return false;
      }
    }
    state.visible = true;
    await callbacks.afterRender();
    if (requestId !== openRequestId) return false;
    callbacks.clearValidate();
    return true;
  }

  async function handleBeforeOk() {
    const requestId = openRequestId;
    try {
      const errors = await callbacks.validate();
      if (requestId !== openRequestId || errors) return false;
      const context: BasicCrudTableModalSubmitContext<Row> = {
        type: state.type,
        row: state.editingRow,
        model: state.model,
      };
      if (state.props.beforeSubmit && (await state.props.beforeSubmit(context)) === false)
        return false;
      if (requestId !== openRequestId) return false;
      const api = state.type === 'create' ? state.props.createApi : state.props.updateApi;
      const result = api ? await api(state.model) : undefined;
      callbacks.success(result, context);
      return true;
    } catch (error) {
      callbacks.error(error);
      return false;
    }
  }

  function handleClose() {
    openRequestId++;
    state.model = cloneDeep(initialModel);
    state.editingRow = undefined;
    state.type = 'create';
    callbacks.resetFields();
    callbacks.clearValidate();
    callbacks.close();
  }

  return {
    open,
    handleBeforeOk,
    handleClose,
    dispose() {
      openRequestId++;
    },
  };
}
