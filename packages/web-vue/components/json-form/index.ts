import type { App } from 'vue';

import type { SDOptions } from '../_utils/types';

import { getComponentPrefix, setGlobalConfig } from '../_utils/global-config';
import _JsonForm from './json-form.vue';

const JsonForm = Object.assign(_JsonForm, {
  install: (app: App, options?: SDOptions) => {
    setGlobalConfig(app, options);
    const componentPrefix = getComponentPrefix(options);

    app.component(componentPrefix + _JsonForm.name, _JsonForm);
  },
});

export type JsonFormInstance = InstanceType<typeof _JsonForm>;
export type {
  JsonFormA2UI_0_9_1ChoiceOption,
  JsonFormA2UI_0_9_1ComponentNode,
  JsonFormA2UI_0_9_1DataBinding,
  JsonFormA2UI_0_9_1FunctionCall,
  JsonFormAdapter,
  JsonFormComponentEvents,
  JsonFormComponentProps,
  JsonFormComponentRegistry,
  JsonFormComponentSlotRenderer,
  JsonFormComponentType,
  JsonFormExternalComponentMap,
  JsonFormItemSlotProps,
  JsonFormModel,
  JsonFormProps,
  JsonFormProviderConfig,
  JsonFormSchema,
} from './types';
export { A2UI_0_9_1, defineJsonFormComponents, defineJsonFormSchemas } from './types';

export default JsonForm;
