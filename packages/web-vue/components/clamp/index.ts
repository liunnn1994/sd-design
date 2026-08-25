import type * as VueClamp from 'vue-clamp';

import type { App, Component } from 'vue';

import {
  InlineClamp as _InlineClamp,
  LineClamp as _LineClamp,
  RichLineClamp as _RichLineClamp,
  WrapClamp as _WrapClamp,
} from 'vue-clamp';

import type { SDOptions, SFCWithInstall } from '../_utils/types';

import { getComponentPrefix, setGlobalConfig } from '../_utils/global-config';

function withInstall<T extends object>(component: T, name: string) {
  return Object.assign(component, {
    install(app: App, options?: SDOptions) {
      setGlobalConfig(app, options);
      app.component(`${getComponentPrefix(options)}${name}`, component as Component);
    },
  }) as SFCWithInstall<T>;
}

export const LineClamp = withInstall(_LineClamp, 'LineClamp');
export const RichLineClamp = withInstall(_RichLineClamp, 'RichLineClamp');
export const InlineClamp = withInstall(_InlineClamp, 'InlineClamp');
export const WrapClamp = withInstall(_WrapClamp, 'WrapClamp');

export type LineClampInstance = InstanceType<typeof _LineClamp>;
export type RichLineClampInstance = InstanceType<typeof _RichLineClamp>;
export type InlineClampInstance = InstanceType<typeof _InlineClamp>;
export type WrapClampInstance = import('vue-clamp').WrapClampExposed;

export type ClampBoundary = VueClamp.ClampBoundary;
export type ClampLength = VueClamp.ClampLength;
export type InlineClampParts = VueClamp.InlineClampParts;
export type InlineClampProps = VueClamp.InlineClampProps;
export type InlineClampSplit = VueClamp.InlineClampSplit;
export type LineClampExposed = VueClamp.LineClampExposed;
export type LineClampLocation = VueClamp.LineClampLocation;
export type LineClampProps = VueClamp.LineClampProps;
export type LineClampSlotProps = VueClamp.LineClampSlotProps;
export type LineClampSlots = VueClamp.LineClampSlots;
export type RichLineClampExposed = VueClamp.RichLineClampExposed;
export type RichLineClampProps = VueClamp.RichLineClampProps;
export type RichLineClampSlotProps = VueClamp.RichLineClampSlotProps;
export type RichLineClampSlots = VueClamp.RichLineClampSlots;
export type WrapClampExposed = VueClamp.WrapClampExposed;
export type WrapClampItemKey<T = unknown> = VueClamp.WrapClampItemKey<T>;
export type WrapClampItemSlotProps<T = unknown> = VueClamp.WrapClampItemSlotProps<T>;
export type WrapClampProps<T = unknown> = VueClamp.WrapClampProps<T>;
export type WrapClampSlotProps<T = unknown> = VueClamp.WrapClampSlotProps<T>;
export type WrapClampSlots<T = unknown> = VueClamp.WrapClampSlots<T>;

export default LineClamp;
