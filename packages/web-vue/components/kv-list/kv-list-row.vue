<template>
  <div :class="`${prefixCls}-row`" data-testid="kv-list-row">
    <span :class="`${prefixCls}-drag-handle`">
      <Button type="text" shape="circle" size="small" :disabled="disabled">
        <template #icon>
          <IconDragDotVertical />
        </template>
        <template #sr-only>{{ t('kvList.dragSort') }}</template>
      </Button>
    </span>

    <div :class="`${prefixCls}-key`">
      <slot
        v-if="$slots.key"
        name="key"
        :value="item.key"
        :item="publicItem"
        :index="index"
        :props="mergedKeyProps"
        :update="updateKey"
      />
      <AutoComplete v-else-if="type === 'http-header'" v-bind="mergedKeyProps" v-model="keyModel" />
      <Input v-else v-bind="mergedKeyProps" v-model="keyModel" />
    </div>

    <div :class="`${prefixCls}-value`">
      <slot
        v-if="$slots.value"
        name="value"
        :value="item.value"
        :item="publicItem"
        :index="index"
        :props="mergedValueProps"
        :update="updateValue"
      />
      <InputPassword v-else-if="type === 'secret'" v-bind="mergedValueProps" v-model="valueModel" />
      <Input v-else v-bind="mergedValueProps" v-model="valueModel" />
    </div>

    <div :class="`${prefixCls}-row-actions`">
      <slot name="actions" />
      <Button
        type="text"
        shape="circle"
        size="small"
        status="danger"
        :tooltip="t('kvList.remove')"
        :aria-label="t('kvList.remove')"
        :disabled="disabled"
        @click="emit('remove')"
      >
        <template #icon>
          <IconDelete />
        </template>
        <template #sr-only>{{ t('kvList.remove') }}</template>
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';

  import type {
    KvListFieldSlotProps,
    KvListItem,
    KvListKeyProps,
    KvListType,
    KvListValueProps,
    KvListWorkingItem,
  } from './types';

  import { getPrefixCls } from '../_utils/global-config';
  import AutoComplete from '../auto-complete';
  import Button from '../button';
  import IconDelete from '../icon/icon-delete';
  import IconDragDotVertical from '../icon/icon-drag-dot-vertical';
  import Input, { InputPassword } from '../input';
  import { useI18n } from '../locale';
  import { COMMON_HTTP_HEADERS } from './constants';

  defineOptions({ name: 'KvListRow' });

  const {
    item,
    index,
    type,
    keyProps,
    valueProps,
    disabled = false,
  } = defineProps<{
    item: KvListWorkingItem;
    index: number;
    type?: KvListType;
    keyProps?: KvListKeyProps;
    valueProps?: KvListValueProps;
    disabled?: boolean;
  }>();

  const emit = defineEmits<{
    update: [item: KvListWorkingItem];
    remove: [];
  }>();

  defineSlots<{
    key?: (props: KvListFieldSlotProps) => unknown;
    value?: (props: KvListFieldSlotProps) => unknown;
    actions?: () => unknown;
  }>();

  const prefixCls = getPrefixCls('kv-list');
  const { t } = useI18n();
  const publicItem = computed<KvListItem>(() => ({ key: item.key, value: item.value }));
  const keyModel = computed({
    get: () => item.key,
    set: (value: string) => updateKey(value),
  });
  const valueModel = computed({
    get: () => item.value,
    set: (value: string) => updateValue(value),
  });
  const mergedKeyProps = computed<Record<string, unknown>>(() => ({
    placeholder: t('kvList.keyPlaceholder'),
    ...(type === 'http-header' ? { data: [...COMMON_HTTP_HEADERS] } : {}),
    ...keyProps,
    disabled: disabled || Boolean(keyProps?.disabled),
  }));
  const mergedValueProps = computed<Record<string, unknown>>(() => ({
    placeholder: t('kvList.valuePlaceholder'),
    ...valueProps,
    disabled: disabled || Boolean(valueProps?.disabled),
  }));

  function updateKey(value: string) {
    emit('update', { ...item, key: value });
  }

  function updateValue(value: string) {
    emit('update', { ...item, value });
  }
</script>
