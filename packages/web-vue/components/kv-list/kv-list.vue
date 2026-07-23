<template>
  <div :class="prefixCls">
    <div :class="`${prefixCls}-toolbar`">
      <div :class="`${prefixCls}-toolbar-actions`">
        <Button
          v-if="bulkAvailable"
          type="text"
          shape="circle"
          size="small"
          :tooltip="bulkMode ? t('kvList.switchToList') : t('kvList.switchToBulk')"
          :aria-label="bulkMode ? t('kvList.switchToList') : t('kvList.switchToBulk')"
          :disabled="disabled"
          @click="bulkMode = !bulkMode"
        >
          <template #icon>
            <IconList v-if="bulkMode" />
            <IconEdit v-else />
          </template>
          <template #sr-only>
            {{ bulkMode ? t('kvList.switchToList') : t('kvList.switchToBulk') }}
          </template>
        </Button>
        <Button
          type="text"
          shape="circle"
          size="small"
          :tooltip="t('kvList.clear')"
          :aria-label="t('kvList.clear')"
          :disabled="disabled"
          @click="clearItems"
        >
          <template #icon>
            <IconDelete />
          </template>
          <template #sr-only>{{ t('kvList.clear') }}</template>
        </Button>
        <Button
          type="text"
          shape="circle"
          size="small"
          :tooltip="t('kvList.add')"
          :aria-label="t('kvList.add')"
          :disabled="disabled || bulkMode"
          @click="addItem"
        >
          <template #icon>
            <IconPlus />
          </template>
          <template #sr-only>{{ t('kvList.add') }}</template>
        </Button>
        <slot name="toolbar-extra" />
      </div>
    </div>

    <Textarea
      v-if="bulkMode"
      :model-value="bulkModel"
      :class="`${prefixCls}-bulk`"
      :auto-size="{ minRows: 8, maxRows: 18 }"
      :placeholder="t('kvList.bulkPlaceholder')"
      :disabled="disabled"
      data-testid="kv-list-bulk"
      @update:model-value="bulkModel = $event"
    />

    <VueDraggable
      v-else
      v-model="rows"
      :class="`${prefixCls}-rows`"
      :animation="150"
      :draggable="rowSelector"
      :handle="handleSelector"
      :disabled="disabled"
      :ghost-class="`${prefixCls}-row--ghost`"
      :chosen-class="`${prefixCls}-row--chosen`"
      @update="commitRows"
    >
      <KvListRow
        v-for="(item, index) in rows"
        :key="item.id"
        :item="item"
        :index="index"
        :type="type"
        :key-props="keyProps"
        :value-props="valueProps"
        :disabled="disabled"
        @update="updateItem(index, $event)"
        @remove="removeItem(index)"
      >
        <template v-if="$slots.key" #key="slotProps">
          <slot name="key" v-bind="slotProps" />
        </template>
        <template v-if="$slots.value" #value="slotProps">
          <slot name="value" v-bind="slotProps" />
        </template>
        <template #actions>
          <slot name="row-actions" :item="{ key: item.key, value: item.value }" :index="index" />
        </template>
      </KvListRow>
    </VueDraggable>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue';

  import { VueDraggable } from 'vue-draggable-plus';

  import type {
    KvListFieldSlotProps,
    KvListItem,
    KvListKeyProps,
    KvListRowActionsSlotProps,
    KvListType,
    KvListValueProps,
    KvListWorkingItem,
  } from './types';

  import { getPrefixCls } from '../_utils/global-config';
  import Button from '../button';
  import IconDelete from '../icon/icon-delete';
  import IconEdit from '../icon/icon-edit';
  import IconList from '../icon/icon-list';
  import IconPlus from '../icon/icon-plus';
  import { useI18n } from '../locale';
  import Textarea from '../textarea';
  import KvListRow from './kv-list-row.vue';
  import { isSameKvList, normalizeKvList, parseBulkKvList, stringifyKvList } from './utils';

  defineOptions({ name: 'KvList' });

  const {
    type,
    keyProps,
    valueProps,
    disabled = false,
    bulkEditable,
  } = defineProps<{
    /**
     * @zh 编辑器类型。默认使用两个 Input
     * @en Editor type. Uses two Input components by default
     */
    type?: KvListType;
    /**
     * @zh 透传给键编辑组件的属性
     * @en Props passed through to the key editor
     */
    keyProps?: KvListKeyProps;
    /**
     * @zh 透传给值编辑组件的属性
     * @en Props passed through to the value editor
     */
    valueProps?: KvListValueProps;
    /**
     * @zh 是否禁用编辑和结构操作
     * @en Whether editing and structural actions are disabled
     */
    disabled?: boolean;
    /**
     * @zh 是否允许 Bulk 编辑。secret 类型默认关闭，其他类型默认开启
     * @en Whether bulk editing is available. Disabled by default for secret type
     */
    bulkEditable?: boolean;
  }>();

  const jsonModel = defineModel<KvListItem[]>('json', { default: () => [] });
  const bulkModel = defineModel<string>('bulk', { default: '' });

  defineSlots<{
    'key'?: (props: KvListFieldSlotProps) => unknown;
    'value'?: (props: KvListFieldSlotProps) => unknown;
    'toolbar-extra'?: () => unknown;
    'row-actions'?: (props: KvListRowActionsSlotProps) => unknown;
  }>();

  const prefixCls = getPrefixCls('kv-list');
  const { t } = useI18n();
  const rowSelector = `.${prefixCls}-row`;
  const handleSelector = `.${prefixCls}-drag-handle`;
  const bulkMode = ref(false);
  const bulkAvailable = computed(() => bulkEditable ?? type !== 'secret');
  const rows = ref<KvListWorkingItem[]>([]);
  let id = 0;
  let suppressedJsonUpdate: KvListItem[] | undefined;

  function createWorkingItem(item: KvListItem): KvListWorkingItem {
    return { id: id++, key: item.key, value: item.value };
  }

  function publicRows() {
    return normalizeKvList(rows.value);
  }

  function replaceRows(items: readonly KvListItem[]) {
    const normalizedItems = normalizeKvList(items);
    rows.value =
      normalizedItems.length > 0
        ? normalizedItems.map(createWorkingItem)
        : [createWorkingItem({ key: '', value: '' })];
  }

  function commitRows() {
    const items = publicRows();
    const bulk = stringifyKvList(items);

    if (!isSameKvList(normalizeKvList(jsonModel.value), items)) {
      jsonModel.value = items;
    }
    if (bulkModel.value !== bulk) {
      bulkModel.value = bulk;
    }
  }

  function addItem() {
    if (disabled) return;
    rows.value.push(createWorkingItem({ key: '', value: '' }));
  }

  function updateItem(index: number, item: KvListWorkingItem) {
    if (disabled) return;
    rows.value[index] = item;
    commitRows();
  }

  function removeItem(index: number) {
    if (disabled) return;
    rows.value.splice(index, 1);
    if (rows.value.length === 0) {
      addItem();
    }
    commitRows();
  }

  function clearItems() {
    if (disabled) return;
    replaceRows([]);
    commitRows();
  }

  const initialJson = normalizeKvList(jsonModel.value);
  const initialBulk = parseBulkKvList(bulkModel.value);

  if (initialJson.length > 0) {
    replaceRows(initialJson);
    bulkModel.value = stringifyKvList(initialJson);
  } else if (initialBulk.length > 0) {
    replaceRows(initialBulk);
    jsonModel.value = initialBulk;
  } else {
    replaceRows([]);
  }

  watch(bulkAvailable, (available) => {
    if (!available) bulkMode.value = false;
  });

  watch(
    jsonModel,
    (value) => {
      const items = normalizeKvList(value);

      if (suppressedJsonUpdate && isSameKvList(items, suppressedJsonUpdate)) {
        suppressedJsonUpdate = undefined;
        return;
      }
      if (isSameKvList(items, publicRows())) return;

      replaceRows(items);
      const bulk = stringifyKvList(items);
      if (bulkModel.value !== bulk) {
        bulkModel.value = bulk;
      }
    },
    { deep: true },
  );

  watch(bulkModel, (value) => {
    const items = parseBulkKvList(value);
    if (isSameKvList(items, publicRows())) return;

    replaceRows(items);
    if (!isSameKvList(items, normalizeKvList(jsonModel.value))) {
      suppressedJsonUpdate = items;
      jsonModel.value = items;
    }
  });
</script>
