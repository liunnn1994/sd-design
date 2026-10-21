<template>
  <Modal
    v-model:visible="visible"
    v-bind="modalProps"
    :title="resolvedTitle"
    :on-before-ok="handleBeforeOk"
    @close="handleClose"
  >
    <template v-if="$slots.title" #title>
      <slot name="title" v-bind="slotContext" />
    </template>
    <JsonForm ref="formRef" v-model="model" v-bind="modalFormProps">
      <template v-for="name in formSlotNames()" :key="name" #[name]="data">
        <slot :name="name" v-bind="{ ...data, ...slotContext }" />
      </template>
    </JsonForm>
    <template v-if="$slots.footer" #footer>
      <slot name="footer" v-bind="slotContext" />
    </template>
  </Modal>
</template>

<script setup lang="ts">
  import type { UnknownRecord } from 'type-fest';

  import type { VNode } from 'vue';
  import { computed, nextTick, onBeforeUnmount, shallowRef, useSlots } from 'vue';

  import { createBasicCrudModalFoundation } from '@sdata/web-core/basic-crud-table/modal';

  import type { JsonFormInstance } from '../json-form';
  import type { TableData } from '../table';
  import type {
    BasicCrudTableModalFormProps,
    BasicCrudTableModalProps,
    BasicCrudTableModalSubmitContext,
    MaybePromise,
  } from './types';

  import JsonForm from '../json-form';
  import { useI18n } from '../locale';
  import Modal from '../modal';

  defineOptions({ name: 'BasicCrudModal' });

  defineSlots<{ [name: string]: ((props: UnknownRecord) => VNode[]) | undefined }>();

  const {
    modalProps = {},
    modalFormProps = { schemas: [] },
    createApi,
    updateApi,
    detailApi,
    valueTransformer,
    beforeSubmit,
  } = defineProps<{
    modalProps?: BasicCrudTableModalProps;
    modalFormProps?: BasicCrudTableModalFormProps;
    createApi?: (data: UnknownRecord) => MaybePromise<unknown>;
    updateApi?: (data: UnknownRecord) => MaybePromise<unknown>;
    detailApi?: (row: TableData) => MaybePromise<UnknownRecord>;
    valueTransformer?: (data: UnknownRecord) => UnknownRecord;
    beforeSubmit?: (
      context: BasicCrudTableModalSubmitContext<TableData>,
    ) => MaybePromise<boolean | void>;
  }>();

  const emit = defineEmits<{
    success: [result: unknown, context: BasicCrudTableModalSubmitContext<TableData>];
    close: [];
    error: [error: unknown];
  }>();

  const visible = defineModel<boolean>('visible', { default: false });
  const model = defineModel<UnknownRecord>('model', { default: () => ({}) });
  const slots = useSlots();
  const formRef = shallowRef<JsonFormInstance>();
  const type = shallowRef<'create' | 'edit'>('create');
  const editingRow = shallowRef<TableData>();

  const { t } = useI18n();

  const resolvedTitle = computed(() =>
    t(type.value === 'create' ? 'basicCrudTable.createTitle' : 'basicCrudTable.edit'),
  );
  const slotContext = computed(() => ({
    type: type.value,
    row: editingRow.value,
    model: model.value,
  }));
  const formSlotNames = () =>
    Object.keys(slots).filter((name) => !['title', 'footer'].includes(name));
  const foundation = createBasicCrudModalFoundation<TableData>(
    {
      props: {
        get createApi() {
          return createApi;
        },
        get updateApi() {
          return updateApi;
        },
        get detailApi() {
          return detailApi;
        },
        get valueTransformer() {
          return valueTransformer;
        },
        get beforeSubmit() {
          return beforeSubmit;
        },
      },
      get visible() {
        return visible.value;
      },
      set visible(value) {
        visible.value = value;
      },
      get model() {
        return model.value;
      },
      set model(value) {
        model.value = value;
      },
      get type() {
        return type.value;
      },
      set type(value) {
        type.value = value;
      },
      get editingRow() {
        return editingRow.value;
      },
      set editingRow(value) {
        editingRow.value = value;
      },
    },
    {
      afterRender: () => nextTick(),
      validate: () => formRef.value?.validate(),
      resetFields: () => formRef.value?.resetFields(),
      clearValidate: () => formRef.value?.clearValidate(),
      success: (result, context) => emit('success', result, context),
      close: () => emit('close'),
      error: (error) => emit('error', error),
    },
  );
  const { open, handleBeforeOk, handleClose } = foundation;
  onBeforeUnmount(foundation.dispose);
  defineExpose({ open, type: computed(() => type.value), formRef });
</script>
