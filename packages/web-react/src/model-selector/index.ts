import type { ComponentRef as ReactComponentRef } from 'react';

import { ModelSelectorContent, ModelSelectorDialog } from './content.js';
import { ModelSelectorGroup } from './group.js';
import { ModelSelectorInput } from './input.js';
import { ModelSelectorItem } from './item.js';
import { ModelSelectorLogo } from './logo.js';
import { ModelSelector as ModelSelectorRoot } from './model-selector.js';
import { ModelSelectorTrigger } from './trigger.js';
import {
  ModelSelectorEmpty,
  ModelSelectorList,
  ModelSelectorLogoGroup,
  ModelSelectorName,
  ModelSelectorSeparator,
  ModelSelectorShortcut,
} from './views.js';

export const ModelSelector = Object.assign(ModelSelectorRoot, {
  Trigger: ModelSelectorTrigger,
  Content: ModelSelectorContent,
  Dialog: ModelSelectorDialog,
  Input: ModelSelectorInput,
  List: ModelSelectorList,
  Empty: ModelSelectorEmpty,
  Group: ModelSelectorGroup,
  Item: ModelSelectorItem,
  Shortcut: ModelSelectorShortcut,
  Separator: ModelSelectorSeparator,
  Logo: ModelSelectorLogo,
  LogoGroup: ModelSelectorLogoGroup,
  Name: ModelSelectorName,
});
export { ModelSelector as default };
export type { ModelSelectorProps, ModelSelectorSlotProps } from './model-selector.js';
export { ModelSelectorContent, ModelSelectorDialog } from './content.js';
export type { ModelSelectorContentProps, ModelSelectorDialogProps } from './content.js';
export { ModelSelectorTrigger } from './trigger.js';
export type { ModelSelectorTriggerProps, ModelSelectorTriggerSlotProps } from './trigger.js';
export { ModelSelectorInput } from './input.js';
export type { ModelSelectorInputProps } from './input.js';
export { ModelSelectorGroup } from './group.js';
export type { ModelSelectorGroupProps } from './group.js';
export { ModelSelectorItem } from './item.js';
export type { ModelSelectorItemProps, ModelSelectorItemSlotProps } from './item.js';
export { ModelSelectorLogo } from './logo.js';
export type { ModelSelectorLogoProps } from './logo.js';
export {
  ModelSelectorEmpty,
  ModelSelectorList,
  ModelSelectorLogoGroup,
  ModelSelectorName,
  ModelSelectorSeparator,
  ModelSelectorShortcut,
} from './views.js';
export type {
  ModelSelectorEmptyProps,
  ModelSelectorListProps,
  ModelSelectorLogoGroupProps,
  ModelSelectorNameProps,
  ModelSelectorSeparatorProps,
  ModelSelectorShortcutProps,
} from './views.js';
export { MODEL_SELECTOR_PROVIDERS } from '@sdata/web-core/model-selector/types';
export type {
  ModelSelectorItemData,
  ModelSelectorKnownProvider,
  ModelSelectorProvider,
} from '@sdata/web-core/model-selector/types';

export type ModelSelectorEmptyInstance = ReactComponentRef<typeof ModelSelectorEmpty>;
export type ModelSelectorGroupInstance = ReactComponentRef<typeof ModelSelectorGroup>;
export type ModelSelectorInputInstance = ReactComponentRef<typeof ModelSelectorInput>;
export type ModelSelectorItemInstance = ReactComponentRef<typeof ModelSelectorItem>;
export type ModelSelectorListInstance = ReactComponentRef<typeof ModelSelectorList>;
export type ModelSelectorLogoGroupInstance = ReactComponentRef<typeof ModelSelectorLogoGroup>;
export type ModelSelectorLogoInstance = ReactComponentRef<typeof ModelSelectorLogo>;
export type ModelSelectorNameInstance = ReactComponentRef<typeof ModelSelectorName>;
export type ModelSelectorSeparatorInstance = ReactComponentRef<typeof ModelSelectorSeparator>;
export type ModelSelectorShortcutInstance = ReactComponentRef<typeof ModelSelectorShortcut>;
