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
  RangeSelection,
  TextFormatType,
  Transform,
  UpdateListenerPayload,
} from 'lexical';
import type { JsonValue } from 'type-fest';

import { CodeHighlightNode, CodeNode } from '@lexical/code';
import { createEmptyHistoryState, registerHistory } from '@lexical/history';
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { ListItemNode, ListNode } from '@lexical/list';
import { $convertFromMarkdownString, $convertToMarkdownString } from '@lexical/markdown';
import { HeadingNode, QuoteNode, registerRichText } from '@lexical/rich-text';
import {
  $createLineBreakNode,
  $createParagraphNode,
  $createTextNode,
  $getNodeByKey,
  $nodesOfType,
  $getRoot,
  $getSelection,
  $isDecoratorNode,
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
  RichTextEditorFocusOptions,
  RichTextEditorInsertOptions,
  RichTextEditorMutationListenerOptions,
  RichTextEditorValue,
} from './types.js';
import type { RichTextEditorOptions, RichTextEditorChangeContext } from './types.js';

import {
  $createInlineComponentNode,
  $isInlineComponentNode,
  InlineComponentNode,
} from './nodes/inline-component-node.js';
export { TRANSFORMERS } from '@lexical/markdown';
export interface ComponentHost {
  nodeKey: NodeKey;
  element: HTMLElement;
  node: RichTextEditorComponentNodeSnapshot;
  editor: LexicalEditor;
}

export interface RichTextEditorAdapter {
  readonly options: RichTextEditorOptions;
  readonly prefixCls: string;
  readonly editor: LexicalEditor | null;
  readonly rootElement: HTMLDivElement | undefined;
  setEditor(editor: LexicalEditor | null): void;
  setEmpty(empty: boolean): void;
  setCanUndo(value: boolean): void;
  setCanRedo(value: boolean): void;
  setComponentHosts(hosts: ComponentHost[]): void;
  hasStateListeners(): boolean;
  afterRender(task: () => void): void;
  onError(error: Error): void;
  onUpdate(context: RichTextEditorChangeContext): void;
  onUpdateValue(value: RichTextEditorValue): void;
  onChange(value: RichTextEditorValue, context: RichTextEditorChangeContext): void;
  onReady(editor: LexicalEditor): void;
}

export function createRichTextEditorFoundation(adapter: RichTextEditorAdapter) {
  const cleanups: Array<() => void> = [];
  let lastSerialized = '';
  const serializeEditorState = (editorState: EditorState): RichTextEditorValue =>
    editorState.toJSON();

  const serializeValue = (value: RichTextEditorValue) => JSON.stringify(value);
  const withDiscreteUpdate = (options?: EditorUpdateOptions): EditorUpdateOptions => ({
    discrete: true,
    ...options,
  });

  const updateEmptyState = (editorState: EditorState) => {
    adapter.setEmpty(
      editorState.read(
        () =>
          $getRoot().getTextContentSize() === 0 && $nodesOfType(InlineComponentNode).length === 0,
      ),
    );
  };

  const refreshComponentHosts = () => {
    const editor = adapter.editor;
    if (!editor) return;
    const hosts: ComponentHost[] = [];
    editor.getEditorState().read(() => {
      for (const node of $nodesOfType(InlineComponentNode)) {
        const nodeKey = node.getKey();
        const element = editor.getElementByKey(nodeKey);
        if (element) {
          element.classList.toggle(`${adapter.prefixCls}-component-selected`, node.isSelected());
          hosts.push({ nodeKey, element, node: node.getData(), editor });
        }
      }
    });
    adapter.setComponentHosts(hosts);
  };

  const handleUpdate = (payload: UpdateListenerPayload) => {
    const editor = adapter.editor;
    if (!editor) return;
    const context = {
      editor,
      editorState: payload.editorState,
      tags: payload.tags,
    };
    adapter.onUpdate(context);
    updateEmptyState(payload.editorState);
    queueMicrotask(refreshComponentHosts);

    if (payload.dirtyElements.size === 0 && payload.dirtyLeaves.size === 0) return;
    if (adapter.options.modelValue === undefined && !adapter.hasStateListeners()) return;
    const value = serializeEditorState(payload.editorState);
    lastSerialized = serializeValue(value);
    if (!payload.tags.has('sd-rich-text-external')) {
      adapter.onUpdateValue(value);
      adapter.onChange(value, context);
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
    adapter.editor?.update(() => {
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
    adapter.editor?.getEditorState().read(() => {
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

  /**
   * 将折叠选区向前扩展到待替换文本，后续 insertText/insertNodes 会在同一次
   * Lexical 更新中原子删除选区并插入新内容，避免 spliceText 后继续使用旧选区。
   * @param selection 当前 Lexical 文本选区。
   * @param replaceCharacters 光标前需要被替换的文本。
   */
  const selectReplacementCharacters = (
    selection: RangeSelection,
    replaceCharacters?: string,
  ): void => {
    if (!replaceCharacters || !selection.isCollapsed()) return;
    const anchorNode = selection.anchor.getNode();
    const offset = selection.anchor.offset;
    if (
      !$isTextNode(anchorNode) ||
      !anchorNode.getTextContent().slice(0, offset).endsWith(replaceCharacters)
    ) {
      return;
    }
    const start = offset - replaceCharacters.length;
    selection.setTextNodeRange(anchorNode, start, anchorNode, offset);
  };

  const insertContent = (
    content: readonly RichTextEditorContentItem[],
    options: RichTextEditorInsertOptions = {},
  ) => {
    const { position = 'cursor', replaceCharacters, ...updateOptions } = options;
    adapter.editor?.update(() => {
      const root = $getRoot();
      if (position === 'start') root.selectStart();
      if (position === 'end') root.selectEnd();

      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        selectReplacementCharacters(selection, replaceCharacters);
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
    const editor = adapter.editor;
    if (!editor) return;
    try {
      const editorState = editor.parseEditorState(value);
      editor.setEditorState(editorState, options);
      lastSerialized = JSON.stringify(editorState.toJSON());
    } catch (error) {
      const normalizedError = error instanceof Error ? error : new Error(String(error));
      adapter.onError(normalizedError);
      adapter.options.editorConfig?.onError?.(normalizedError);
    }
  };

  const applyInitialValue = () => {
    const defaultValue = adapter.options.defaultValue;
    if (adapter.options.modelValue) {
      setJSON(adapter.options.modelValue, { tag: 'sd-rich-text-initial' });
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
    adapter.editor?.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isInlineComponentNode(node)) node.setValue(value);
    }, withDiscreteUpdate(options));
  };

  const removeComponent = (nodeKey: NodeKey, options?: EditorUpdateOptions) => {
    adapter.editor?.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isInlineComponentNode(node)) node.remove();
    }, withDiscreteUpdate(options));
  };

  const insertText = (text: string, options: RichTextEditorInsertOptions = {}) => {
    const { position = 'cursor', replaceCharacters, ...updateOptions } = options;
    adapter.editor?.update(() => {
      const root = $getRoot();
      if (position === 'start') root.selectStart();
      if (position === 'end') root.selectEnd();

      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        selectReplacementCharacters(selection, replaceCharacters);
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

  const getJSON = () => adapter.editor?.getEditorState().toJSON();
  const getText = () =>
    adapter.editor?.getEditorState().read(() => $getRoot().getTextContent()) ?? '';
  const getHTML = () => {
    const editor = adapter.editor;
    return editor?.getEditorState().read(() => $generateHtmlFromNodes(editor)) ?? '';
  };
  const setHTML = (html: string, options?: EditorUpdateOptions) => {
    const editor = adapter.editor;
    if (!editor) return;
    editor.update(() => {
      const dom = new DOMParser().parseFromString(html, 'text/html');
      const nodes = $generateNodesFromDOM(editor, dom);
      const root = $getRoot().clear();
      let paragraph: ReturnType<typeof $createParagraphNode> | undefined;
      for (const node of nodes) {
        if (($isElementNode(node) || $isDecoratorNode(node)) && !node.isInline()) {
          root.append(node);
          paragraph = undefined;
        } else {
          if (!paragraph) root.append((paragraph = $createParagraphNode()));
          paragraph.append(node);
        }
      }
      if (root.getChildrenSize() === 0) root.append($createParagraphNode());
    }, withDiscreteUpdate(options));
  };
  const getMarkdown = (transformers = adapter.options.transformers) =>
    adapter.editor?.getEditorState().read(() => $convertToMarkdownString([...transformers])) ?? '';
  const setMarkdown = (
    markdown: string,
    transformers = adapter.options.transformers,
    options?: EditorUpdateOptions,
  ) => {
    adapter.editor?.update(
      () => $convertFromMarkdownString(markdown, [...transformers]),
      withDiscreteUpdate(options),
    );
  };
  const formatText = (format: TextFormatType) =>
    adapter.editor?.dispatchCommand(FORMAT_TEXT_COMMAND, format) ?? false;
  const undo = () => adapter.editor?.dispatchCommand(UNDO_COMMAND, undefined) ?? false;
  const redo = () => adapter.editor?.dispatchCommand(REDO_COMMAND, undefined) ?? false;
  function dispatchCommand<T>(command: LexicalCommand<T>, payload: T): boolean {
    return adapter.editor?.dispatchCommand(command, payload) ?? false;
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
    if (!adapter.editor) warnNotReady('registerCommand');
    return adapter.editor?.registerCommand(command, listener, priority) ?? (() => {});
  }

  const registerUpdateListener: LexicalEditor['registerUpdateListener'] = (listener) => {
    if (!adapter.editor) warnNotReady('registerUpdateListener');
    return adapter.editor?.registerUpdateListener(listener) ?? (() => {});
  };

  const registerMutationListener = (
    klass: Klass<LexicalNode>,
    listener: MutationListener,
    options?: RichTextEditorMutationListenerOptions,
  ) => {
    if (!adapter.editor) warnNotReady('registerMutationListener');
    return adapter.editor?.registerMutationListener(klass, listener, options) ?? (() => {});
  };

  function registerNodeTransform<T extends LexicalNode>(
    klass: Klass<T>,
    listener: Transform<T>,
  ): () => void {
    if (!adapter.editor) warnNotReady('registerNodeTransform');
    return adapter.editor?.registerNodeTransform(klass, listener) ?? (() => {});
  }

  function mount() {
    if (!adapter.rootElement) return;
    const configuredNodes = adapter.options.editorConfig?.nodes ?? [];
    const editor = createEditor({
      ...adapter.options.editorConfig,
      namespace: adapter.options.editorConfig?.namespace ?? 'SdRichTextEditor',
      editable: !adapter.options.disabled && !adapter.options.readonly,
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
        adapter.onError(error);
        adapter.options.editorConfig?.onError?.(error);
      },
      theme: {
        paragraph: `${adapter.prefixCls}-paragraph`,
        quote: `${adapter.prefixCls}-quote`,
        heading: {
          h1: `${adapter.prefixCls}-heading-h1`,
          h2: `${adapter.prefixCls}-heading-h2`,
          h3: `${adapter.prefixCls}-heading-h3`,
          h4: `${adapter.prefixCls}-heading-h4`,
          h5: `${adapter.prefixCls}-heading-h5`,
          h6: `${adapter.prefixCls}-heading-h6`,
        },
        list: {
          listitem: `${adapter.prefixCls}-list-item`,
          nested: { listitem: `${adapter.prefixCls}-list-item-nested` },
          ol: `${adapter.prefixCls}-list-ordered`,
          ul: `${adapter.prefixCls}-list-unordered`,
        },
        link: `${adapter.prefixCls}-link`,
        code: `${adapter.prefixCls}-code`,
        text: {
          bold: `${adapter.prefixCls}-text-bold`,
          italic: `${adapter.prefixCls}-text-italic`,
          underline: `${adapter.prefixCls}-text-underline`,
          strikethrough: `${adapter.prefixCls}-text-strikethrough`,
          code: `${adapter.prefixCls}-text-code`,
        },
        ...adapter.options.editorConfig?.theme,
      },
    });
    adapter.setEditor(editor);
    editor.setRootElement(adapter.rootElement);
    cleanups.push(registerRichText(editor));
    cleanups.push(editor.registerUpdateListener(handleUpdate));
    cleanups.push(
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        (value) => {
          adapter.setCanUndo(value);
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        (value) => {
          adapter.setCanRedo(value);
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
    );
    if (adapter.options.history) {
      cleanups.push(
        registerHistory(
          editor,
          createEmptyHistoryState(),
          adapter.options.historyDelay,
          Date.now,
          undefined,
          adapter.options.historyMaxDepth,
        ),
      );
    }
    for (const plugin of adapter.options.plugins) {
      const cleanup = plugin(editor, { rootElement: adapter.rootElement });
      if (cleanup) cleanups.push(cleanup);
    }
    applyInitialValue();
    adapter.onReady(editor);
    adapter.afterRender(refreshComponentHosts);
  }
  function syncModel(value: RichTextEditorValue | undefined) {
    if (!value || !adapter.editor) return;
    const serialized = serializeValue(value);
    if (serialized === lastSerialized) return;
    setJSON(value, { tag: 'sd-rich-text-external' });
  }
  function syncEditable(disabled?: boolean, readonly?: boolean) {
    adapter.editor?.setEditable(!disabled && !readonly);
  }
  function dispose() {
    while (cleanups.length) cleanups.pop()?.();
    adapter.editor?.setRootElement(null);
    adapter.setEditor(null);
    adapter.setComponentHosts([]);
  }
  const focus = (callback?: () => void, options: RichTextEditorFocusOptions = {}) => {
    const { selection, preventScroll, ...focusOptions } = options;
    const editor = adapter.editor;
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
  };
  const blur = () => adapter.editor?.blur();
  const read = <T>(callback: () => T) => adapter.editor?.getEditorState().read(callback);
  const update = (callback: () => void, options?: EditorUpdateOptions) =>
    adapter.editor?.update(callback, options);
  return {
    mount,
    dispose,
    syncModel,
    syncEditable,
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
  };
}
