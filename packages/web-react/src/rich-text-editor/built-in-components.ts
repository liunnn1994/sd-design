import { JSON_FORM_COMPONENT_TYPES } from '@sdata/web-core/json-form/types';

import type { RichTextEditorBuiltInNodeName, RichTextEditorJsonFormNodeName } from './types.js';

export const RICH_TEXT_EDITOR_JSON_FORM_NODE_NAMES = Object.freeze(
  Object.values(JSON_FORM_COMPONENT_TYPES),
) as readonly RichTextEditorJsonFormNodeName[];
export const RICH_TEXT_EDITOR_BUILT_IN_NODE_NAMES = Object.freeze([
  ...RICH_TEXT_EDITOR_JSON_FORM_NODE_NAMES,
  'tag',
]) as readonly RichTextEditorBuiltInNodeName[];
