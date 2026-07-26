<template>
  <Tooltip
    :popup-visible="readonlyTipVisible"
    :content="readonlyTipText"
    :disabled="readonlyTipDisabled"
    position="top"
    @popup-visible-change="handleReadonlyTipVisibleChange"
  >
    <div
      ref="containerRef"
      v-bind="$attrs"
      :class="rootClass"
      :style="styles?.root"
      @click="showReadonlyTip"
      @keydown.capture="handleReadonlyKeydown"
    >
      <slot name="header" :actions="actionContext" />

      <div
        :class="[`${prefixCls}-content`, classNames?.content]"
        :style="styles?.content"
        @mousedown="handleContentMousedown"
      >
        <div
          v-if="$slots.prefix"
          :class="[`${prefixCls}-prefix`, classNames?.prefix]"
          :style="styles?.prefix"
        >
          <slot name="prefix" :actions="actionContext" />
        </div>

        <SenderSlotInput
          v-if="isSlotMode"
          ref="slotInputRef"
          :slot-config="slotConfig"
          :skill="skill"
          :placeholder="placeholder"
          :disabled="disabled"
          :readonly="readonly"
          :submit-type="submitType"
          :auto-size="autoSize"
          :input-style="styles?.input"
          :on-keydown="onKeydown"
          :on-keyup="onKeyup"
          @change="handleSlotChange"
          @submit="triggerSend"
          @paste="emit('paste', $event)"
          @paste-file="emit('pasteFile', $event)"
          @focus="emit('focus', $event)"
          @blur="emit('blur', $event)"
        >
          <template v-for="(_, slotName) in $slots" #[slotName]="slotProps">
            <slot
              v-if="String(slotName).startsWith('slot-') || String(slotName).startsWith('skill-')"
              :name="slotName"
              v-bind="slotProps ?? {}"
            />
          </template>
        </SenderSlotInput>

        <component
          :is="inputComponent"
          v-else
          ref="textareaRef"
          :model-value="mergedValue"
          :default-value="defaultValue"
          :placeholder="placeholder"
          :disabled="disabled"
          :readonly="readonly"
          :auto-size="autoSize"
          :class="[`${prefixCls}-input`, classNames?.input]"
          :style="styles?.input"
          @update:model-value="handleValueUpdate"
          @input="handleInput"
          @keydown="handleKeydown"
          @keyup="onKeyup"
          @paste="handlePaste"
          @focus="emit('focus', $event)"
          @blur="emit('blur', $event)"
        />

        <div
          v-if="showActions"
          :class="[`${prefixCls}-actions-list`, classNames?.suffix]"
          :style="styles?.suffix"
        >
          <slot name="suffix" :actions="actionContext">
            <div :class="`${prefixCls}-actions-list-presets`">
              <Button
                v-if="allowSpeech"
                type="text"
                :loading="speechRequesting"
                :disabled="actionContext.speechDisabled"
                :title="speechStatusText"
                :class="[
                  `${prefixCls}-actions-btn`,
                  {
                    [`${prefixCls}-actions-btn-disabled`]: actionContext.speechDisabled,
                  },
                ]"
                :aria-label="speechStatusText"
                @click="triggerSpeech()"
              >
                <template #icon>
                  <RecordingIcon
                    v-if="recording"
                    :class="`${prefixCls}-actions-btn-recording-icon`"
                  />
                  <IconMute v-else-if="actionContext.speechDisabled" />
                  <IconVoice v-else />
                </template>
              </Button>

              <Button
                v-if="loading"
                type="text"
                shape="circle"
                :disabled="actionContext.cancelDisabled"
                :class="[`${prefixCls}-actions-btn`, `${prefixCls}-actions-btn-loading-button`]"
                aria-label="停止生成"
                @click="triggerCancel"
              >
                <template #icon>
                  <StopLoadingIcon :class="`${prefixCls}-actions-btn-loading-icon`" />
                </template>
              </Button>
              <Button
                v-else
                type="primary"
                shape="circle"
                :disabled="actionContext.submitDisabled"
                :class="[
                  `${prefixCls}-actions-btn`,
                  {
                    [`${prefixCls}-actions-btn-disabled`]: actionContext.submitDisabled,
                  },
                ]"
                aria-label="发送"
                @click="triggerSend"
              >
                <template #icon>
                  <IconArrowUp />
                </template>
              </Button>
            </div>
          </slot>
        </div>
      </div>

      <div
        v-if="$slots.footer"
        :class="[`${prefixCls}-footer`, classNames?.footer]"
        :style="styles?.footer"
      >
        <slot name="footer" :actions="actionContext" />
      </div>
    </div>
  </Tooltip>
</template>

<script setup lang="ts">
  import type { ComponentPublicInstance } from 'vue';
  import {
    computed,
    defineComponent,
    getCurrentInstance,
    h,
    provide,
    shallowRef,
    toRef,
    useAttrs,
  } from 'vue';

  import type {
    SenderActionContext,
    SenderEmits,
    SenderProps,
    SenderRef,
    SenderResolvedSlotConfig,
    SenderSkill,
    SenderSlotConfig,
    SenderValue,
  } from './types';

  import {
    isReadonlyModificationKey,
    useReadonlyTip,
    useReadonlyTipText,
  } from '../_hooks/use-readonly-tip';
  import { getPrefixCls } from '../_utils/global-config';
  import Button from '../button';
  import IconArrowUp from '../icon/icon-arrow-up';
  import IconMute from '../icon/icon-mute';
  import IconVoice from '../icon/icon-voice';
  import Textarea from '../textarea';
  import Tooltip from '../tooltip';
  import { senderInjectionKey } from './context';
  import SenderSlotInput from './sender-slot-input.vue';
  import { useSpeech } from './use-speech';

  defineOptions({ name: 'Sender', inheritAttrs: false });

  const props = withDefaults(defineProps<SenderProps>(), {
    defaultValue: '',
    submitType: 'enter',
    autoSize: () => ({ maxRows: 8 }),
    showActions: true,
    classNames: () => ({}),
    styles: () => ({}),
  });
  const emit = defineEmits<SenderEmits>();

  const attrs = useAttrs();
  const instance = getCurrentInstance();
  const prefixCls = getPrefixCls('sender');
  const readonlyTipHoverVisible = shallowRef(false);
  const {
    tipVisible: readonlyTipInteractionVisible,
    show: showReadonlyTip,
    hide: hideReadonlyTip,
  } = useReadonlyTip(
    toRef(props, 'readonly'),
    computed(() => Boolean(props.disabled)),
  );
  const readonlyTipText = useReadonlyTipText(toRef(props, 'readonly'));
  const readonlyTipDisabled = computed(() => !props.readonly || props.disabled);
  const readonlyTipVisible = computed(
    () =>
      !readonlyTipDisabled.value &&
      (readonlyTipHoverVisible.value || readonlyTipInteractionVisible.value),
  );
  const containerRef = shallowRef<HTMLDivElement>();
  const textareaRef = shallowRef<
    ComponentPublicInstance & { focus?: () => void; blur?: () => void }
  >();
  const slotInputRef = shallowRef<{
    nativeElement: HTMLDivElement | null;
    focus: SenderRef['focus'];
    blur: SenderRef['blur'];
    insert: SenderRef['insert'];
    clear: SenderRef['clear'];
    getValue: SenderRef['getValue'];
  }>();
  const innerValue = shallowRef(props.defaultValue);
  const pendingValue = shallowRef<string>();
  const slotValue = shallowRef<SenderValue>({
    value: '',
    slotConfig: [],
    skill: props.skill,
  });

  provide(senderInjectionKey, {
    prefixCls,
    classNames: toRef(props, 'classNames'),
    styles: toRef(props, 'styles'),
  });

  const isControlled = computed(() => Object.hasOwn(instance?.vnode.props ?? {}, 'modelValue'));
  const mergedValue = computed(() =>
    isControlled.value ? (props.modelValue ?? '') : innerValue.value,
  );
  const isSlotMode = computed(() => props.slotConfig !== undefined || Boolean(props.skill));
  const inputComponent = computed(() => props.components?.input ?? Textarea);

  const handleReadonlyTipVisibleChange = (visible: boolean) => {
    readonlyTipHoverVisible.value = visible && !readonlyTipDisabled.value;
  };

  const handleReadonlyKeydown = (event: KeyboardEvent) => {
    const target = event.target;
    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
      readonlyTipHoverVisible.value = false;
      hideReadonlyTip();
      return;
    }
    if (isReadonlyModificationKey(event)) {
      showReadonlyTip();
    }
  };

  const rootClass = computed(() => [
    prefixCls,
    `${prefixCls}-main`,
    attrs.class,
    props.classNames.root,
    {
      [`${prefixCls}-disabled`]: props.disabled,
    },
  ]);

  const getNormalValue = (): SenderValue => ({
    value: mergedValue.value,
    slotConfig: [],
    skill: undefined,
  });
  const getCurrentValue = () =>
    isSlotMode.value ? (slotInputRef.value?.getValue() ?? slotValue.value) : getNormalValue();

  const setNormalValue = (value: string, event?: Event) => {
    if (!isControlled.value) innerValue.value = value;
    emit('update:modelValue', value);
    emit('change', value, event, [], undefined);
  };

  // Textarea 在一次输入中会先后触发 `update:modelValue` 与 `input` 两个事件。
  // 用 microtask 合并，保证每次输入只 emit 一次 change（见 index.cy.ts "emits one change in controlled mode"）。
  const handleValueUpdate = (value: string) => {
    pendingValue.value = value;
    queueMicrotask(() => {
      if (pendingValue.value !== value) return;
      pendingValue.value = undefined;
      setNormalValue(value);
    });
  };

  // `input` 事件携带原生 Event，立即落值并取消待处理的 microtask，避免双发。
  const handleInput = (value: string, event: Event) => {
    pendingValue.value = undefined;
    setNormalValue(value, event);
  };

  const handleSlotChange = (value: SenderValue, event?: Event) => {
    slotValue.value = value;
    emit('change', value.value, event, value.slotConfig, value.skill);
  };

  const submitDisabled = computed(() => !getCurrentValue().value);
  const clearDisabled = computed(() => !getCurrentValue().value);
  const cancelDisabled = computed(() => !props.loading);

  const triggerSend = () => {
    if (props.loading || props.disabled || submitDisabled.value) return;
    const value = getCurrentValue();
    emit('submit', value.value, value.slotConfig, value.skill);
  };

  const triggerClear = () => {
    if (props.disabled || clearDisabled.value) return;
    if (isSlotMode.value) slotInputRef.value?.clear();
    else setNormalValue('');
  };

  const triggerCancel = () => {
    if (cancelDisabled.value || props.disabled) return;
    emit('cancel');
  };

  const {
    available: speechAvailable,
    recording,
    requesting: speechRequesting,
    statusText: speechStatusText,
    trigger: triggerSpeech,
  } = useSpeech(toRef(props, 'allowSpeech'), (transcript) => {
    if (isSlotMode.value) {
      slotInputRef.value?.insert([{ type: 'text', value: transcript }], 'end');
    } else {
      setNormalValue(`${mergedValue.value} ${transcript}`);
    }
  });

  const actionContext = computed<SenderActionContext>(() => ({
    send: triggerSend,
    clear: triggerClear,
    cancel: triggerCancel,
    speech: () => triggerSpeech(false),
    submitDisabled: Boolean(props.disabled || submitDisabled.value),
    clearDisabled: Boolean(props.disabled || clearDisabled.value),
    cancelDisabled: Boolean(props.disabled || cancelDisabled.value),
    speechDisabled: Boolean(props.disabled || !speechAvailable.value || speechRequesting.value),
    recording: recording.value,
    loading: Boolean(props.loading),
  }));

  const handleKeydown = (event: KeyboardEvent) => {
    const result = props.onKeydown?.(event);
    if (result === false || event.isComposing || event.key !== 'Enter') return;

    const modifierPressed = event.ctrlKey || event.altKey || event.metaKey;
    const shouldSubmit =
      (props.submitType === 'enter' && !event.shiftKey && !modifierPressed) ||
      (props.submitType === 'shiftEnter' && event.shiftKey && !modifierPressed);
    if (shouldSubmit) {
      event.preventDefault();
      triggerSend();
    }
  };

  const handlePaste = (event: ClipboardEvent) => {
    const files = event.clipboardData?.files;
    const text = event.clipboardData?.getData('text/plain');
    if (!text && files?.length) {
      event.preventDefault();
      emit('pasteFile', files);
    }
    emit('paste', event);
  };

  const getNativeTextarea = () => {
    const exposed = textareaRef.value;
    if (exposed instanceof HTMLTextAreaElement) return exposed;

    const element = exposed?.$el;
    if (element instanceof HTMLTextAreaElement) return element;
    if (element instanceof Element) {
      const textarea = element.querySelector('textarea');
      if (textarea) return textarea;
    }
    return containerRef.value?.querySelector('textarea') ?? null;
  };

  const focus = (options?: Parameters<SenderRef['focus']>[0]) => {
    if (isSlotMode.value) {
      slotInputRef.value?.focus(options);
      return;
    }
    const textarea = getNativeTextarea();
    if (textarea) textarea.focus({ preventScroll: options?.preventScroll });
    else textareaRef.value?.focus?.();
    if (!textarea) return;
    const cursor = options?.cursor ?? 'end';
    const position = cursor === 'start' ? 0 : textarea.value.length;
    if (cursor === 'all') textarea.select();
    else textarea.setSelectionRange(position, position);
  };

  const blur = () => {
    if (isSlotMode.value) slotInputRef.value?.blur();
    else {
      const textarea = getNativeTextarea();
      if (textarea) textarea.blur();
      else textareaRef.value?.blur?.();
    }
  };

  const insert: SenderRef['insert'] = (
    value,
    position = 'cursor',
    replaceCharacters,
    preventScroll,
  ) => {
    if (isSlotMode.value) {
      const config: SenderSlotConfig[] =
        typeof value === 'string' ? [{ type: 'text', value }] : value;
      slotInputRef.value?.insert(config, position, replaceCharacters, preventScroll);
      return;
    }
    const insertValue = typeof value === 'string' ? value : value.map(formatSlot).join('');
    const textarea = getNativeTextarea();
    const current = mergedValue.value;
    let start = position === 'start' ? 0 : current.length;
    let end = start;
    if (position === 'cursor' && textarea) {
      start = textarea.selectionStart;
      end = textarea.selectionEnd;
    }
    if (replaceCharacters && current.slice(0, start).endsWith(replaceCharacters)) {
      start -= replaceCharacters.length;
    }
    setNormalValue(`${current.slice(0, start)}${insertValue}${current.slice(end)}`);
    requestAnimationFrame(() => {
      focus({ preventScroll });
      const nextPosition = start + insertValue.length;
      getNativeTextarea()?.setSelectionRange(nextPosition, nextPosition);
    });
  };

  const clear = () => {
    if (isSlotMode.value) slotInputRef.value?.clear();
    else setNormalValue('');
  };

  const getValue = () => getCurrentValue();

  function formatSlot(slot: SenderSlotConfig) {
    if (slot.type === 'text') return slot.value ?? '';
    if (slot.type === 'tag') return String(slot.props?.value ?? slot.props?.label ?? '');
    const value = slot.props?.defaultValue ?? '';
    return slot.formatResult?.(value) ?? String(value);
  }

  const handleContentMousedown = (event: MouseEvent) => {
    if (event.target === event.currentTarget) {
      event.preventDefault();
      focus();
    }
  };

  const StopLoadingIcon = defineComponent({
    name: 'SenderStopLoadingIcon',
    inheritAttrs: false,
    setup(_, { attrs: iconAttrs }) {
      return () =>
        h(
          'svg',
          {
            ...iconAttrs,
            color: 'currentColor',
            viewBox: '0 0 1000 1000',
            xmlns: 'http://www.w3.org/2000/svg',
          },
          [
            h('title', null, '停止生成'),
            h('rect', {
              fill: 'currentColor',
              height: 250,
              rx: 24,
              ry: 24,
              width: 250,
              x: 375,
              y: 375,
            }),
            h('circle', {
              cx: 500,
              cy: 500,
              fill: 'none',
              r: 450,
              stroke: 'currentColor',
              strokeWidth: 100,
              opacity: 0.45,
            }),
            h('circle', {
              class: `${prefixCls}-loading-spinner`,
              cx: 500,
              cy: 500,
              fill: 'none',
              r: 450,
              stroke: 'currentColor',
              strokeWidth: 100,
              strokeDasharray: '600 9999999',
            }),
          ],
        );
    },
  });

  const RecordingIcon = defineComponent({
    name: 'SenderRecordingIcon',
    inheritAttrs: false,
    setup(_, { attrs: iconAttrs }) {
      const bars = Array.from({ length: 4 }, (__, index) =>
        h('rect', {
          class: `${prefixCls}-recording-bar`,
          style: { animationDelay: `${index * 0.2}s` },
          fill: 'currentColor',
          rx: 70,
          ry: 70,
          height: 250,
          width: 140,
          x: index * 286.6667,
          y: 375,
        }),
      );
      return () =>
        h(
          'svg',
          {
            ...iconAttrs,
            color: 'currentColor',
            viewBox: '0 0 1000 1000',
            xmlns: 'http://www.w3.org/2000/svg',
          },
          [h('title', null, '正在语音输入'), ...bars],
        );
    },
  });

  defineExpose({
    get inputElement() {
      return isSlotMode.value ? (slotInputRef.value?.nativeElement ?? null) : getNativeTextarea();
    },
    get nativeElement() {
      return containerRef.value ?? null;
    },
    focus,
    blur,
    insert,
    clear,
    getValue,
  });
</script>
