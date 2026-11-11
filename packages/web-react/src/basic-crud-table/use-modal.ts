import type { UnknownRecord } from 'type-fest';

import {
  createBasicCrudModalFoundation,
  type BasicCrudModalFoundationState,
} from '@sdata/web-core/basic-crud-table/modal';
import { useEffect, useReducer, useRef, useState } from 'react';

import type { JsonFormInstance } from '../json-form/index.js';
import type { TableData } from '../table/index.js';

import { useAfterRender } from '../_shared/use-after-render.js';
import { useCrudModel } from './use-model.js';

type CrudModalApis<Row extends TableData> = Partial<BasicCrudModalFoundationState<Row>['props']>;
export interface CrudModalOptions<Row extends TableData> extends CrudModalApis<Row> {
  model?: UnknownRecord;
  defaultModel?: UnknownRecord;
  visible?: boolean;
  onModelChange?(model: UnknownRecord): void;
  onVisibleChange?(visible: boolean): void;
  onSuccess: Parameters<typeof createBasicCrudModalFoundation<Row>>[1]['success'];
  onClose?(): void;
  onError?(error: unknown): void;
}

export function useCrudModal<Row extends TableData>(options: CrudModalOptions<Row>) {
  const current = useRef(options);
  current.current = options;
  const model = useCrudModel(options.model, options.defaultModel ?? {}, options.onModelChange);
  const visible = useCrudModel(options.visible, false, options.onVisibleChange);
  const form = useRef<JsonFormInstance>(null);
  const afterRender = useAfterRender();
  const [, redraw] = useReducer((version: number) => version + 1, 0);
  const details = useRef<{ type: 'create' | 'edit'; row?: Row }>({ type: 'create' });
  const [foundation] = useState(() =>
    createBasicCrudModalFoundation<Row>(
      {
        props: {
          get createApi() {
            return current.current.createApi;
          },
          get updateApi() {
            return current.current.updateApi;
          },
          get detailApi() {
            return current.current.detailApi;
          },
          get valueTransformer() {
            return current.current.valueTransformer;
          },
          get beforeSubmit() {
            return current.current.beforeSubmit;
          },
        },
        get model() {
          return model.value;
        },
        set model(next) {
          model.value = next;
        },
        get visible() {
          return visible.value;
        },
        set visible(next) {
          visible.value = next;
        },
        get type() {
          return details.current.type;
        },
        set type(next) {
          details.current.type = next;
          redraw();
        },
        get editingRow() {
          return details.current.row;
        },
        set editingRow(next) {
          details.current.row = next;
          redraw();
        },
      },
      {
        afterRender,
        validate: () => form.current?.validate(),
        resetFields: () => {
          form.current?.resetFields();
        },
        clearValidate: () => {
          form.current?.clearValidate();
        },
        success: (result, context) => current.current.onSuccess(result, context),
        close: () => current.current.onClose?.(),
        error: (error) => current.current.onError?.(error),
      },
    ),
  );
  useEffect(() => foundation.dispose, [foundation]);
  return { foundation, model, visible, form, type: details.current.type, row: details.current.row };
}
