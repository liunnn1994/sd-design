import type { App } from 'vue';

import type { SDOptions } from '../_utils/types';

import { setGlobalConfig, getComponentPrefix } from '../_utils/global-config';
import _RichTextEditor from './rich-text-editor.vue';

const RichTextEditor = Object.assign(_RichTextEditor, {
  install: (app: App, options?: SDOptions) => {
    setGlobalConfig(app, options);
    const componentPrefix = getComponentPrefix(options);
    app.component(componentPrefix + _RichTextEditor.name, _RichTextEditor);
  },
});

export {
  $createInlineComponentNode,
  $isInlineComponentNode,
  InlineComponentNode,
} from './nodes/inline-component-node';
export {
  RICH_TEXT_EDITOR_BUILT_IN_NODE_NAMES,
  RICH_TEXT_EDITOR_JSON_FORM_NODE_NAMES,
} from './built-in-components';
export type { SerializedInlineComponentNode } from './nodes/inline-component-node';
export type {
  RichTextEditorAutoSize,
  RichTextEditorBuiltInNodeData,
  RichTextEditorBuiltInNodeName,
  RichTextEditorChangeContext,
  RichTextEditorComponentNodeData,
  RichTextEditorComponentNodeSnapshot,
  RichTextEditorConfig,
  RichTextEditorContentItem,
  RichTextEditorContentSnapshot,
  RichTextEditorEmits,
  RichTextEditorFocusOptions,
  RichTextEditorInputNodeData,
  RichTextEditorJsonFormNodeData,
  RichTextEditorJsonFormNodeName,
  RichTextEditorInsertOptions,
  RichTextEditorMutationListenerOptions,
  RichTextEditorNodeRenderContext,
  RichTextEditorPlugin,
  RichTextEditorPluginContext,
  RichTextEditorProps,
  RichTextEditorRef,
  RichTextEditorSelectNodeData,
  RichTextEditorSemanticType,
  RichTextEditorSlots,
  RichTextEditorTagNodeData,
  RichTextEditorValue,
} from './types';

export type RichTextEditorInstance = InstanceType<typeof _RichTextEditor>;

export default RichTextEditor;
