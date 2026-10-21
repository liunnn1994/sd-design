import type { PreviewGroupContext } from '@sdata/web-core/image/types';

import { InjectionKey } from 'vue';
export type { PreviewGroupContext } from '@sdata/web-core/image/types';

export const PreviewGroupInjectionKey: InjectionKey<PreviewGroupContext> = Symbol(
  'PreviewGroupInjectionKey',
);
