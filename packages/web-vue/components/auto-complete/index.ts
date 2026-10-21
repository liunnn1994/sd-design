import type { App } from 'vue';

import type { SDOptions } from '../_utils/types';

import { setGlobalConfig, getComponentPrefix } from '../_utils/global-config';
import _AutoComplete from './auto-complete.vue';

export type {
  AutoCompleteData,
  AutoCompleteFilterOption,
  AutoCompleteChangeHandler,
  AutoCompleteSearchHandler,
  AutoCompleteSelectHandler,
  AutoCompleteClearHandler,
  AutoCompleteDropdownScrollHandler,
  AutoCompleteDropdownReachBottomHandler,
} from '@sdata/web-core/auto-complete/types';

const AutoComplete = Object.assign(_AutoComplete, {
  install: (app: App, options?: SDOptions) => {
    setGlobalConfig(app, options);
    const componentPrefix = getComponentPrefix(options);

    app.component(componentPrefix + _AutoComplete.name, _AutoComplete);
  },
});

export type AutoCompleteInstance = InstanceType<typeof _AutoComplete>;

export default AutoComplete;
