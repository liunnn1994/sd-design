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
      v-model="bulkModel"
      :class="`${prefixCls}-bulk`"
      :auto-size="{ minRows: 8, maxRows: 18 }"
      :placeholder="t('kvList.bulkPlaceholder')"
      :disabled="disabled"
      data-testid="kv-list-bulk"
    />

    <div v-else ref="rowsRoot" :class="`${prefixCls}-rows`">
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
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, onBeforeUnmount, ref, watch } from 'vue';

  import { createListSort } from '@sdata/web-core/drag-sort/list';
  import { createKvListFoundation } from '@sdata/web-core/kv-list/foundation';

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
  const foundation = createKvListFoundation({
    get rows() {
      return rows.value;
    },
    set rows(value) {
      rows.value = value;
    },
    get json() {
      return jsonModel.value;
    },
    set json(value) {
      jsonModel.value = value;
    },
    get bulk() {
      return bulkModel.value;
    },
    set bulk(value) {
      bulkModel.value = value;
    },
    get disabled() {
      return disabled;
    },
  });
  const { addItem, updateItem, removeItem, clearItems } = foundation;

  const rowsRoot = ref<HTMLElement>();
  let listSort: ReturnType<typeof createListSort> | undefined;
  watch(
    rowsRoot,
    (element) => {
      listSort?.destroy();
      listSort = element
        ? createListSort(element, {
            draggable: rowSelector,
            handle: handleSelector,
            ghostClass: `${prefixCls}-row--ghost`,
            chosenClass: `${prefixCls}-row--chosen`,
            move: foundation.moveItem,
          })
        : undefined;
      listSort?.setDisabled(disabled);
    },
    { flush: 'post' },
  );
  watch(
    () => disabled,
    (value) => listSort?.setDisabled(value),
  );
  onBeforeUnmount(() => listSort?.destroy());

  foundation.initialize();

  watch(bulkAvailable, (available) => {
    if (!available) bulkMode.value = false;
  });

  watch(jsonModel, foundation.syncJson, { deep: true });

  watch(bulkModel, foundation.syncBulk);
</script>
