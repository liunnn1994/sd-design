import type { JsonFormBuiltinComponentType } from '../json-form/types';

import { JSON_FORM_COMPONENT_TYPES } from '../json-form/types';

export type RichTextEditorJsonFormNodeName = JsonFormBuiltinComponentType;
export type RichTextEditorBuiltInNodeName = RichTextEditorJsonFormNodeName | 'tag';

export const RICH_TEXT_EDITOR_JSON_FORM_NODE_NAMES = Object.freeze(
  Object.values(JSON_FORM_COMPONENT_TYPES),
) as readonly RichTextEditorJsonFormNodeName[];

export const RICH_TEXT_EDITOR_BUILT_IN_NODE_NAMES = Object.freeze([
  ...RICH_TEXT_EDITOR_JSON_FORM_NODE_NAMES,
  'tag',
]) as readonly RichTextEditorBuiltInNodeName[];
