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
      <template v-for="name in formSlotNames" :key="name" #[name]="data">
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
  import { computed, nextTick, shallowRef, useSlots } from 'vue';

  import { cloneDeep } from 'es-toolkit';

  import type { JsonFormInstance } from '../json-form';
  import type { TableData } from '../table';
  import type {
    BasicCrudTableModalFormProps,
    BasicCrudTableModalProps,
    BasicCrudTableModalSubmitContext,
    MaybePromise,
  } from './types';

  import JsonForm from '../json-form';
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
  const initialModel = shallowRef<UnknownRecord>(cloneDeep(model.value));

  const resolvedTitle = computed(() => (type.value === 'create' ? '创建' : '编辑'));
  const slotContext = computed(() => ({
    type: type.value,
    row: editingRow.value,
    model: model.value,
  }));
  const formSlotNames = computed(() =>
    Object.keys(slots).filter((name) => !['title', 'footer'].includes(name)),
  );

  async function open(row?: TableData) {
    type.value = row ? 'edit' : 'create';
    editingRow.value = row;
    model.value = cloneDeep(initialModel.value);
    if (row) {
      try {
        const detail = detailApi ? await detailApi(row) : cloneDeep({ ...row });
        model.value = valueTransformer ? valueTransformer(detail) : detail;
      } catch (error) {
        emit('error', error);
        return;
      }
    }
    visible.value = true;
    await nextTick();
    formRef.value?.clearValidate();
  }

  async function handleBeforeOk() {
    const errors = await formRef.value?.validate();
    if (errors) return false;
    const context: BasicCrudTableModalSubmitContext<TableData> = {
      type: type.value,
      row: editingRow.value,
      model: model.value,
    };
    if (beforeSubmit && (await beforeSubmit(context)) === false) return false;
    try {
      const api = type.value === 'create' ? createApi : updateApi;
      const result = api ? await api(model.value) : undefined;
      emit('success', result, context);
      return true;
    } catch (error) {
      emit('error', error);
      return false;
    }
  }

  function handleClose() {
    model.value = cloneDeep(initialModel.value);
    editingRow.value = undefined;
    type.value = 'create';
    formRef.value?.resetFields();
    formRef.value?.clearValidate();
    emit('close');
  }

  defineExpose({ open, type: computed(() => type.value), formRef });
</script>
