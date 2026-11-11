import type { JsonFormBuiltinComponentType } from '@sdata/web-core/json-form/types';
import type {
  RichTextEditorOptions,
  RichTextEditorAutoSize,
  RichTextEditorEmits,
  RichTextEditorNodeRenderContext,
  RichTextEditorRef,
  RichTextEditorSemanticType,
  RichTextEditorComponentNodeData,
} from '@sdata/web-core/rich-text-editor/types';
import type { CSSProperties, HTMLAttributes, ReactNode, Ref } from 'react';
import type { JsonObject, JsonValue } from 'type-fest';

import type { TagProps } from '../tag/index.js';

export type * from '@sdata/web-core/rich-text-editor/types';
export type RichTextEditorInstance = RichTextEditorRef;
export type RichTextEditorJsonFormNodeName = JsonFormBuiltinComponentType;
export type RichTextEditorBuiltInNodeName = RichTextEditorJsonFormNodeName | 'tag';
export interface RichTextEditorJsonFormNodeData extends RichTextEditorComponentNodeData {
  name: RichTextEditorJsonFormNodeName;
}
export interface RichTextEditorTagNodeData extends RichTextEditorComponentNodeData {
  name: 'tag';
  value?: JsonValue;
  props?: { label?: string; color?: TagProps['color']; closable?: boolean } & JsonObject;
}
export type RichTextEditorBuiltInNodeData =
  | RichTextEditorJsonFormNodeData
  | RichTextEditorTagNodeData;
export interface RichTextEditorSlots {
  placeholder?: () => ReactNode;
  [name: `node-${string}`]: ((context: RichTextEditorNodeRenderContext) => ReactNode) | undefined;
}
export interface RichTextEditorProps
  extends
    Partial<RichTextEditorOptions>,
    Omit<
      HTMLAttributes<HTMLDivElement>,
      'defaultValue' | 'onChange' | 'onError' | 'onFocus' | 'onBlur' | 'onUpdate'
    > {
  ref?: Ref<RichTextEditorRef>;
  value?: RichTextEditorOptions['modelValue'];
  placeholder?: string;
  autoSize?: boolean | RichTextEditorAutoSize;
  spellcheck?: boolean;
  ariaLabel?: string;
  classNames?: Partial<Record<RichTextEditorSemanticType, string>>;
  styles?: Partial<Record<RichTextEditorSemanticType, CSSProperties>>;
  slots?: RichTextEditorSlots;
  onValueChange?: (...args: RichTextEditorEmits['update:modelValue']) => void;
  onChange?: (...args: RichTextEditorEmits['change']) => void;
  onUpdate?: (...args: RichTextEditorEmits['update']) => void;
  onReady?: (...args: RichTextEditorEmits['ready']) => void;
  onFocus?: (...args: RichTextEditorEmits['focus']) => void;
  onBlur?: (...args: RichTextEditorEmits['blur']) => void;
  onError?: (...args: RichTextEditorEmits['error']) => void;
}
