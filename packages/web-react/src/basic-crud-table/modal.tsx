import type { ReactNode, Ref } from 'react';
import type { UnknownRecord } from 'type-fest';

import { useImperativeHandle } from 'react';

import type { TableData } from '../table/index.js';

import {
  JsonForm,
  type JsonFormProps,
  type JsonFormInstance,
  type JsonFormItemSlotProps,
} from '../json-form/index.js';
import { useI18n } from '../locale/index.js';
import { Modal, type ModalProps } from '../modal/index.js';
import { useCrudModal, type CrudModalOptions } from './use-modal.js';

export interface CrudModalInstance<Row extends TableData = TableData> {
  open(row?: Row): Promise<boolean>;
  readonly type: 'create' | 'edit';
  readonly formRef: JsonFormInstance | null;
}
export interface CrudModalProps<Row extends TableData> extends CrudModalOptions<Row> {
  ref?: Ref<CrudModalInstance<Row>>;
  modalProps?: Omit<ModalProps, 'visible' | 'title' | 'onBeforeOk' | 'onClose' | 'onVisibleChange'>;
  modalFormProps?: Omit<JsonFormProps, 'model' | 'value' | 'modelValue' | 'ref'>;
  slots?: Record<string, (data: UnknownRecord) => ReactNode>;
}

export function BasicCrudModal<Row extends TableData>({
  ref,
  modalProps,
  modalFormProps = { schemas: [] },
  slots = {},
  ...options
}: CrudModalProps<Row>) {
  const state = useCrudModal(options);
  const { t } = useI18n();
  useImperativeHandle(
    ref,
    () => ({
      open: state.foundation.open,
      type: state.type,
      get formRef() {
        return state.form.current;
      },
    }),
    [state.foundation, state.type, state.form],
  );
  const context = { type: state.type, row: state.row, model: state.model.value };
  const formSlots = Object.fromEntries(
    Object.entries(slots)
      .filter(([name]) => !['title', 'footer'].includes(name))
      .map(([name, render]) => [
        name,
        (data: JsonFormItemSlotProps) => render({ ...data, ...context }),
      ]),
  );
  return (
    <Modal
      {...modalProps}
      visible={state.visible.value}
      onVisibleChange={(next) => {
        state.visible.value = next;
      }}
      title={
        slots.title
          ? slots.title(context)
          : t(state.type === 'create' ? 'basicCrudTable.createTitle' : 'basicCrudTable.edit')
      }
      onBeforeOk={state.foundation.handleBeforeOk}
      onClose={state.foundation.handleClose}
      {...(slots.footer ? { footer: slots.footer(context) } : {})}
    >
      <JsonForm
        {...modalFormProps}
        ref={state.form}
        value={state.model.value}
        onValueChange={(next) => {
          state.model.value = next;
          modalFormProps.onValueChange?.(next);
        }}
        slots={{ ...modalFormProps.slots, ...formSlots }}
      />
    </Modal>
  );
}
