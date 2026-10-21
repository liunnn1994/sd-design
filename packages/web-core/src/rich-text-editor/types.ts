import type { Transformer } from '@lexical/markdown';
import type {
  CommandListener,
  CommandListenerPriority,
  CreateEditorArgs,
  EditorSetOptions,
  EditorState,
  EditorUpdateOptions,
  Klass,
  LexicalCommand,
  LexicalEditor,
  LexicalNode,
  MutationListener,
  NodeKey,
  SerializedEditorState,
  TextFormatType,
  Transform,
  UpdateListener,
} from 'lexical';
import type { Except, JsonObject, JsonValue, ReadonlyDeep } from 'type-fest';

import type { SelectOption } from '../select/types.js';

export type { Transformer } from '@lexical/markdown';

export type RichTextEditorValue = SerializedEditorState;

export type RichTextEditorSemanticType = 'root' | 'content' | 'placeholder' | 'component';

export interface RichTextEditorFocusOptions {
  defaultSelection?: 'rootStart' | 'rootEnd';
  selection?: 'start' | 'end' | 'all';
  preventScroll?: boolean;
}

export interface RichTextEditorMutationListenerOptions {
  skipInitialization?: boolean;
}

export type RichTextEditorConfig = Except<CreateEditorArgs, 'editable' | 'editorState'>;

export interface RichTextEditorAutoSize {
  minRows?: number;
  maxRows?: number;
}

export interface RichTextEditorComponentNodeData {
  /**
   * @zh 组件节点的稳定业务标识
   * @en Stable business identifier of the component node
   */
  key: string;
  /**
   * @zh 组件节点名称；内置支持 JsonForm 的全部节点与 tag
   * @en Component node name; all JsonForm nodes and tag are built in
   */
  name: string;
  /**
   * @zh 可序列化的组件值
   * @en Serializable component value
   */
  value?: JsonValue;
  /**
   * @zh 可序列化的组件属性
   * @en Serializable component properties
   */
  props?: JsonObject;
  /**
   * @zh 节点参与纯文本、HTML 与 Markdown 导出时使用的文本
   * @en Text used when the node participates in plain text, HTML and Markdown export
   */
  textValue?: string;
}

export type RichTextEditorComponentNodeSnapshot = ReadonlyDeep<RichTextEditorComponentNodeData>;
export type RichTextEditorContentItem = string | RichTextEditorComponentNodeData;
export type RichTextEditorContentSnapshot = string | RichTextEditorComponentNodeSnapshot;

export interface RichTextEditorInsertOptions extends EditorUpdateOptions {
  position?: 'start' | 'end' | 'cursor';
  replaceCharacters?: string;
}

export interface RichTextEditorInputNodeData extends RichTextEditorComponentNodeData {
  name: 'input';
  value?: string | number;
  props?: {
    placeholder?: string;
  } & JsonObject;
}

export interface RichTextEditorSelectNodeData extends RichTextEditorComponentNodeData {
  name: 'select';
  value?: JsonValue;
  props: {
    options: SelectOption[];
    placeholder?: string;
  } & JsonObject;
}

export interface RichTextEditorNodeRenderContext {
  nodeKey: NodeKey;
  node: RichTextEditorComponentNodeSnapshot;
  disabled: boolean;
  readonly: boolean;
  update: (value: JsonValue) => void;
  remove: () => void;
  editor: LexicalEditor;
}

export interface RichTextEditorPluginContext {
  rootElement: HTMLElement;
}

export type RichTextEditorPlugin = (
  editor: LexicalEditor,
  context: RichTextEditorPluginContext,
) => undefined | (() => void);

export interface RichTextEditorChangeContext {
  editor: LexicalEditor;
  editorState: EditorState;
  tags: ReadonlySet<string>;
}

export interface RichTextEditorEmits {
  'update:modelValue': [value: RichTextEditorValue];
  'change': [value: RichTextEditorValue, context: RichTextEditorChangeContext];
  'update': [context: RichTextEditorChangeContext];
  'ready': [editor: LexicalEditor];
  'focus': [event: FocusEvent];
  'blur': [event: FocusEvent];
  'error': [error: Error];
}

export interface RichTextEditorRef {
  readonly editor: LexicalEditor | null;
  readonly editorState: EditorState | null;
  readonly rootElement: HTMLDivElement | null;
  readonly canUndo: boolean;
  readonly canRedo: boolean;
  focus: (callback?: () => void, options?: RichTextEditorFocusOptions) => void;
  blur: () => void;
  clear: () => void;
  undo: () => boolean;
  redo: () => boolean;
  getJSON: () => RichTextEditorValue | undefined;
  setJSON: (value: RichTextEditorValue | string, options?: EditorSetOptions) => void;
  getContent: () => RichTextEditorContentSnapshot[];
  setContent: (
    content: readonly RichTextEditorContentItem[],
    options?: EditorUpdateOptions,
  ) => void;
  insertContent: (
    content: readonly RichTextEditorContentItem[],
    options?: RichTextEditorInsertOptions,
  ) => void;
  getText: () => string;
  getHTML: () => string;
  setHTML: (html: string, options?: EditorUpdateOptions) => void;
  getMarkdown: (transformers?: readonly Transformer[]) => string;
  setMarkdown: (
    markdown: string,
    transformers?: readonly Transformer[],
    options?: EditorUpdateOptions,
  ) => void;
  insertText: (text: string, options?: RichTextEditorInsertOptions) => void;
  insertComponent: (
    data: RichTextEditorComponentNodeData,
    options?: RichTextEditorInsertOptions,
  ) => void;
  updateComponent: (nodeKey: NodeKey, value: JsonValue, options?: EditorUpdateOptions) => void;
  removeComponent: (nodeKey: NodeKey, options?: EditorUpdateOptions) => void;
  formatText: (format: TextFormatType) => boolean;
  read: <T>(callback: () => T) => T | undefined;
  update: (callback: () => void, options?: EditorUpdateOptions) => void;
  dispatchCommand: <T>(command: LexicalCommand<T>, payload: T) => boolean;
  registerCommand: <T>(
    command: LexicalCommand<T>,
    listener: CommandListener<T>,
    priority: CommandListenerPriority,
  ) => () => void;
  registerUpdateListener: (listener: UpdateListener) => () => void;
  registerMutationListener: (
    klass: Klass<LexicalNode>,
    listener: MutationListener,
    options?: RichTextEditorMutationListenerOptions,
  ) => () => void;
  registerNodeTransform: <T extends LexicalNode>(
    klass: Klass<T>,
    listener: Transform<T>,
  ) => () => void;
}

export interface RichTextEditorOptions {
  modelValue?: RichTextEditorValue;
  defaultValue?: RichTextEditorValue | string | readonly RichTextEditorContentItem[];
  editorConfig?: RichTextEditorConfig;
  plugins: readonly RichTextEditorPlugin[];
  transformers: readonly Transformer[];
  disabled?: boolean;
  readonly?: boolean;
  history: boolean;
  historyDelay: number;
  historyMaxDepth: number | null;
}
