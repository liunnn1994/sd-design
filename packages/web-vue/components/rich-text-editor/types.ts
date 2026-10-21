import type { Transformer } from '@sdata/web-core/rich-text-editor/types';
import type { RichTextEditorEmits as CoreRichTextEditorEmits } from '@sdata/web-core/rich-text-editor/types';
import type {
  RichTextEditorValue,
  RichTextEditorSemanticType,
  RichTextEditorConfig,
  RichTextEditorAutoSize,
  RichTextEditorComponentNodeData,
  RichTextEditorContentItem,
  RichTextEditorNodeRenderContext,
  RichTextEditorPlugin,
} from '@sdata/web-core/rich-text-editor/types';
import type { LexicalEditor, SerializedEditorState } from 'lexical';
import type { JsonObject, JsonValue } from 'type-fest';

import type { CSSProperties, VNodeChild } from 'vue';

import type { TagColor } from '../tag';
import type {
  RichTextEditorBuiltInNodeName,
  RichTextEditorJsonFormNodeName,
} from './built-in-components';
export type * from '@sdata/web-core/rich-text-editor/types';

export interface RichTextEditorEmits extends CoreRichTextEditorEmits {
  'update:modelValue': [value: SerializedEditorState];
  'ready': [editor: LexicalEditor];
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
  defaultValue?: RichTextEditorValue | string | readonly RichTextEditorContentItem[];
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

export interface RichTextEditorSlots {
  placeholder?: () => VNodeChild;
  /**
   * Dynamic custom component slots use `node-${name}`.
   */
  [name: `node-${string}`]: ((context: RichTextEditorNodeRenderContext) => VNodeChild) | undefined;
}
