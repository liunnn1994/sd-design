import type { App } from 'vue';

import type { SDOptions } from '../_utils/types';

import { getComponentPrefix, setGlobalConfig } from '../_utils/global-config';
import _SenderHeader from './sender-header.vue';
import _SenderSwitch from './sender-switch.vue';
import _Sender from './sender.vue';

const Sender: typeof _Sender & {
  install: (app: App, options?: SDOptions) => void;
  Header: typeof _SenderHeader;
  Switch: typeof _SenderSwitch;
} = Object.assign(_Sender, {
  install: (app: App, options?: SDOptions) => {
    setGlobalConfig(app, options);
    const componentPrefix = getComponentPrefix(options);

    app.component(componentPrefix + _Sender.name, _Sender);
    app.component(componentPrefix + _SenderHeader.name, _SenderHeader);
    app.component(componentPrefix + _SenderSwitch.name, _SenderSwitch);
  },
  Header: _SenderHeader,
  Switch: _SenderSwitch,
});

export const SenderHeader = _SenderHeader;
export const SenderSwitch = _SenderSwitch;

export type SenderInstance = InstanceType<typeof _Sender>;
export type SenderHeaderInstance = InstanceType<typeof _SenderHeader>;
export type SenderSwitchInstance = InstanceType<typeof _SenderSwitch>;
export type {
  SenderActionContext,
  SenderAllowSpeech,
  SenderComponents,
  SenderContentSlotConfig,
  SenderControlledSpeechConfig,
  SenderCustomSlotConfig,
  SenderCustomSlotRender,
  SenderCustomSlotState,
  SenderEmits,
  SenderFocusOptions,
  SenderHeaderSemanticType,
  SenderHeaderProps,
  SenderInsertPosition,
  SenderInputSlotConfig,
  SenderProps,
  SenderRef,
  SenderResolvedSlotConfig,
  SenderSelectSlotConfig,
  SenderSemanticType,
  SenderSkill,
  SenderSkillClosableConfig,
  SenderSpeechConfig,
  SenderSpeechDataEvent,
  SenderSpeechEndEvent,
  SenderSpeechEndReason,
  SenderSpeechErrorEvent,
  SenderSpeechErrorPhase,
  SenderSpeechStartEvent,
  SenderSpeechTransportCloseEvent,
  SenderSpeechTransportMessageEvent,
  SenderSpeechTransportOpenEvent,
  SenderSlotConfig,
  SenderSlotConfigBase,
  SenderSubmitType,
  SenderSuffixPlacement,
  SenderSwitchProps,
  SenderTagSlotConfig,
  SenderTextSlotConfig,
  SenderValue,
} from './types';

export default Sender;
