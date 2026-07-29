import type { App } from 'vue';

import type { SDOptions } from '../_utils/types';

import { getComponentPrefix, setGlobalConfig } from '../_utils/global-config';
import _ModelSelectorContent from './model-selector-content.vue';
import _ModelSelectorDialog from './model-selector-dialog.vue';
import _ModelSelectorEmpty from './model-selector-empty.vue';
import _ModelSelectorGroup from './model-selector-group.vue';
import _ModelSelectorInput from './model-selector-input.vue';
import _ModelSelectorItem from './model-selector-item.vue';
import _ModelSelectorList from './model-selector-list.vue';
import _ModelSelectorLogoGroup from './model-selector-logo-group.vue';
import _ModelSelectorLogo from './model-selector-logo.vue';
import _ModelSelectorName from './model-selector-name.vue';
import _ModelSelectorSeparator from './model-selector-separator.vue';
import _ModelSelectorShortcut from './model-selector-shortcut.vue';
import _ModelSelectorTrigger from './model-selector-trigger.vue';
import _ModelSelector from './model-selector.vue';

const subcomponents = [
  _ModelSelectorTrigger,
  _ModelSelectorContent,
  _ModelSelectorDialog,
  _ModelSelectorInput,
  _ModelSelectorList,
  _ModelSelectorEmpty,
  _ModelSelectorGroup,
  _ModelSelectorItem,
  _ModelSelectorShortcut,
  _ModelSelectorSeparator,
  _ModelSelectorLogo,
  _ModelSelectorLogoGroup,
  _ModelSelectorName,
] as const;

const ModelSelector = Object.assign(_ModelSelector, {
  Trigger: _ModelSelectorTrigger,
  Content: _ModelSelectorContent,
  Dialog: _ModelSelectorDialog,
  Input: _ModelSelectorInput,
  List: _ModelSelectorList,
  Empty: _ModelSelectorEmpty,
  Group: _ModelSelectorGroup,
  Item: _ModelSelectorItem,
  Shortcut: _ModelSelectorShortcut,
  Separator: _ModelSelectorSeparator,
  Logo: _ModelSelectorLogo,
  LogoGroup: _ModelSelectorLogoGroup,
  Name: _ModelSelectorName,
  install: (app: App, options?: SDOptions) => {
    setGlobalConfig(app, options);
    const componentPrefix = getComponentPrefix(options);
    app.component(componentPrefix + _ModelSelector.name, _ModelSelector);
    subcomponents.forEach((component) => {
      app.component(componentPrefix + component.name, component);
    });
  },
});

export type ModelSelectorInstance = InstanceType<typeof _ModelSelector>;
export type ModelSelectorTriggerInstance = InstanceType<typeof _ModelSelectorTrigger>;
export type ModelSelectorContentInstance = InstanceType<typeof _ModelSelectorContent>;
export type ModelSelectorDialogInstance = InstanceType<typeof _ModelSelectorDialog>;
export type ModelSelectorInputInstance = InstanceType<typeof _ModelSelectorInput>;
export type ModelSelectorListInstance = InstanceType<typeof _ModelSelectorList>;
export type ModelSelectorEmptyInstance = InstanceType<typeof _ModelSelectorEmpty>;
export type ModelSelectorGroupInstance = InstanceType<typeof _ModelSelectorGroup>;
export type ModelSelectorItemInstance = InstanceType<typeof _ModelSelectorItem>;
export type ModelSelectorShortcutInstance = InstanceType<typeof _ModelSelectorShortcut>;
export type ModelSelectorSeparatorInstance = InstanceType<typeof _ModelSelectorSeparator>;
export type ModelSelectorLogoInstance = InstanceType<typeof _ModelSelectorLogo>;
export type ModelSelectorLogoGroupInstance = InstanceType<typeof _ModelSelectorLogoGroup>;
export type ModelSelectorNameInstance = InstanceType<typeof _ModelSelectorName>;

export type {
  ModelSelectorItemData,
  ModelSelectorKnownProvider,
  ModelSelectorProvider,
} from './types';
export { MODEL_SELECTOR_PROVIDERS } from './types';

export {
  _ModelSelectorContent as ModelSelectorContent,
  _ModelSelectorDialog as ModelSelectorDialog,
  _ModelSelectorEmpty as ModelSelectorEmpty,
  _ModelSelectorGroup as ModelSelectorGroup,
  _ModelSelectorInput as ModelSelectorInput,
  _ModelSelectorItem as ModelSelectorItem,
  _ModelSelectorList as ModelSelectorList,
  _ModelSelectorLogo as ModelSelectorLogo,
  _ModelSelectorLogoGroup as ModelSelectorLogoGroup,
  _ModelSelectorName as ModelSelectorName,
  _ModelSelectorSeparator as ModelSelectorSeparator,
  _ModelSelectorShortcut as ModelSelectorShortcut,
  _ModelSelectorTrigger as ModelSelectorTrigger,
};

export default ModelSelector;
