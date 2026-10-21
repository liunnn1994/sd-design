<template>
  <div :class="rootClass" :style="styles?.root">
    <div
      ref="rootRef"
      :class="[`${prefixCls}-content`, classNames?.content]"
      :style="[contentStyle, styles?.content]"
      role="textbox"
      aria-multiline="true"
      :aria-label="resolvedAriaLabel"
      :aria-disabled="disabled || undefined"
      :aria-readonly="readonly || undefined"
      :spellcheck="spellcheck"
      :contenteditable="!disabled && !readonly"
      @focus="emit('focus', $event)"
      @blur="emit('blur', $event)"
    />
    <div
      v-if="isEmpty"
      :class="[`${prefixCls}-placeholder`, classNames?.placeholder]"
      :style="styles?.placeholder"
      aria-hidden="true"
    >
      <slot name="placeholder">{{ placeholder }}</slot>
    </div>

    <Teleport v-for="host in componentHosts" :key="host.nodeKey" :to="host.element">
      <span :class="classNames?.component" :style="styles?.component">
        <slot
          v-if="$slots[`node-${host.node.name}`]"
          :name="`node-${host.node.name}`"
          :node-key="host.nodeKey"
          :node="host.node"
          :disabled="disabled"
          :readonly="readonly"
          :update="(value) => updateComponent(host.nodeKey, value)"
          :remove="() => removeComponent(host.nodeKey)"
          :editor="host.editor"
        />
        <RichTextNodeRenderer
          v-else
          :node="host.node"
          :disabled="disabled"
          :readonly="readonly"
          @update="updateComponent(host.nodeKey, $event)"
          @remove="removeComponent(host.nodeKey)"
        >
          <span :class="`${prefixCls}-component-fallback`">{{ host.node.textValue }}</span>
        </RichTextNodeRenderer>
      </span>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
  import type { ComponentHost } from '@sdata/web-core/rich-text-editor/foundation';

  import {
    computed,
    getCurrentInstance,
    nextTick,
    onBeforeUnmount,
    onMounted,
    shallowRef,
    watch,
  } from 'vue';
  import type { CSSProperties } from 'vue';

  import {
    createRichTextEditorFoundation,
    TRANSFORMERS,
  } from '@sdata/web-core/rich-text-editor/foundation';

  import type {
    RichTextEditorEmits,
    RichTextEditorProps,
    RichTextEditorSlots,
    RichTextEditorRef,
  } from './types';

  import { getPrefixCls } from '../_utils/global-config';
  import { useI18n } from '../locale';
  import RichTextNodeRenderer from './rich-text-node-renderer.vue';
  defineOptions({ name: 'RichTextEditor' });

  const props = withDefaults(defineProps<RichTextEditorProps>(), {
    history: true,
    historyDelay: 300,
    historyMaxDepth: null,
    autoSize: true,
    spellcheck: true,
    plugins: () => [],
    transformers: () => TRANSFORMERS,
    classNames: () => ({}),
    styles: () => ({}),
  });
  const emit = defineEmits<RichTextEditorEmits>();
  defineSlots<RichTextEditorSlots>();

  const { t } = useI18n();
  const resolvedAriaLabel = computed(() => props.ariaLabel ?? t('richTextEditor.ariaLabel'));

  // 纯非受控（无 modelValue 且无 change/update:modelValue 监听）时无需序列化 EditorState，
  // 避免每次按键都做 toJSON + JSON.stringify。受控或单向 modelValue 仍需序列化以支撑回显/重置判等。
  const instance = getCurrentInstance();
  const hasStateListeners = () =>
    Boolean(instance?.vnode.props?.['onUpdate:modelValue'] || instance?.vnode.props?.onChange);

  const prefixCls = getPrefixCls('rich-text-editor');
  const rootRef = shallowRef<HTMLDivElement>();
  const editorRef = shallowRef<RichTextEditorRef['editor']>(null);
  const isEmpty = shallowRef(true);
  const canUndo = shallowRef(false);
  const canRedo = shallowRef(false);
  const componentHosts = shallowRef<ComponentHost[]>([]);
  const rootClass = computed(() => [
    prefixCls,
    props.classNames.root,
    {
      [`${prefixCls}-disabled`]: props.disabled,
      [`${prefixCls}-readonly`]: props.readonly,
      [`${prefixCls}-focusable`]: !props.disabled && !props.readonly,
    },
  ]);

  // minRows/maxRows 用 `lh` 单位按内容实际行高换算高度（行高来自根节点的
  // `$rich-text-editor-line-height`，由 &-content 继承），使行数与可见行一致。
  const contentStyle = computed<CSSProperties>(() => {
    if (!props.autoSize) return {};
    if (props.autoSize === true) return { minHeight: '1.5715em' };
    return {
      minHeight: props.autoSize.minRows ? `${props.autoSize.minRows}lh` : undefined,
      maxHeight: props.autoSize.maxRows ? `${props.autoSize.maxRows}lh` : undefined,
      overflowY: props.autoSize.maxRows ? 'auto' : undefined,
    };
  });

  const foundation = createRichTextEditorFoundation({
    options: props,
    prefixCls,
    get editor() {
      return editorRef.value;
    },
    get rootElement() {
      return rootRef.value;
    },
    setEditor: (editor) => {
      editorRef.value = editor;
    },
    setEmpty: (value) => {
      isEmpty.value = value;
    },
    setCanUndo: (value) => {
      canUndo.value = value;
    },
    setCanRedo: (value) => {
      canRedo.value = value;
    },
    setComponentHosts: (hosts) => {
      componentHosts.value = hosts;
    },
    hasStateListeners,
    afterRender: (task) => {
      nextTick(task);
    },
    onError: (error) => emit('error', error),
    onUpdate: (context) => emit('update', context),
    onUpdateValue: (value) => emit('update:modelValue', value),
    onChange: (value, context) => emit('change', value, context),
    onReady: (editor) => emit('ready', editor),
  });
  const {
    focus,
    blur,
    clear,
    undo,
    redo,
    getJSON,
    setJSON,
    getContent,
    setContent,
    insertContent,
    getText,
    getHTML,
    setHTML,
    getMarkdown,
    setMarkdown,
    insertText,
    insertComponent,
    updateComponent,
    removeComponent,
    formatText,
    read,
    update,
    dispatchCommand,
    registerCommand,
    registerUpdateListener,
    registerMutationListener,
    registerNodeTransform,
  } = foundation;
  onMounted(foundation.mount);
  watch(
    () => props.modelValue,
    (value) => foundation.syncModel(value),
    { deep: true },
  );
  watch(
    () => [props.disabled, props.readonly] as const,
    ([disabled, readonly]) => foundation.syncEditable(disabled, readonly),
  );
  onBeforeUnmount(foundation.dispose);
  defineExpose<RichTextEditorRef>({
    get editor() {
      return editorRef.value;
    },
    get editorState() {
      return editorRef.value?.getEditorState() ?? null;
    },
    get rootElement() {
      return rootRef.value ?? null;
    },
    get canUndo() {
      return canUndo.value;
    },
    get canRedo() {
      return canRedo.value;
    },
    focus,
    blur,
    clear,
    undo,
    redo,
    getJSON,
    setJSON,
    getContent,
    setContent,
    insertContent,
    getText,
    getHTML,
    setHTML,
    getMarkdown,
    setMarkdown,
    insertText,
    insertComponent,
    updateComponent,
    removeComponent,
    formatText,
    read,
    update,
    dispatchCommand,
    registerCommand,
    registerUpdateListener,
    registerMutationListener,
    registerNodeTransform,
  });
</script>
