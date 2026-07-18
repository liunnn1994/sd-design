<template>
  <div :class="cls" :style="styleVars" @keydown.enter="handleSearch">
    <Spin :loading="loading" :class="`${prefixCls}-inner`">
      <div ref="bodyRef" :class="bodyCls">
        <slot v-if="$slots.default" />
        <JsonForm
          v-else-if="resolvedSchemas.length"
          ref="formRef"
          v-model="modelValue"
          :schemas="resolvedSchemas"
          hide-label
          hide-asterisk
        >
          <template v-for="name in schemaSlotNames" :key="name" #[name]="slotProps">
            <slot :name="name" v-bind="slotProps" />
          </template>
        </JsonForm>
      </div>
      <div v-if="showActions" :class="`${prefixCls}-actions`">
        <Link v-if="allowExpand && isOverflow" :class="`${prefixCls}-expand`" @click="toggleExpand">
          <span :class="`${prefixCls}-expand-text`">
            {{ isExpand ? collapseText : expandText }}
          </span>
          <slot name="expand-icon">
            <IconDown
              :class="[`${prefixCls}-expand-icon`, { [`${prefixCls}-expand-icon--up`]: isExpand }]"
            />
          </slot>
        </Link>
        <slot v-if="$slots.extra" name="extra" />
        <template v-else>
          <slot name="action-prepend" />
          <Button v-if="showSearch" type="primary" @click="handleSearch">
            {{ searchText }}
          </Button>
          <Button v-if="showReset" @click="reset()">{{ resetText }}</Button>
          <slot name="action-append" />
        </template>
      </div>
    </Spin>
  </div>
</template>

<script lang="ts" setup>
  import { computed, onBeforeUnmount, onMounted, ref } from 'vue';

  import { cloneDeep, omit } from 'es-toolkit';

  import type { JsonFormInstance, JsonFormProps, JsonFormSchema } from '../json-form';
  import type { ToolbarEmits, ToolbarModelValue, ToolbarProps } from './types';

  import { useResizeObserver } from '../_hooks/use-resize-observer';
  import { getPrefixCls } from '../_utils/global-config';
  import Button from '../button';
  import IconDown from '../icon/icon-down';
  import JsonForm from '../json-form';
  import Link from '../link';
  import Spin from '../spin';

  defineOptions({ name: 'Toolbar' });

  const {
    schemas = [],
    loading = false,
    showSearch = true,
    showReset = true,
    showActions = true,
    searchText = '查询',
    resetText = '重置',
    expandText = '展开',
    collapseText = '收起',
    allowExpand = false,
    defaultExpand = false,
    itemHeight = 32,
    spanWidth = 230,
    itemMaxWidth = 'unset',
    showBorderBottom = true,
    resetSkipKeys = [],
  } = defineProps<ToolbarProps>();

  const emit = defineEmits<ToolbarEmits>();

  /**
   * @zh 表单数据对象（v-model）
   * @en Form data object (v-model)
   */
  const modelValue = defineModel<ToolbarModelValue>({ default: () => ({}) });

  const prefixCls = getPrefixCls('toolbar');

  const bodyRef = ref<HTMLElement | undefined>();
  const formRef = ref<JsonFormInstance | undefined>();

  const isExpand = ref(defaultExpand);
  const isOverflow = ref(false);
  const bodyHeight = ref(0);

  // Snapshot the initial values so reset can restore them.
  const initModel = cloneDeep(modelValue.value ?? {});

  const { createResizeObserver, destroyResizeObserver } = useResizeObserver({
    elementRef: bodyRef,
    onResize: (entry) => {
      // scrollHeight reports the full content height even when clipped,
      // so this stays correct in both collapsed and expanded states.
      const fullHeight = entry.target.scrollHeight;
      bodyHeight.value = fullHeight;
      isOverflow.value = fullHeight > itemHeight;
    },
  });

  onMounted(createResizeObserver);
  onBeforeUnmount(destroyResizeObserver);

  // Inject the CSS-grid column span so a schema item can occupy multiple columns.
  const resolvedSchemas = computed(
    () =>
      schemas.map((schema) => {
        const span = typeof schema.span === 'number' && schema.span > 0 ? schema.span : 1;
        const baseStyle =
          (schema.formItemProps?.style as Record<string, unknown> | undefined) ?? {};
        return {
          ...schema,
          formItemProps: {
            ...schema.formItemProps,
            style: { gridColumn: `span ${span}`, ...baseStyle },
          },
        };
      }) as unknown as NonNullable<JsonFormProps['schemas']>,
  );

  // Only forward schema-derived slot names to JsonForm so this component's own
  // action slots are not leaked into the form.
  const schemaSlotNames = computed(() => {
    const names = new Set<string>();
    const walk = (list: JsonFormSchema<string>[]) => {
      for (const item of list) {
        if (typeof item.slotName === 'string') names.add(item.slotName);
        if (item.children?.length) walk(item.children);
      }
    };
    walk(schemas);
    return [...names];
  });

  const bodyMaxHeight = computed(() => {
    if (!allowExpand) return 'none';
    return isExpand.value ? `${bodyHeight.value}px` : `${itemHeight}px`;
  });

  const styleVars = computed(() => ({
    '--toolbar-item-height': `${itemHeight}px`,
    '--toolbar-span-width': `${spanWidth}px`,
    '--toolbar-item-max-width': itemMaxWidth,
    '--toolbar-body-max-height': bodyMaxHeight.value,
  }));

  const cls = computed(() => [prefixCls, { [`${prefixCls}-with-border`]: showBorderBottom }]);

  const bodyCls = computed(() => [
    `${prefixCls}-body`,
    {
      [`${prefixCls}-body--schema`]: resolvedSchemas.value.length > 0,
      [`${prefixCls}-body--max-width`]: itemMaxWidth !== 'unset',
    },
  ]);

  function handleSearch() {
    emit('search', modelValue.value);
  }

  function reset(emitReset: unknown = true) {
    // Restore initial values (minus skipped keys), preserve skipped keys' current
    // values, and drop any keys that were added after mount.
    const initMinusSkip = omit(initModel, resetSkipKeys) as ToolbarModelValue;
    const next: ToolbarModelValue = {};
    for (const key of resetSkipKeys) {
      if (Object.hasOwn(modelValue.value, key)) {
        next[key] = modelValue.value[key];
      }
    }
    for (const key of Object.keys(initMinusSkip)) {
      next[key] = initMinusSkip[key];
    }
    modelValue.value = next;
    formRef.value?.clearValidate();
    if (emitReset) emit('reset');
  }

  function toggleExpand() {
    isExpand.value = !isExpand.value;
  }

  defineExpose({
    search: handleSearch,
    reset,
  });
</script>
