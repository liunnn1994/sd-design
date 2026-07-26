<template>
  <div ref="containerRef" :class="rootClass" :style="styles?.root">
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
  import type {
    CommandListener,
    CommandListenerPriority,
    EditorSetOptions,
    EditorState,
    EditorUpdateOptions,
    Klass,
    LexicalCommand,
    LexicalEditor,
    LexicalNode,
    MutationListener,
    NodeKey,
    TextFormatType,
    Transform,
    UpdateListenerPayload,
  } from 'lexical';
  import type { JsonValue } from 'type-fest';

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

  import { CodeHighlightNode, CodeNode } from '@lexical/code';
  import { createEmptyHistoryState, registerHistory } from '@lexical/history';
  import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
  import { AutoLinkNode, LinkNode } from '@lexical/link';
  import { ListItemNode, ListNode } from '@lexical/list';
  import {
    $convertFromMarkdownString,
    $convertToMarkdownString,
    TRANSFORMERS,
  } from '@lexical/markdown';
  import { HeadingNode, QuoteNode, registerRichText } from '@lexical/rich-text';
  import {
    $createLineBreakNode,
    $createParagraphNode,
    $createTextNode,
    $getNodeByKey,
    $nodesOfType,
    $getRoot,
    $getSelection,
    $isElementNode,
    $isLineBreakNode,
    $isRangeSelection,
    $isTextNode,
    $setSelection,
    CAN_REDO_COMMAND,
    CAN_UNDO_COMMAND,
    COMMAND_PRIORITY_LOW,
    createEditor,
    FORMAT_TEXT_COMMAND,
    REDO_COMMAND,
    SKIP_SCROLL_INTO_VIEW_TAG,
    UNDO_COMMAND,
  } from 'lexical';

  import type {
    RichTextEditorComponentNodeData,
    RichTextEditorComponentNodeSnapshot,
    RichTextEditorContentItem,
    RichTextEditorContentSnapshot,
    RichTextEditorEmits,
    RichTextEditorFocusOptions,
    RichTextEditorInsertOptions,
    RichTextEditorMutationListenerOptions,
    RichTextEditorProps,
    RichTextEditorSlots,
    RichTextEditorValue,
  } from './types';

  import { getPrefixCls } from '../_utils/global-config';
  import { useI18n } from '../locale';
  import {
    $createInlineComponentNode,
    $isInlineComponentNode,
    InlineComponentNode,
  } from './nodes/inline-component-node';
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
  const containerRef = shallowRef<HTMLDivElement>();
  const rootRef = shallowRef<HTMLDivElement>();
  const editorRef = shallowRef<LexicalEditor | null>(null);
  const isEmpty = shallowRef(true);
  const canUndo = shallowRef(false);
  const canRedo = shallowRef(false);
  const cleanups: Array<() => void> = [];
  let lastSerialized = '';
  let applyingExternalValue = false;

  interface ComponentHost {
    nodeKey: NodeKey;
    element: HTMLElement;
    node: RichTextEditorComponentNodeSnapshot;
    editor: LexicalEditor;
  }

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

  const serializeEditorState = (editorState: EditorState): RichTextEditorValue =>
    editorState.toJSON();

  const serializeValue = (value: RichTextEditorValue) => JSON.stringify(value);
  const withDiscreteUpdate = (options?: EditorUpdateOptions): EditorUpdateOptions => ({
    discrete: true,
    ...options,
  });

  const updateEmptyState = (editorState: EditorState) => {
    isEmpty.value = editorState.read(
      () => $getRoot().getTextContentSize() === 0 && $nodesOfType(InlineComponentNode).length === 0,
    );
  };

  const refreshComponentHosts = () => {
    const editor = editorRef.value;
    if (!editor) return;
    const hosts: ComponentHost[] = [];
    editor.getEditorState().read(() => {
      for (const node of $nodesOfType(InlineComponentNode)) {
        const nodeKey = node.getKey();
        const element = editor.getElementByKey(nodeKey);
        if (element) {
          element.classList.toggle(`${prefixCls}-component-selected`, node.isSelected());
          hosts.push({ nodeKey, element, node: node.getData(), editor });
        }
      }
    });
    componentHosts.value = hosts;
  };

  const handleUpdate = (payload: UpdateListenerPayload) => {
    const editor = editorRef.value;
    if (!editor) return;
    const context = {
      editor,
      editorState: payload.editorState,
      tags: payload.tags,
    };
    emit('update', context);
    updateEmptyState(payload.editorState);
    queueMicrotask(refreshComponentHosts);

    if (payload.dirtyElements.size === 0 && payload.dirtyLeaves.size === 0) return;
    if (props.modelValue === undefined && !hasStateListeners()) return;
    const value = serializeEditorState(payload.editorState);
    lastSerialized = serializeValue(value);
    if (!applyingExternalValue) {
      emit('update:modelValue', value);
      emit('change', value, context);
    }
  };

  const createContentNodes = (content: readonly RichTextEditorContentItem[]) => {
    const nodes: LexicalNode[] = [];
    for (const item of content) {
      if (typeof item !== 'string') {
        nodes.push($createInlineComponentNode(item));
        continue;
      }
      item.split('\n').forEach((line, index) => {
        if (index) nodes.push($createLineBreakNode());
        if (line) nodes.push($createTextNode(line));
      });
    }
    return nodes;
  };

  // setContent 将所有内容归并到单个段落：字符串中的 `\n` 变成 LineBreakNode（软换行），
  // 多个顶层段落经 getContent -> setContent 往返会塌缩为单段内的软换行。词槽等单段场景无影响。
  const setContent = (
    content: readonly RichTextEditorContentItem[],
    options?: EditorUpdateOptions,
  ) => {
    editorRef.value?.update(() => {
      const paragraph = $createParagraphNode();
      paragraph.append(...createContentNodes(content));
      $getRoot().clear().append(paragraph);
      paragraph.selectEnd();
    }, withDiscreteUpdate(options));
  };

  const setPlainText = (text: string, options?: EditorUpdateOptions) => {
    setContent([text], options);
  };

  const getContent = (): RichTextEditorContentSnapshot[] =>
    editorRef.value?.getEditorState().read(() => {
      const content: RichTextEditorContentSnapshot[] = [];
      const appendText = (value: string) => {
        if (!value) return;
        const previous = content.at(-1);
        if (typeof previous === 'string') content[content.length - 1] = previous + value;
        else content.push(value);
      };
      const visit = (node: LexicalNode) => {
        if ($isTextNode(node)) {
          appendText(node.getTextContent());
          return;
        }
        if ($isLineBreakNode(node)) {
          appendText('\n');
          return;
        }
        if ($isInlineComponentNode(node)) {
          content.push(node.getData());
          return;
        }
        if ($isElementNode(node)) node.getChildren().forEach(visit);
      };
      $getRoot()
        .getChildren()
        .forEach((node, index) => {
          if (index) appendText('\n');
          visit(node);
        });
      return content;
    }) ?? [];

  const insertContent = (
    content: readonly RichTextEditorContentItem[],
    options: RichTextEditorInsertOptions = {},
  ) => {
    const { position = 'cursor', replaceCharacters, ...updateOptions } = options;
    editorRef.value?.update(() => {
      const root = $getRoot();
      if (position === 'start') root.selectStart();
      if (position === 'end') root.selectEnd();

      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        if (replaceCharacters && selection.isCollapsed()) {
          const anchorNode = selection.anchor.getNode();
          const offset = selection.anchor.offset;
          if (
            $isTextNode(anchorNode) &&
            anchorNode.getTextContent().slice(0, offset).endsWith(replaceCharacters)
          ) {
            const start = offset - replaceCharacters.length;
            anchorNode.spliceText(start, replaceCharacters.length, '', true);
            anchorNode.select(start, start);
          }
        }
        selection.insertNodes(createContentNodes(content));
        return;
      }

      const paragraph = $createParagraphNode();
      paragraph.append(...createContentNodes(content));
      root.append(paragraph);
      paragraph.selectEnd();
    }, withDiscreteUpdate(updateOptions));
  };

  const setJSON = (value: RichTextEditorValue | string, options?: EditorSetOptions) => {
    const editor = editorRef.value;
    if (!editor) return;
    try {
      const editorState = editor.parseEditorState(value);
      editor.setEditorState(editorState, options);
      lastSerialized = JSON.stringify(editorState.toJSON());
    } catch (error) {
      const normalizedError = error instanceof Error ? error : new Error(String(error));
      emit('error', normalizedError);
      props.editorConfig?.onError?.(normalizedError);
    }
  };

  const applyInitialValue = () => {
    const defaultValue = props.defaultValue;
    if (props.modelValue) {
      setJSON(props.modelValue, { tag: 'sd-rich-text-initial' });
      return;
    }
    if (Array.isArray(defaultValue)) {
      setContent(defaultValue, { tag: 'sd-rich-text-initial' });
      return;
    }
    if (typeof defaultValue === 'string') {
      setPlainText(defaultValue, { tag: 'sd-rich-text-initial' });
      return;
    }
    if (defaultValue) {
      setJSON(defaultValue as RichTextEditorValue, { tag: 'sd-rich-text-initial' });
      return;
    }
    setPlainText('', { tag: 'sd-rich-text-initial' });
  };

  const updateComponent = (nodeKey: NodeKey, value: JsonValue, options?: EditorUpdateOptions) => {
    editorRef.value?.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isInlineComponentNode(node)) node.setValue(value);
    }, withDiscreteUpdate(options));
  };

  const removeComponent = (nodeKey: NodeKey, options?: EditorUpdateOptions) => {
    editorRef.value?.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isInlineComponentNode(node)) node.remove();
    }, withDiscreteUpdate(options));
  };

  const insertText = (text: string, options: RichTextEditorInsertOptions = {}) => {
    const { position = 'cursor', replaceCharacters, ...updateOptions } = options;
    editorRef.value?.update(() => {
      const root = $getRoot();
      if (position === 'start') root.selectStart();
      if (position === 'end') root.selectEnd();

      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        if (replaceCharacters && selection.isCollapsed()) {
          const anchorNode = selection.anchor.getNode();
          const offset = selection.anchor.offset;
          if (
            $isTextNode(anchorNode) &&
            anchorNode.getTextContent().slice(0, offset).endsWith(replaceCharacters)
          ) {
            const start = offset - replaceCharacters.length;
            anchorNode.spliceText(start, replaceCharacters.length, '', true);
            anchorNode.select(start, start);
          }
        }
        selection.insertText(text);
        return;
      }

      const paragraph = $createParagraphNode().append($createTextNode(text));
      root.append(paragraph);
      paragraph.selectEnd();
    }, withDiscreteUpdate(updateOptions));
  };

  const insertComponent = (
    data: RichTextEditorComponentNodeData,
    options?: RichTextEditorInsertOptions,
  ) => insertContent([data], options);

  const clear = () => {
    setPlainText('', { tag: 'sd-rich-text-clear' });
  };

  const getJSON = () => editorRef.value?.getEditorState().toJSON();
  const getText = () =>
    editorRef.value?.getEditorState().read(() => $getRoot().getTextContent()) ?? '';
  const getHTML = () => {
    const editor = editorRef.value;
    return editor?.getEditorState().read(() => $generateHtmlFromNodes(editor)) ?? '';
  };
  const setHTML = (html: string, options?: EditorUpdateOptions) => {
    const editor = editorRef.value;
    if (!editor) return;
    editor.update(() => {
      const dom = new DOMParser().parseFromString(html, 'text/html');
      const nodes = $generateNodesFromDOM(editor, dom);
      $getRoot()
        .clear()
        .append(...nodes);
    }, withDiscreteUpdate(options));
  };
  const getMarkdown = (transformers = props.transformers) =>
    editorRef.value?.getEditorState().read(() => $convertToMarkdownString([...transformers])) ?? '';
  const setMarkdown = (
    markdown: string,
    transformers = props.transformers,
    options?: EditorUpdateOptions,
  ) => {
    editorRef.value?.update(
      () => $convertFromMarkdownString(markdown, [...transformers]),
      withDiscreteUpdate(options),
    );
  };
  const formatText = (format: TextFormatType) =>
    editorRef.value?.dispatchCommand(FORMAT_TEXT_COMMAND, format) ?? false;
  const undo = () => editorRef.value?.dispatchCommand(UNDO_COMMAND, undefined) ?? false;
  const redo = () => editorRef.value?.dispatchCommand(REDO_COMMAND, undefined) ?? false;
  function dispatchCommand<T>(command: LexicalCommand<T>, payload: T): boolean {
    return editorRef.value?.dispatchCommand(command, payload) ?? false;
  }

  const warnNotReady = (method: string) => {
    // oxlint-disable-next-line no-console
    console.warn(
      `[RichTextEditor] ${method}() was called before the editor is ready; call it after the \`ready\` event.`,
    );
  };

  function registerCommand<T>(
    command: LexicalCommand<T>,
    listener: CommandListener<T>,
    priority: CommandListenerPriority,
  ): () => void {
    if (!editorRef.value) warnNotReady('registerCommand');
    return editorRef.value?.registerCommand(command, listener, priority) ?? (() => {});
  }

  const registerUpdateListener: LexicalEditor['registerUpdateListener'] = (listener) => {
    if (!editorRef.value) warnNotReady('registerUpdateListener');
    return editorRef.value?.registerUpdateListener(listener) ?? (() => {});
  };

  const registerMutationListener = (
    klass: Klass<LexicalNode>,
    listener: MutationListener,
    options?: RichTextEditorMutationListenerOptions,
  ) => {
    if (!editorRef.value) warnNotReady('registerMutationListener');
    return editorRef.value?.registerMutationListener(klass, listener, options) ?? (() => {});
  };

  function registerNodeTransform<T extends LexicalNode>(
    klass: Klass<T>,
    listener: Transform<T>,
  ): () => void {
    if (!editorRef.value) warnNotReady('registerNodeTransform');
    return editorRef.value?.registerNodeTransform(klass, listener) ?? (() => {});
  }

  onMounted(() => {
    if (!rootRef.value) return;
    const configuredNodes = props.editorConfig?.nodes ?? [];
    const editor = createEditor({
      ...props.editorConfig,
      namespace: props.editorConfig?.namespace ?? 'SdRichTextEditor',
      editable: !props.disabled && !props.readonly,
      nodes: [
        HeadingNode,
        QuoteNode,
        CodeNode,
        CodeHighlightNode,
        ListNode,
        ListItemNode,
        LinkNode,
        AutoLinkNode,
        InlineComponentNode,
        ...configuredNodes,
      ],
      onError: (error) => {
        emit('error', error);
        props.editorConfig?.onError?.(error);
      },
      theme: {
        paragraph: `${prefixCls}-paragraph`,
        quote: `${prefixCls}-quote`,
        heading: {
          h1: `${prefixCls}-heading-h1`,
          h2: `${prefixCls}-heading-h2`,
          h3: `${prefixCls}-heading-h3`,
          h4: `${prefixCls}-heading-h4`,
          h5: `${prefixCls}-heading-h5`,
          h6: `${prefixCls}-heading-h6`,
        },
        list: {
          listitem: `${prefixCls}-list-item`,
          nested: { listitem: `${prefixCls}-list-item-nested` },
          ol: `${prefixCls}-list-ordered`,
          ul: `${prefixCls}-list-unordered`,
        },
        link: `${prefixCls}-link`,
        code: `${prefixCls}-code`,
        text: {
          bold: `${prefixCls}-text-bold`,
          italic: `${prefixCls}-text-italic`,
          underline: `${prefixCls}-text-underline`,
          strikethrough: `${prefixCls}-text-strikethrough`,
          code: `${prefixCls}-text-code`,
        },
        ...props.editorConfig?.theme,
      },
    });
    editorRef.value = editor;
    editor.setRootElement(rootRef.value);
    cleanups.push(registerRichText(editor));
    cleanups.push(editor.registerUpdateListener(handleUpdate));
    cleanups.push(
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        (value) => {
          canUndo.value = value;
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        (value) => {
          canRedo.value = value;
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
    );
    if (props.history) {
      cleanups.push(
        registerHistory(
          editor,
          createEmptyHistoryState(),
          props.historyDelay,
          Date.now,
          undefined,
          props.historyMaxDepth,
        ),
      );
    }
    for (const plugin of props.plugins) {
      const cleanup = plugin(editor, { rootElement: rootRef.value });
      if (cleanup) cleanups.push(cleanup);
    }
    applyInitialValue();
    emit('ready', editor);
    nextTick(refreshComponentHosts);
  });

  watch(
    () => props.modelValue,
    (value) => {
      if (!value || !editorRef.value) return;
      const serialized = serializeValue(value);
      if (serialized === lastSerialized) return;
      applyingExternalValue = true;
      setJSON(value, { tag: 'sd-rich-text-external' });
      queueMicrotask(() => {
        applyingExternalValue = false;
      });
    },
    { deep: true },
  );

  watch(
    () => [props.disabled, props.readonly] as const,
    ([disabled, readonly]) => {
      editorRef.value?.setEditable(!disabled && !readonly);
    },
  );

  onBeforeUnmount(() => {
    while (cleanups.length) cleanups.pop()?.();
    editorRef.value?.setRootElement(null);
    editorRef.value = null;
    componentHosts.value = [];
  });

  defineExpose({
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
    focus: (callback?: () => void, options: RichTextEditorFocusOptions = {}) => {
      const { selection, preventScroll, ...focusOptions } = options;
      const editor = editorRef.value;
      if (preventScroll) {
        editor?.update(
          () => {
            const root = $getRoot();
            if (selection === 'start') root.selectStart();
            else if (selection === 'end') root.selectEnd();
            else if (selection === 'all') root.select(0, root.getChildrenSize());
            else {
              const currentSelection = $getSelection();
              if (currentSelection) $setSelection(currentSelection.clone());
              else if (root.getChildrenSize()) {
                if (focusOptions.defaultSelection === 'rootStart') root.selectStart();
                else root.selectEnd();
              }
            }
          },
          {
            discrete: true,
            onUpdate: callback,
            tag: SKIP_SCROLL_INTO_VIEW_TAG,
          },
        );
        return;
      }
      if (selection) {
        editor?.update(
          () => {
            const root = $getRoot();
            if (selection === 'start') root.selectStart();
            if (selection === 'end') root.selectEnd();
            if (selection === 'all') root.select(0, root.getChildrenSize());
          },
          { discrete: true },
        );
      }
      editor?.focus(callback, focusOptions);
    },
    blur: () => editorRef.value?.blur(),
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
    read: <T>(callback: () => T) => editorRef.value?.getEditorState().read(callback),
    update: (callback: () => void, options?: EditorUpdateOptions) =>
      editorRef.value?.update(callback, options),
    dispatchCommand,
    registerCommand,
    registerUpdateListener,
    registerMutationListener,
    registerNodeTransform,
  });
</script>
