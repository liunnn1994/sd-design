import { createSenderFoundation } from '@sdata/web-core/sender/foundation';
import { createSenderSpeechActivity } from '@sdata/web-core/sender/speech-activity';
import {
  mergeSenderSlotConfig,
  indexSenderSlotConfig,
  toSenderJsonValue,
} from '@sdata/web-core/sender/values';
import { useImperativeHandle, useLayoutEffect, useReducer, useRef, useState } from 'react';

import type { RichTextEditorRef } from '../rich-text-editor/index.js';
import type { TextareaInstance } from '../textarea/index.js';
import type {
  SenderProps,
  SenderRef,
  SenderSlotConfig,
  SenderSkill,
  SenderValue,
} from './types.js';

import { useAfterRender } from '../_shared/use-after-render.js';
import { useReadonlyTip } from '../_shared/use-readonly-tip.js';
import { useThemeMode } from '../_shared/use-theme-mode.js';
import { Button } from '../button/index.js';
import { usePrefix } from '../config-provider/index.js';
import IconArrowUp from '../icon/icon-arrow-up.js';
import IconMute from '../icon/icon-mute.js';
import IconVoice from '../icon/icon-voice.js';
import { useI18n } from '../locale/index.js';
import { RichTextEditor } from '../rich-text-editor/index.js';
import { Textarea } from '../textarea/index.js';
import { Tooltip } from '../tooltip/index.js';
import { VoiceGlow } from '../voice-glow/index.js';
import { SenderContext } from './context.js';
import { SenderRecordingIcon, SenderStopLoadingIcon } from './icons.js';
import { SenderSkillTag } from './skill.js';
import { useSenderRecorder } from './use-recorder.js';

export function SenderView(props: SenderProps) {
  const {
    value: _value,
    modelValue: _model,
    defaultValue: _default,
    loading,
    readonly,
    submitType: _submitType,
    disabled,
    slotConfig: _config,
    allowSpeech,
    voiceGlow = true,
    autoSize = { maxRows: 8 },
    skill: _skill,
    placeholder,
    showActions = true,
    suffixPlacement = 'content',
    components,
    classNames = {},
    styles = {},
    slots,
    onKeydown: _keydown,
    onKeyDown: _keyDown,
    onKeyup: _keyup,
    onKeyUp: _keyUp,
    onValueChange: _update,
    onChange: _change,
    onSubmit: _submit,
    onCancel: _cancel,
    onPaste: _paste,
    onPasteFile: _file,
    onFocus: _focus,
    onBlur: _blur,
    onSpeechEnd: _end,
    onSpeechError: _error,
    ref,
    className,
    style,
    children: _children,
    ...attrs
  } = props;
  const prefix = usePrefix('sender'),
    { t } = useI18n();
  const root = useRef<HTMLDivElement>(null),
    textarea = useRef<TextareaInstance>(null),
    editor = useRef<RichTextEditorRef>(null);
  const [, refresh] = useReducer((value: number) => value + 1, 0);
  const afterRender = useAfterRender(),
    tip = useReadonlyTip(readonly, Boolean(disabled));
  const recorder = useSenderRecorder(props),
    theme = useThemeMode(root);
  const state = useRef({
    editorReady: false,
    runtimeConfig: [] as SenderSlotConfig[],
    activeSkill: props.skill,
    slotValue: { value: '', slotConfig: [], skill: props.skill } as SenderValue,
    innerValue: props.defaultValue ?? '',
    readonlyHover: false,
    voiceActive: false,
  });
  const current = useRef({ props, tip, recorder });
  current.current = { props, tip, recorder };
  function set<Key extends keyof typeof state.current>(
    key: Key,
    value: (typeof state.current)[Key],
  ) {
    if (state.current[key] !== value) {
      state.current[key] = value;
      refresh();
    }
  }
  const configCache = useRef({
    prop: undefined as readonly SenderSlotConfig[] | undefined,
    runtime: state.current.runtimeConfig,
    configs: [] as SenderSlotConfig[],
    index: new Map<string, SenderSlotConfig>(),
  });
  const configurations = () => {
    const prop = current.current.props.slotConfig,
      runtime = state.current.runtimeConfig,
      cache = configCache.current;
    if (cache.prop !== prop || cache.runtime !== runtime) {
      const configs = mergeSenderSlotConfig(prop, runtime);
      configCache.current = { prop, runtime, configs, index: indexSenderSlotConfig(configs) };
    }
    return configCache.current;
  };
  const [foundation] = useState(() =>
    createSenderFoundation<SenderSlotConfig, SenderSkill>(
      {
        get props() {
          const p = current.current.props;
          return {
            ...p,
            modelValue: Object.hasOwn(p, 'value') ? p.value : p.modelValue,
            submitType: p.submitType ?? 'enter',
            onKeydown: p.onKeydown ?? p.onKeyDown,
          };
        },
        prefixCls: prefix,
        get controlled() {
          return (
            Object.hasOwn(current.current.props, 'value') ||
            Object.hasOwn(current.current.props, 'modelValue')
          );
        },
        get mergedValue(): string {
          return foundation.mergedValue();
        },
        get slotMode(): boolean {
          return foundation.slotMode();
        },
        get configs() {
          return configurations().configs;
        },
        get configByKey() {
          return configurations().index;
        },
        get editor() {
          return editor.current ?? undefined;
        },
        get exposedTextarea() {
          return textarea.current;
        },
        get container() {
          return root.current;
        },
        get submitDisabled(): boolean {
          return foundation.valueEmpty();
        },
        get clearDisabled(): boolean {
          return foundation.valueEmpty();
        },
        get cancelDisabled(): boolean {
          return foundation.cancelDisabled();
        },
        get speechAvailable() {
          return current.current.recorder.available;
        },
        get speechRequesting() {
          return current.current.recorder.requesting;
        },
        get speechStopping() {
          return current.current.recorder.stopping;
        },
        get recording() {
          return current.current.recorder.recording;
        },
        get editorReady() {
          return state.current.editorReady;
        },
        set editorReady(value) {
          set('editorReady', value);
        },
        get runtimeConfig() {
          return state.current.runtimeConfig;
        },
        set runtimeConfig(value) {
          set('runtimeConfig', value);
        },
        get activeSkill() {
          return state.current.activeSkill;
        },
        set activeSkill(value) {
          set('activeSkill', value);
        },
        get slotValue() {
          return state.current.slotValue;
        },
        set slotValue(value) {
          set('slotValue', value);
        },
        get innerValue() {
          return state.current.innerValue;
        },
        set innerValue(value) {
          set('innerValue', value);
        },
        get readonlyHover() {
          return state.current.readonlyHover;
        },
        set readonlyHover(value) {
          set('readonlyHover', value);
        },
      },
      {
        update: (value) => current.current.props.onValueChange?.(value),
        change: (value, event) =>
          current.current.props.onChange?.(value.value, event, value.slotConfig, value.skill),
        submit: (value) =>
          current.current.props.onSubmit?.(value.value, value.slotConfig, value.skill),
        cancel: () => current.current.props.onCancel?.(),
        speech: () => current.current.recorder.trigger(),
        pasteFile: (files) => current.current.props.onPasteFile?.(files),
        paste: (event) => current.current.props.onPaste?.(event),
        afterRender: (task) => {
          void afterRender().then(task);
        },
        showReadonlyTip: () => current.current.tip.show(),
        hideReadonlyTip: () => current.current.tip.hide(),
      },
    ),
  );
  const mode = foundation.slotMode();
  const previousConfig = useRef(props.slotConfig),
    previousSkill = useRef(props.skill);
  useLayoutEffect(() => {
    if (previousConfig.current !== props.slotConfig) {
      previousConfig.current = props.slotConfig;
      foundation.syncSlotEditor();
    }
  }, [foundation, props.slotConfig]);
  useLayoutEffect(() => {
    if (previousSkill.current !== props.skill) {
      previousSkill.current = props.skill;
      foundation.syncSkill(props.skill);
    }
  }, [foundation, props.skill]);
  useLayoutEffect(() => foundation.syncSlotMode(mode), [foundation, mode]);
  const glowOptions = typeof voiceGlow === 'object' ? voiceGlow : {};
  const glowRef = useRef(glowOptions);
  glowRef.current = glowOptions;
  const [activity] = useState(() =>
    createSenderSpeechActivity({
      get recording() {
        return current.current.recorder.recording;
      },
      get level() {
        return current.current.recorder.level;
      },
      get options() {
        return glowRef.current;
      },
      get active() {
        return state.current.voiceActive;
      },
      set active(value) {
        set('voiceActive', value);
      },
    }),
  );
  const speaking = activity.speaking();
  useLayoutEffect(
    () => activity.update(speaking, recorder.recording),
    [activity, speaking, recorder.recording],
  );
  useLayoutEffect(() => () => activity.dispose(), [activity]);
  useImperativeHandle(
    ref,
    (): SenderRef => ({
      Recorder: recorder.Recorder,
      get recorder() {
        return current.current.recorder.recorder ?? null;
      },
      get recording() {
        return current.current.recorder.recording;
      },
      get inputElement() {
        return foundation.slotMode()
          ? (editor.current?.rootElement ?? null)
          : foundation.getNativeTextarea();
      },
      get nativeElement() {
        return root.current;
      },
      focus: foundation.focus,
      blur: foundation.blur,
      insert: foundation.insert,
      clear: foundation.clear,
      getValue: foundation.getValue,
    }),
    [foundation, recorder.Recorder],
  );
  const actions = foundation.actionContext(),
    slotArgs = { actions },
    Input = components?.input ?? Textarea;
  const suffix = (
    <div
      className={[`${prefix}-actions-list`, classNames.suffix].filter(Boolean).join(' ')}
      style={styles.suffix}
    >
      {slots?.suffix ? (
        slots.suffix(slotArgs)
      ) : (
        <div className={`${prefix}-actions-list-presets`}>
          {Boolean(allowSpeech) && (
            <Button
              type="text"
              loading={recorder.requesting || recorder.stopping}
              disabled={actions.speechDisabled}
              title={recorder.statusText}
              aria-label={recorder.statusText}
              className={[
                `${prefix}-actions-btn`,
                actions.speechDisabled && `${prefix}-actions-btn-disabled`,
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={foundation.triggerSpeech}
              icon={
                recorder.recording ? (
                  <SenderRecordingIcon className={`${prefix}-actions-btn-recording-icon`} />
                ) : actions.speechDisabled ? (
                  <IconMute />
                ) : (
                  <IconVoice />
                )
              }
            />
          )}
          {loading ? (
            <Button
              type="text"
              shape="circle"
              disabled={actions.cancelDisabled}
              className={`${prefix}-actions-btn ${prefix}-actions-btn-loading-button`}
              aria-label={t('sender.stopGenerating')}
              onClick={foundation.triggerCancel}
              icon={<SenderStopLoadingIcon className={`${prefix}-actions-btn-loading-icon`} />}
            />
          ) : (
            <Button
              type="primary"
              shape="circle"
              disabled={actions.submitDisabled}
              className={[
                `${prefix}-actions-btn`,
                actions.submitDisabled && `${prefix}-actions-btn-disabled`,
              ]
                .filter(Boolean)
                .join(' ')}
              aria-label={t('sender.send')}
              onClick={foundation.triggerSend}
              icon={<IconArrowUp />}
            />
          )}
        </div>
      )}
    </div>
  );
  const tipDisabled = !readonly || disabled;
  return (
    <SenderContext value={{ prefix, classNames, styles }}>
      <Tooltip
        popupVisible={!tipDisabled && (tip.visible || state.current.readonlyHover)}
        content={tip.text}
        disabled={Boolean(tipDisabled)}
        position="top"
        onPopupVisibleChange={(value) => set('readonlyHover', value && !tipDisabled)}
      >
        <div
          {...attrs}
          ref={root}
          className={[
            prefix,
            `${prefix}-main`,
            classNames.root,
            disabled && `${prefix}-disabled`,
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          style={{ ...styles.root, ...style }}
          onClick={(event) => {
            attrs.onClick?.(event);
            tip.show();
          }}
          onKeyDownCapture={(event) => {
            attrs.onKeyDownCapture?.(event);
            foundation.handleReadonlyKeydown(event.nativeEvent);
          }}
        >
          {slots?.header?.(slotArgs)}
          <div
            className={[`${prefix}-content`, classNames.content].filter(Boolean).join(' ')}
            style={styles.content}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                event.preventDefault();
                foundation.focus();
              }
            }}
          >
            {slots?.prefix && (
              <div
                className={[`${prefix}-prefix`, classNames.prefix].filter(Boolean).join(' ')}
                style={styles.prefix}
              >
                {slots.prefix(slotArgs)}
              </div>
            )}
            {mode ? (
              <RichTextEditor
                ref={editor}
                placeholder={placeholder}
                disabled={disabled}
                readonly={Boolean(readonly)}
                autoSize={autoSize}
                classNames={{
                  root: [`${prefix}-input`, `${prefix}-input-slot`, classNames.input]
                    .filter(Boolean)
                    .join(' '),
                  content: `${prefix}-input-slot-content`,
                  placeholder: `${prefix}-input-slot-placeholder`,
                  component: `${prefix}-slot`,
                }}
                styles={styles.input === undefined ? {} : { root: styles.input }}
                ariaLabel={t('sender.messageInput')}
                onReady={foundation.handleSlotEditorReady}
                onChange={foundation.handleSlotEditorChange}
                onKeyDownCapture={(event) => {
                  foundation.handleSlotKeydown(event.nativeEvent);
                  if (event.nativeEvent.cancelBubble) event.stopPropagation();
                  if (event.nativeEvent.defaultPrevented) event.preventDefault();
                }}
                onKeyUpCapture={(event) => (props.onKeyup ?? props.onKeyUp)?.(event.nativeEvent)}
                onPasteCapture={(event) => {
                  foundation.handleSlotPaste(event.nativeEvent);
                  if (event.nativeEvent.cancelBubble) event.stopPropagation();
                }}
                onFocus={props.onFocus}
                onBlur={props.onBlur}
                slots={{
                  'node-senderSkill': (context) =>
                    state.current.activeSkill && (
                      <SenderSkillTag
                        skill={state.current.activeSkill}
                        disabled={disabled}
                        readonly={Boolean(readonly)}
                        slots={slots}
                        remove={(event) => foundation.removeSkill(event, context.remove)}
                      />
                    ),
                  'node-senderCustom': (context) => {
                    const item = foundation.getCustomConfig(context.node.key),
                      render = slots?.[`slot-${context.node.key}`];
                    const onChange = (value: unknown) => context.update(toSenderJsonValue(value));
                    if (render)
                      return render({
                        value: context.node.value,
                        item,
                        disabled: context.disabled,
                        readonly: context.readonly,
                        onChange,
                      });
                    return item?.customRender?.(
                      context.node.value,
                      onChange,
                      {
                        disabled: context.disabled,
                        readonly: context.readonly,
                        remove: () => {
                          if (!context.disabled && !context.readonly) context.remove();
                        },
                      },
                      item,
                    );
                  },
                }}
              />
            ) : (
              <Input
                ref={textarea}
                value={foundation.mergedValue()}
                defaultValue={props.defaultValue ?? ''}
                placeholder={placeholder}
                disabled={disabled}
                readonly={readonly}
                autoSize={autoSize}
                className={[`${prefix}-input`, classNames.input].filter(Boolean).join(' ')}
                style={styles.input}
                onValueChange={foundation.handleValueUpdate}
                onInput={foundation.handleInput}
                onKeyDown={foundation.handleKeydown}
                onKeyUp={(event: React.KeyboardEvent) =>
                  (props.onKeyup ?? props.onKeyUp)?.(event.nativeEvent)
                }
                onPaste={(event: React.ClipboardEvent) => foundation.handlePaste(event.nativeEvent)}
                onFocus={props.onFocus}
                onBlur={props.onBlur}
              />
            )}
            {showActions && suffixPlacement === 'content' && suffix}
          </div>
          {(slots?.footer || (showActions && suffixPlacement === 'footer')) && (
            <div
              className={[`${prefix}-footer`, classNames.footer].filter(Boolean).join(' ')}
              style={styles.footer}
            >
              {slots?.footer && (
                <div className={`${prefix}-footer-content`}>{slots.footer(slotArgs)}</div>
              )}
              {showActions && suffixPlacement === 'footer' && (
                <div className={`${prefix}-footer-suffix`}>{suffix}</div>
              )}
            </div>
          )}
          {Boolean(allowSpeech) && voiceGlow && (
            <VoiceGlow
              {...glowOptions}
              className={`${prefix}-voice-glow`}
              level={glowOptions.level ?? recorder.level}
              theme={glowOptions.theme ?? theme}
              idle={glowOptions.idle ?? 0}
              active={activity.glowActive()}
              aria-hidden="true"
            />
          )}
        </div>
      </Tooltip>
    </SenderContext>
  );
}
