import { SenderHeader } from './header.js';
import { SenderView } from './sender.js';
import { SenderSwitch } from './switch.js';
export const Sender = Object.assign(SenderView, { Header: SenderHeader, Switch: SenderSwitch });
export { Sender as default, SenderHeader, SenderSwitch };
export { default as RecorderCore } from '@sdata/web-core/sender/recorder-engine';
export type * from './types.js';
