import type { App } from 'vue';

import type { SDOptions } from '../_utils/types';

import { getComponentPrefix, setGlobalConfig } from '../_utils/global-config';
import _SelectableCard from './selectable-card.vue';

const SelectableCard = Object.assign(_SelectableCard, {
  install: (app: App, options?: SDOptions) => {
    setGlobalConfig(app, options);
    const componentPrefix = getComponentPrefix(options);
    app.component(componentPrefix + _SelectableCard.name, _SelectableCard);
  },
});

export type SelectableCardInstance = InstanceType<typeof _SelectableCard>;
export type {
  SelectableCardAlign,
  SelectableCardColor,
  SelectableCardLayout,
  SelectableCardSize,
  SelectableCardSizeValue,
  SelectableCardVariant,
} from './types';

export default SelectableCard;
