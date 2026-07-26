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

import type { CSSProperties, VNodeChild } from 'vue';

import type { SelectOption } from '../select';
import type { TagColor } from '../tag';
import type {
  RichTextEditorBuiltInNodeName,
  RichTextEditorJsonFormNodeName,
} from './built-in-components';

export type RichTextEditorValue = SerializedEditorState;

export type RichTextEditorSemanticType = 'root' | 'content' | 'placeholder' | 'component';

export interface RichTextEditorFocusOptions {
  defaultSelection?: 'rootStart' | 'rootEnd';
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

export interface RichTextEditorJsonFormNodeData extends RichTextEditorComponentNodeData {
  name: RichTextEditorJsonFormNodeName;
}

export interface RichTextEditorTagNodeData extends RichTextEditorComponentNodeData {
  name: 'tag';
  value?: JsonValue;
  props?: {
    label?: string;
    color?: TagColor | string;
    closable?: boolean;
  } & JsonObject;
}

export type RichTextEditorBuiltInNodeData =
  | RichTextEditorJsonFormNodeData
  | RichTextEditorTagNodeData;

export type { RichTextEditorBuiltInNodeName, RichTextEditorJsonFormNodeName };

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

export interface RichTextEditorProps {
  /**
   * @zh 受控的 Lexical 序列化状态
   * @en Controlled serialized Lexical state
   */
  modelValue?: RichTextEditorValue;
  /**
   * @zh 非受控初始状态，也可直接传入纯文本
   * @en Uncontrolled initial state, or plain text
   */
  defaultValue?: RichTextEditorValue | string;
  /**
   * @zh Lexical 初始化配置，可注册自定义 nodes、theme、HTML 转换与错误处理
   * @en Lexical initialization config for custom nodes, theme, HTML conversions and errors
   */
  editorConfig?: RichTextEditorConfig;
  /**
   * @zh 编辑器初始化时注册的 Lexical 插件
   * @en Lexical plugins registered when the editor is initialized
   */
  plugins?: readonly RichTextEditorPlugin[];
  /**
   * @zh Markdown 导入导出的转换器
   * @en Transformers used for Markdown import and export
   */
  transformers?: readonly Transformer[];
  /**
   * @zh 提示文字
   * @en Placeholder text
   */
  placeholder?: string;
  /**
   * @zh 是否禁用
   * @en Whether the editor is disabled
   */
  disabled?: boolean;
  /**
   * @zh 是否只读
   * @en Whether the editor is read-only
   */
  readonly?: boolean;
  /**
   * @zh 是否启用撤销与重做历史
   * @en Whether undo and redo history is enabled
   */
  history?: boolean;
  /**
   * @zh 连续输入合并为同一条历史记录的间隔
   * @en Delay used to merge continuous input into one history entry
   */
  historyDelay?: number;
  /**
   * @zh 历史记录最大深度；null 表示不限制
   * @en Maximum history depth; null means unlimited
   */
  historyMaxDepth?: number | null;
  /**
   * @zh 是否启用自适应高度
   * @en Whether automatic height is enabled
   */
  autoSize?: boolean | RichTextEditorAutoSize;
  /**
   * @zh 是否启用拼写检查
   * @en Whether spell checking is enabled
   */
  spellcheck?: boolean;
  /**
   * @zh 输入区的无障碍名称
   * @en Accessible name of the editor
   */
  ariaLabel?: string;
  /**
   * @zh 语义化节点类名
   * @en Semantic node class names
   */
  classNames?: Partial<Record<RichTextEditorSemanticType, string>>;
  /**
   * @zh 语义化节点样式
   * @en Semantic node styles
   */
  styles?: Partial<Record<RichTextEditorSemanticType, CSSProperties>>;
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

export interface RichTextEditorSlots {
  placeholder?: () => VNodeChild;
  /**
   * Dynamic custom component slots use `node-${name}`.
   */
  [name: `node-${string}`]: ((context: RichTextEditorNodeRenderContext) => VNodeChild) | undefined;
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
  getText: () => string;
  getHTML: () => string;
  setHTML: (html: string, options?: EditorUpdateOptions) => void;
  getMarkdown: (transformers?: readonly Transformer[]) => string;
  setMarkdown: (
    markdown: string,
    transformers?: readonly Transformer[],
    options?: EditorUpdateOptions,
  ) => void;
  insertText: (text: string, options?: EditorUpdateOptions) => void;
  insertComponent: (data: RichTextEditorComponentNodeData, options?: EditorUpdateOptions) => void;
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
