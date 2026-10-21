<template>
  <form :id="id" ref="formRef" :class="cls" @submit.prevent="handleSubmit">
    <slot />
  </form>
</template>

<script setup lang="ts">
  import { computed, PropType, provide, reactive, toRefs, ref } from 'vue';

  import { createFormFoundation } from '@sdata/web-core/form/foundation';

  import { useSize } from '../_hooks/use-size';
  import { Size } from '../_utils/constant';
  import { getPrefixCls } from '../_utils/global-config';
  import { isBoolean } from '../_utils/is';
  import { FormItemInfo, formInjectionKey } from './context';
  import { FieldData, FieldRule, ValidatedError } from './interface';
  import { getFormElementId } from './utils';

  const FORM_LAYOUTS = ['horizontal', 'vertical', 'inline'] as const;
  type FormLayout = (typeof FORM_LAYOUTS)[number];
  const FORM_LABEL_ALIGNS = ['left', 'right'] as const;
  type FormLabelAlign = (typeof FORM_LABEL_ALIGNS)[number];

  defineOptions({ name: 'Form' });

  const props = defineProps({
    /**
     * @zh 表单数据对象
     * @en Form data object
     */
    model: {
      type: Object,
      required: true,
    },
    /**
     * @zh 表单的布局方式，包括水平、垂直、多列
     * @en The layout of the form, including horizontal, vertical, and multi-column
     * @values 'horizontal', 'vertical', 'inline'
     */
    layout: {
      type: String as PropType<FormLayout>,
      default: 'horizontal',
    },
    /**
     * @zh 表单控件的尺寸
     * @en The size of the form
     * @values 'mini','small','medium','large'
     * @defaultValue 'medium'
     */
    size: {
      type: String as PropType<Size>,
    },
    /**
     * @zh 标签元素布局选项。参数同 `<col>` 组件一致
     * @en Label element layout options. The parameters are the same as the `<col>` component
     */
    labelColProps: {
      type: Object,
      default: () => ({ span: 5, offset: 0 }),
    },
    /**
     * @zh 表单控件布局选项。参数同 `<col>` 组件一致
     * @en Form control layout options. The parameters are the same as the `<col>` component
     */
    wrapperColProps: {
      type: Object,
      default: () => ({ span: 19, offset: 0 }),
    },
    labelColStyle: Object,
    wrapperColStyle: Object,
    /**
     * @zh 标签的对齐方向
     * @en Alignment direction of the label
     * @values 'left', 'right'
     */
    labelAlign: {
      type: String as PropType<FormLabelAlign>,
      default: 'right',
    },
    /**
     * @zh 是否禁用表单
     * @en Whether to disable the form
     */
    disabled: {
      type: Boolean,
      default: undefined,
    },
    /**
     * @zh 表单项校验规则
     * @en Form item validation rules
     */
    rules: {
      type: Object as PropType<Record<string, FieldRule | FieldRule[]>>,
    },
    /**
     * @zh 是否开启自动标签宽度，仅在 `layout="horizontal"` 下生效。
     * @en Whether to enable automatic label width, it only takes effect under `layout="horizontal"`.
     * @version 2.13.0
     */
    autoLabelWidth: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 表单 `id` 属性和表单控件 `id` 前缀
     * @en Form `id` attribute and form control `id` prefix
     */
    id: {
      type: String,
    },
    /**
     * @zh 验证失败后滚动到第一个错误字段，支持传入 scrollIntoView 的选项对象
     * @en Scroll to the first error field after verification fails; accepts a scrollIntoView options object
     * @version 2.51.0
     */
    scrollToFirstError: {
      type: [Boolean, Object] as PropType<boolean | ScrollIntoViewOptions>,
      default: false,
    },
  });

  const emit = defineEmits<{
    /**
     * @zh 表单提交时触发
     * @en Triggered when the form is submitted
     * @param {{values: Record<string, unknown>; errors: Record<string, ValidatedError> | undefined}} data
     * @param {Event} ev
     */
    submit: [
      _data: {
        values: Record<string, unknown>;
        errors: Record<string, ValidatedError> | undefined;
      },
      _ev: Event,
    ];
    /**
     * @zh 验证成功时触发
     * @en Triggered when verification is successful
     * @param {Record<string, unknown>} values
     * @param {Event} ev
     */
    submitSuccess: [_values: Record<string, unknown>, _ev: Event];
    /**
     * @zh 验证失败时触发
     * @en Triggered when verification failed
     * @param {{values: Record<string, unknown>; errors: Record<string, ValidatedError>}} data
     * @param {Event} ev
     */
    submitFailed: [
      _data: {
        values: Record<string, unknown>;
        errors: Record<string, ValidatedError>;
      },
      _ev: Event,
    ];
  }>();

  const prefixCls = getPrefixCls('form');
  const formRef = ref<HTMLFormElement>();
  const {
    id,
    model,
    layout,
    disabled,
    labelAlign,
    labelColProps,
    wrapperColProps,
    labelColStyle,
    wrapperColStyle,
    size,
    rules,
  } = toRefs(props);
  const { mergedSize } = useSize(size);

  const autoLabelWidth = computed(() => props.layout === 'horizontal' && props.autoLabelWidth);

  const {
    fields,
    addField,
    removeField,
    setFields,
    resetFields,
    clearValidate,
    validate,
    validateField,
    submit: handleSubmit,
  } = createFormFoundation<FormItemInfo>({
    getModel: () => model.value,
    shouldScrollToError: () => Boolean(props.scrollToFirstError),
    scrollToError: (field) => scrollToFirstError(field),
    onSubmitFailed: (values, errors, event) => emit('submitFailed', { values, errors }, event),
    onSubmitSuccess: (values, event) => emit('submitSuccess', values, event),
    onSubmit: (values, errors, event) => emit('submit', { values, errors }, event),
  });

  const labelWidth = reactive<Record<string, number>>({});
  const maxLabelWidth = computed(() => Math.max(...Object.values(labelWidth)));

  const setLabelWidth = (width: number, uid?: number) => {
    if (uid && labelWidth[uid] !== width) {
      labelWidth[uid] = width;
    }
  };

  const removeLabelWidth = (uid?: number) => {
    if (uid) {
      delete labelWidth[uid];
    }
  };

  const scrollToField = (field: string, options?: ScrollIntoViewOptions) => {
    const node = formRef.value || document.body;
    const fieldNode = node.querySelector(`#${CSS.escape(getFormElementId(props.id, field))}`);

    if (fieldNode) {
      (fieldNode as HTMLDivElement).scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        ...options,
      });
    }
  };

  const scrollToFirstError = (field: string) => {
    const options = !isBoolean(props.scrollToFirstError) ? props.scrollToFirstError : undefined;
    scrollToField(field, options);
  };

  provide(
    formInjectionKey,
    reactive({
      id,
      layout,
      disabled,
      labelAlign,
      labelColProps,
      wrapperColProps,
      labelColStyle,
      wrapperColStyle,
      model,
      size: mergedSize,
      rules,
      fields,
      addField,
      removeField,
      validateField,
      setLabelWidth,
      removeLabelWidth,
      maxLabelWidth,
      autoLabelWidth,
    }),
  );

  const cls = computed(() => [
    prefixCls,
    `${prefixCls}-layout-${props.layout}`,
    `${prefixCls}-size-${mergedSize.value}`,
    {
      [`${prefixCls}-auto-label-width`]: props.autoLabelWidth,
    },
  ]);

  /**
   * @zh 校验全部表单数据
   * @en Verify all form data
   * @public
   * @param {(errors: undefined | Record<string, ValidatedError>) => void} callback
   * @returns {Promise<undefined | Record<string, ValidatedError>>}
   */
  function _validate(
    callback?: (errors: undefined | Record<string, ValidatedError>) => void,
  ): Promise<undefined | Record<string, ValidatedError>> {
    return validate(callback);
  }
  /**
   * @zh 校验部分表单数据
   * @en Validate part of the form data
   * @public
   * @param {string | string[]} field
   * @param {(errors: undefined | Record<string, ValidatedError>) => void} callback
   * @returns {Promise<undefined | Record<string, ValidatedError>>}
   */
  function _validateField(
    field: string | string[],
    callback?: (errors: undefined | Record<string, ValidatedError>) => void,
  ): Promise<undefined | Record<string, ValidatedError>> {
    return validateField(field, callback);
  }
  /**
   * @zh 重置表单数据
   * @en Reset form data
   * @public
   * @param {string | string[]} field
   */
  function _resetFields(field?: string | string[]) {
    return resetFields(field);
  }
  /**
   * @zh 清除校验状态
   * @en Clear verification status
   * @public
   * @param {string | string[]} field
   */
  function _clearValidate(field?: string | string[]) {
    return clearValidate(field);
  }
  /**
   * @zh 设置表单项的值和状态
   * @en Set the value and status of the form item
   * @param {Record<string, FieldData>} data
   * @public
   */
  function _setFields(data: Record<string, FieldData>) {
    return setFields(data);
  }
  /**
   * @zh 滚动到指定表单项
   * @en Scroll to the specified form item
   * @param {string} field
   * @public
   * @version 2.51.0
   */
  function _scrollToField(field: string) {
    return scrollToField(field);
  }

  defineExpose({
    validate: _validate,
    validateField: _validateField,
    resetFields: _resetFields,
    clearValidate: _clearValidate,
    setFields: _setFields,
    scrollToField: _scrollToField,
  });
</script>
