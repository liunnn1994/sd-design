import type { InjectionKey, Ref } from 'vue';

import type { SenderProps } from './types';

export interface SenderContext {
  prefixCls: string;
  classNames: Ref<SenderProps['classNames']>;
  styles: Ref<SenderProps['styles']>;
}

export const senderInjectionKey: InjectionKey<SenderContext> = Symbol('Sender');
