<template>
  <div
    ref="editorRef"
    :class="[`${prefixCls}-input`, `${prefixCls}-input-slot`]"
    :style="inputStyle"
    role="textbox"
    aria-multiline="true"
    :aria-disabled="disabled || undefined"
    :aria-readonly="!!readonly || undefined"
    :data-placeholder="placeholder"
    tabindex="0"
    @click="handleEditorClick"
    @keydown="handleKeydown"
    @keyup="handleKeyup"
    @paste="handlePaste"
    @focusin="handleFocus"
    @focusout="handleBlur"
    @compositionstart="isComposing = true"
    @compositionend="handleCompositionEnd"
  >
    <span
      v-if="activeSkill"
      :class="[`${prefixCls}-skill`, { [`${prefixCls}-skill-empty`]: !currentValue.value }]"
      :data-placeholder="placeholder"
      data-sender-skill
      contenteditable="false"
    >
      <span :class="`${prefixCls}-skill-wrapper`">
        <Tooltip v-if="activeSkill.tooltip" v-bind="skillTooltipProps">
          <span :class="`${prefixCls}-skill-tag`" role="button" tabindex="0">
            <span :class="`${prefixCls}-skill-tag-text`">
              <slot name="skill-title" :skill="activeSkill">
                <RenderContent :content="activeSkill.title ?? activeSkill.value" />
              </slot>
            </span>
            <span
              v-if="activeSkill.closable"
              :class="[
                `${prefixCls}-skill-tag-close`,
                {
                  [`${prefixCls}-skill-tag-close-disabled`]:
                    typeof activeSkill.closable === 'object' && activeSkill.closable.disabled,
                },
              ]"
              role="button"
              tabindex="0"
              aria-label="移除技能"
              @click.stop="removeSkill"
              @keydown.enter.stop.prevent="removeSkill"
              @keydown.space.stop.prevent="removeSkill"
            >
              <slot name="skill-close-icon" :skill="activeSkill">
                <RenderContent
                  v-if="typeof activeSkill.closable === 'object' && activeSkill.closable.closeIcon"
                  :content="activeSkill.closable.closeIcon"
                />
                <IconClose v-else />
              </slot>
            </span>
          </span>
        </Tooltip>
        <span v-else :class="`${prefixCls}-skill-tag`" role="button" tabindex="0">
          <span :class="`${prefixCls}-skill-tag-text`">
            <slot name="skill-title" :skill="activeSkill">
              <RenderContent :content="activeSkill.title ?? activeSkill.value" />
            </slot>
          </span>
          <span
            v-if="activeSkill.closable"
            :class="[
              `${prefixCls}-skill-tag-close`,
              {
                [`${prefixCls}-skill-tag-close-disabled`]:
                  typeof activeSkill.closable === 'object' && activeSkill.closable.disabled,
              },
            ]"
            role="button"
            tabindex="0"
            aria-label="移除技能"
            @click.stop="removeSkill"
            @keydown.enter.stop.prevent="removeSkill"
            @keydown.space.stop.prevent="removeSkill"
          >
            <slot name="skill-close-icon" :skill="activeSkill">
              <RenderContent
                v-if="typeof activeSkill.closable === 'object' && activeSkill.closable.closeIcon"
                :content="activeSkill.closable.closeIcon"
              />
              <IconClose v-else />
            </slot>
          </span>
        </span>
        <span :class="`${prefixCls}-skill-holder`" />
      </span>
    </span>

    <template v-for="node in nodes" :key="node.__id">
      <span
        v-if="node.type === 'text'"
        :ref="(element) => setNodeElement(node.__id, element)"
        :class="`${prefixCls}-text-node`"
        :data-node-id="node.__id"
        :data-placeholder="
          node.placeholder ?? (nodes.length === 1 && !activeSkill ? placeholder : undefined)
        "
        :contenteditable="!disabled && !readonly && node.editable !== false"
        spellcheck="false"
        @input="handleTextInput(node, $event)"
        >{{ node.value }}</span
      >

      <span
        v-else-if="node.type === 'content'"
        :ref="(element) => setNodeElement(node.__id, element)"
        :class="[`${prefixCls}-slot`, `${prefixCls}-slot-content`]"
        :data-node-id="node.__id"
        :data-slot-key="node.key"
        :data-placeholder="node.props?.placeholder"
        :contenteditable="!disabled && !readonly"
        spellcheck="false"
        @input="handleContentInput(node, $event)"
        >{{ node.value }}</span
      >

      <span
        v-else
        :ref="(element) => setNodeElement(node.__id, element)"
        :class="`${prefixCls}-slot`"
        :data-node-id="node.__id"
        :data-slot-key="node.key"
        contenteditable="false"
      >
        <Input
          v-if="node.type === 'input'"
          :model-value="String(node.value ?? '')"
          :placeholder="node.props?.placeholder"
          :disabled="disabled"
          :readonly="!!readonly"
          size="small"
          :class="`${prefixCls}-slot-input`"
          @update:model-value="updateNodeValue(node, $event)"
        />

        <Select
          v-else-if="node.type === 'select'"
          :model-value="node.value as string"
          :options="node.props?.options ?? []"
          :placeholder="node.props?.placeholder"
          :disabled="disabled || !!readonly"
          :allow-clear="false"
          :allow-search="false"
          :bordered="false"
          size="mini"
          :class="`${prefixCls}-slot-select`"
          @update:model-value="updateNodeValue(node, $event)"
        />

        <span v-else-if="node.type === 'tag'" :class="`${prefixCls}-slot-tag`">
          <RenderContent :content="node.props?.label ?? node.props?.value ?? ''" />
        </span>

        <slot
          v-else-if="$slots[getCustomSlotName(node)]"
          :name="getCustomSlotName(node)"
          :value="node.value"
          :item="node"
          :disabled="disabled"
          :readonly="!!readonly"
          :on-change="(value: unknown) => updateNodeValue(node, value)"
        />
        <CustomSlotRenderer
          v-else-if="node.type === 'custom' && node.customRender"
          :renderer="node.customRender"
          :value="node.value"
          :item="node"
          :disabled="disabled"
          :readonly="!!readonly"
          @change="updateNodeValue(node, $event)"
        />
      </span>
    </template>
  </div>
</template>

<script setup lang="ts">
  import type { ComponentPublicInstance, CSSProperties, PropType, VNodeChild } from 'vue';
  import { computed, defineComponent, nextTick, onMounted, shallowRef, watch } from 'vue';

  import type {
    SenderCustomSlotConfig,
    SenderCustomSlotRender,
    SenderFocusOptions,
    SenderInsertPosition,
    SenderResolvedSlotConfig,
    SenderSkill,
    SenderSlotConfig,
    SenderSubmitType,
    SenderValue,
  } from './types';

  import { getPrefixCls } from '../_utils/global-config';
  import IconClose from '../icon/icon-close';
  import Input from '../input';
  import Select from '../select';
  import Tooltip from '../tooltip';

  defineOptions({ name: 'SenderSlotInput' });

  interface RuntimeSlotBase {
    __id: string;
    value?: unknown;
    runtime?: boolean;
  }

  type RuntimeSlot = SenderSlotConfig extends infer Config
    ? Config extends SenderSlotConfig
      ? Omit<Config, 'value'> & RuntimeSlotBase
      : never
    : never;

  const props = withDefaults(
    defineProps<{
      slotConfig?: readonly SenderSlotConfig[];
      skill?: SenderSkill;
      placeholder?: string;
      disabled?: boolean;
      readonly?: boolean | string;
      submitType?: SenderSubmitType;
      autoSize?: boolean | { minRows?: number; maxRows?: number };
      inputStyle?: CSSProperties;
      onKeydown?: (event: KeyboardEvent) => void | false;
      onKeyup?: (event: KeyboardEvent) => void;
    }>(),
    {
      slotConfig: () => [],
      submitType: 'enter',
      autoSize: () => ({ maxRows: 8 }),
    },
  );

  const emit = defineEmits<{
    change: [value: SenderValue, event?: Event];
    submit: [];
    paste: [event: ClipboardEvent];
    pasteFile: [files: FileList];
    focus: [event: FocusEvent];
    blur: [event: FocusEvent];
  }>();

  const RenderContent = defineComponent({
    name: 'SenderRenderContent',
    props: {
      content: {
        type: null as unknown as PropType<VNodeChild>,
      },
    },
    setup(renderProps) {
      return () => renderProps.content ?? null;
    },
  });

  const CustomSlotRenderer = defineComponent({
    name: 'SenderCustomSlotRenderer',
    props: {
      renderer: {
        type: Function as PropType<SenderCustomSlotRender>,
        required: true,
      },
      value: {
        type: null,
      },
      item: {
        type: Object as PropType<SenderCustomSlotConfig>,
        required: true,
      },
      disabled: Boolean,
      readonly: Boolean,
    },
    emits: {
      change: (_value: unknown) => true,
    },
    setup(renderProps, { emit: emitCustomChange }) {
      return () =>
        renderProps.renderer(
          renderProps.value,
          (value) => emitCustomChange('change', value),
          { disabled: renderProps.disabled, readonly: renderProps.readonly },
          renderProps.item,
        );
    },
  });

  const prefixCls = getPrefixCls('sender');
  const editorRef = shallowRef<HTMLDivElement>();
  const editorLineHeight = shallowRef(22);
  const nodeElements = new Map<string, HTMLElement>();
  const nodes = shallowRef<RuntimeSlot[]>([]);
  const activeSkill = shallowRef<SenderSkill>();
  const isComposing = shallowRef(false);
  const keyLock = shallowRef(false);
  let nodeSequence = 0;

  const measureEditorLineHeight = () => {
    if (!editorRef.value) return;
    const lineHeight = parseFloat(window.getComputedStyle(editorRef.value).lineHeight);
    if (Number.isFinite(lineHeight) && lineHeight > 0) {
      editorLineHeight.value = lineHeight;
    }
  };

  onMounted(measureEditorLineHeight);

  watch(
    () => props.inputStyle,
    () => {
      nextTick(measureEditorLineHeight);
    },
    { deep: true },
  );

  const buildNode = (config: SenderSlotConfig, runtime = false): RuntimeSlot => {
    const defaultValue =
      config.type === 'text'
        ? config.value
        : config.type === 'tag'
          ? (config.props?.value ?? config.props?.label)
          : config.props?.defaultValue;

    return {
      ...config,
      __id: config.key ? `slot-${config.key}` : `text-${++nodeSequence}`,
      value: defaultValue ?? '',
      runtime,
    } as RuntimeSlot;
  };

  const ensureEditableTail = (items: RuntimeSlot[]) => {
    if (items.length === 0 || items.at(-1)?.type !== 'text') {
      items.push(buildNode({ type: 'text', value: '' }));
    }
    return items;
  };

  const syncConfig = (config: readonly SenderSlotConfig[]) => {
    const previousValues = new Map(
      nodes.value.filter((node) => node.key).map((node) => [node.key, node.value]),
    );
    const runtimeNodes = nodes.value.filter((node) => node.runtime);
    const propKeys = new Set(config.flatMap((node) => (node.key ? [node.key] : [])));
    const nextNodes = config.map((node) => {
      const nextNode = buildNode(node);
      if (node.key && previousValues.has(node.key)) nextNode.value = previousValues.get(node.key);
      return nextNode;
    });

    runtimeNodes.forEach((node) => {
      if (!node.key || !propKeys.has(node.key)) nextNodes.push(node);
    });
    nodes.value = ensureEditableTail(nextNodes);
    nextTick(() => emitChange());
  };

  watch(
    () => props.slotConfig,
    (config) => syncConfig(config),
    { immediate: true },
  );

  watch(
    () => props.skill,
    (skill) => {
      activeSkill.value = skill;
      nextTick(() => emitChange());
    },
    { immediate: true },
  );

  const currentValue = computed(() => getValue());
  const skillTooltipProps = computed(() =>
    typeof activeSkill.value?.tooltip === 'string'
      ? { content: activeSkill.value.tooltip }
      : activeSkill.value?.tooltip,
  );

  const inputStyle = computed<CSSProperties>(() => {
    if (!props.autoSize) return props.inputStyle ?? {};
    if (props.autoSize === true) return { ...props.inputStyle, height: 'auto' };

    const lineHeight = editorLineHeight.value;
    return {
      ...props.inputStyle,
      minHeight: props.autoSize.minRows ? `${props.autoSize.minRows * lineHeight}px` : undefined,
      maxHeight: props.autoSize.maxRows ? `${props.autoSize.maxRows * lineHeight}px` : undefined,
      overflowY: 'auto',
    };
  });

  const setNodeElement = (id: string, element: Element | ComponentPublicInstance | null) => {
    if (element instanceof HTMLElement) nodeElements.set(id, element);
    else nodeElements.delete(id);
  };

  const getNodeValue = (node: RuntimeSlot) => {
    if (node.type === 'tag') return node.props?.value ?? node.props?.label ?? '';
    return node.value ?? '';
  };

  function getValue(): SenderValue {
    const result: string[] = [];
    const resolvedConfig: SenderResolvedSlotConfig[] = [];

    nodes.value.forEach((node) => {
      const rawValue = getNodeValue(node);
      const formattedValue = node.formatResult?.(rawValue) ?? String(rawValue ?? '');
      result.push(formattedValue);
      const { __id: _, runtime: __, ...config } = node;
      if (node.type === 'text' && rawValue) {
        resolvedConfig.push({
          ...config,
          type: 'text',
          value: String(rawValue),
        } as SenderResolvedSlotConfig);
      } else if (node.type !== 'text') {
        resolvedConfig.push({ ...config, value: rawValue } as SenderResolvedSlotConfig);
      }
    });

    return {
      value: result.join(''),
      slotConfig: resolvedConfig,
      skill: activeSkill.value,
    };
  }

  const emitChange = (event?: Event) => {
    emit('change', getValue(), event);
  };

  const updateNodeValue = (node: RuntimeSlot, value: unknown, event?: Event) => {
    nodes.value = nodes.value.map((item) => (item.__id === node.__id ? { ...item, value } : item));
    emitChange(event);
  };

  // contentEditable 的文本由 Vue 以 textContent patch，每次输入会重建文本节点并丢失光标，
  // 导致后续字符插到开头（视觉上字符逆序）。更新前保存光标偏移，nextTick 后恢复。
  const getSelectionOffsets = (element: HTMLElement) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    if (!element.contains(range.startContainer) || !element.contains(range.endContainer)) return;

    const getOffset = (container: Node, offset: number) => {
      const offsetRange = document.createRange();
      offsetRange.selectNodeContents(element);
      offsetRange.setEnd(container, offset);
      return offsetRange.toString().length;
    };

    return {
      start: getOffset(range.startContainer, range.startOffset),
      end: getOffset(range.endContainer, range.endOffset),
    };
  };

  const setCaretOffset = (element: HTMLElement, offset: number) => {
    if (offset < 0) return;
    const textNode = element.firstChild;
    if (!textNode || textNode.nodeType !== Node.TEXT_NODE) return;
    const max = textNode.textContent?.length ?? 0;
    const range = document.createRange();
    range.setStart(textNode, Math.min(Math.max(offset, 0), max));
    range.collapse(true);
    const selection = window.getSelection();
    if (!selection) return;
    selection.removeAllRanges();
    selection.addRange(range);
  };

  const syncEditableInput = (node: RuntimeSlot, event: Event) => {
    const element = event.currentTarget as HTMLElement;
    const selectionOffsets = getSelectionOffsets(element);
    const value = element.innerText.replace(/\r\n?/g, '\n');
    element.querySelectorAll('br').forEach((br) => br.remove());
    updateNodeValue(node, value, event);
    if (selectionOffsets) {
      nextTick(() => setCaretOffset(element, selectionOffsets.end));
    }
  };

  const handleTextInput = (node: RuntimeSlot, event: Event) => {
    syncEditableInput(node, event);
  };

  const handleContentInput = (node: RuntimeSlot, event: Event) => {
    syncEditableInput(node, event);
  };

  const getCustomSlotName = (node: RuntimeSlot) => `slot-${node.key ?? node.__id}`;

  const removeSkill = (event?: Event) => {
    if (!activeSkill.value?.closable) return;
    const config =
      typeof activeSkill.value.closable === 'object' ? activeSkill.value.closable : undefined;
    if (config?.disabled) return;
    activeSkill.value = undefined;
    config?.onClose?.(event as MouseEvent);
    emitChange(event);
  };

  const getSelectionContext = () => {
    const selection = window.getSelection();
    if (!selection?.rangeCount) return {};
    const range = selection.getRangeAt(0);
    const element =
      range.startContainer.nodeType === Node.ELEMENT_NODE
        ? (range.startContainer as HTMLElement)
        : range.startContainer.parentElement;
    const nodeElement = element?.closest<HTMLElement>('[data-node-id]');
    return { selection, range, nodeElement };
  };

  const focusElement = (
    element: HTMLElement,
    cursor: 'start' | 'end' | 'all',
    preventScroll = false,
  ) => {
    element.focus({ preventScroll });
    const selection = window.getSelection();
    if (!selection) return;
    const range = document.createRange();
    range.selectNodeContents(element);
    if (cursor === 'start') range.collapse(true);
    if (cursor === 'end') range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
  };

  const focus = (options: SenderFocusOptions = {}) => {
    const { cursor = 'end', preventScroll = false, key } = options;
    if (cursor === 'slot') {
      const targetNode = key
        ? nodes.value.find((node) => node.key === key)
        : nodes.value.find((node) => node.type === 'input' || node.type === 'content');
      const target = targetNode ? nodeElements.get(targetNode.__id) : undefined;
      const input = target?.querySelector<HTMLElement>('input, [contenteditable="true"]') ?? target;
      if (input) {
        input.focus({ preventScroll });
        return;
      }
    }

    const editableNodes = nodes.value
      .filter((node) => node.type === 'text' || node.type === 'content')
      .map((node) => nodeElements.get(node.__id))
      .filter((element): element is HTMLElement => Boolean(element));
    const target = cursor === 'start' ? editableNodes[0] : editableNodes.at(-1);
    const textCursor = cursor === 'all' ? 'all' : cursor === 'start' ? 'start' : 'end';
    if (target) focusElement(target, textCursor, preventScroll);
    else editorRef.value?.focus({ preventScroll });
  };

  const blur = () => {
    const activeElement = document.activeElement;
    if (activeElement instanceof HTMLElement && editorRef.value?.contains(activeElement)) {
      activeElement.blur();
    } else {
      editorRef.value?.blur();
    }
  };

  const removePreviousNode = (event: KeyboardEvent) => {
    const { range, nodeElement } = getSelectionContext();
    if (!range || !nodeElement || range.startOffset !== 0) return false;
    const currentIndex = nodes.value.findIndex((node) => node.__id === nodeElement.dataset.nodeId);
    if (currentIndex > 0 && nodes.value[currentIndex - 1]?.type !== 'text') {
      event.preventDefault();
      nodes.value = nodes.value.filter((_, index) => index !== currentIndex - 1);
      emitChange(event);
      return true;
    }
    if (currentIndex === 0 && activeSkill.value) {
      event.preventDefault();
      removeSkill(event);
      return true;
    }
    return false;
  };

  const shouldSubmit = (event: KeyboardEvent) => {
    if (event.key !== 'Enter') return false;
    const modifierPressed = event.ctrlKey || event.altKey || event.metaKey;
    return (
      (props.submitType === 'enter' && !event.shiftKey && !modifierPressed) ||
      (props.submitType === 'shiftEnter' && event.shiftKey && !modifierPressed)
    );
  };

  const handleKeydown = (event: KeyboardEvent) => {
    const result = props.onKeydown?.(event);
    if (result === false || keyLock.value || isComposing.value || event.isComposing) return;
    if (event.key === 'Backspace' && removePreviousNode(event)) return;
    if (shouldSubmit(event)) {
      event.preventDefault();
      keyLock.value = true;
      emit('submit');
      return;
    }
    // 非提交的 Enter 统一写入文本换行，避免浏览器插入 <br>/<div>。
    if (event.key === 'Enter' && (event.target as HTMLElement | null)?.isContentEditable) {
      event.preventDefault();
      const target = event.target as HTMLElement;
      const node = nodes.value.find((item) => item.__id === target.dataset.nodeId);
      if (node) {
        const current = String(node.value ?? '');
        const selectionOffsets = getSelectionOffsets(target);
        const start = Math.min(selectionOffsets?.start ?? current.length, current.length);
        const end = Math.min(selectionOffsets?.end ?? start, current.length);
        updateNodeValue(node, `${current.slice(0, start)}\n${current.slice(end)}`);
        nextTick(() => setCaretOffset(target, start + 1));
      }
    }
  };

  const handleKeyup = (event: KeyboardEvent) => {
    keyLock.value = false;
    props.onKeyup?.(event);
  };

  const handleCompositionEnd = () => {
    isComposing.value = false;
    keyLock.value = false;
  };

  const handlePaste = (event: ClipboardEvent) => {
    const files = event.clipboardData?.files;
    const text = event.clipboardData?.getData('text/plain');
    if (!text && files?.length) {
      event.preventDefault();
      emit('pasteFile', files);
    } else if (text) {
      event.preventDefault();
      const normalizedText = text.replace(/\r\n?/g, '\n');
      let inserted = false;
      try {
        inserted = document.execCommand('insertText', false, normalizedText);
      } catch {
        inserted = false;
      }
      if (!inserted) {
        insertTextAtSelection(normalizedText, 'cursor');
      }
    }
    emit('paste', event);
  };

  const handleFocus = (event: FocusEvent) => {
    if (!editorRef.value?.contains(event.relatedTarget as Node | null)) emit('focus', event);
  };

  const handleBlur = (event: FocusEvent) => {
    if (!editorRef.value?.contains(event.relatedTarget as Node | null)) {
      keyLock.value = false;
      emit('blur', event);
    }
  };

  const handleEditorClick = (event: MouseEvent) => {
    if (event.target === editorRef.value) focus({ cursor: 'end' });
  };

  const insertTextAtSelection = (
    value: string,
    position: SenderInsertPosition,
    replaceCharacters?: string,
    preventScroll = false,
  ) => {
    const textNodes = nodes.value.filter((node) => node.type === 'text');
    const { range, nodeElement } = getSelectionContext();
    let target =
      position === 'start'
        ? textNodes[0]
        : position === 'end'
          ? textNodes.at(-1)
          : nodes.value.find((node) => node.__id === nodeElement?.dataset.nodeId);
    if (!target || target.type !== 'text') target = textNodes.at(-1);
    if (!target) return;

    const element = nodeElements.get(target.__id);
    const currentText = String(target.value ?? '');
    let start = position === 'start' ? 0 : currentText.length;
    let end = start;
    if (
      position === 'cursor' &&
      range &&
      nodeElement?.dataset.nodeId === target.__id &&
      range.startContainer.nodeType === Node.TEXT_NODE
    ) {
      start = range.startOffset;
      end = range.endOffset;
    }
    if (replaceCharacters && currentText.slice(0, start).endsWith(replaceCharacters)) {
      start -= replaceCharacters.length;
    }
    updateNodeValue(target, `${currentText.slice(0, start)}${value}${currentText.slice(end)}`);
    nextTick(() => {
      if (!element) return;
      focusElement(element, 'end', preventScroll);
      const textNode = element.firstChild;
      if (!textNode) return;
      const cursor = start + value.length;
      const selection = window.getSelection();
      const nextRange = document.createRange();
      nextRange.setStart(textNode, Math.min(cursor, textNode.textContent?.length ?? 0));
      nextRange.collapse(true);
      selection?.removeAllRanges();
      selection?.addRange(nextRange);
    });
  };

  const insertSlots = (
    config: SenderSlotConfig[],
    position: SenderInsertPosition,
    replaceCharacters?: string,
    preventScroll = false,
  ) => {
    const { range, nodeElement } = getSelectionContext();
    let insertIndex = position === 'start' ? 0 : nodes.value.length;
    if (position === 'cursor' && nodeElement) {
      const currentIndex = nodes.value.findIndex(
        (node) => node.__id === nodeElement.dataset.nodeId,
      );
      insertIndex = currentIndex < 0 ? nodes.value.length : currentIndex + 1;
      const current = nodes.value[currentIndex];
      if (current?.type === 'text' && range?.startContainer.nodeType === Node.TEXT_NODE) {
        const text = String(current.value ?? '');
        let offset = range.startOffset;
        if (replaceCharacters && text.slice(0, offset).endsWith(replaceCharacters)) {
          offset -= replaceCharacters.length;
        }
        const before = buildNode({ type: 'text', value: text.slice(0, offset) });
        const after = buildNode({ type: 'text', value: text.slice(range.endOffset) });
        nodes.value = [
          ...nodes.value.slice(0, currentIndex),
          before,
          ...config.map((item) => ({ ...buildNode(item, true), runtime: true })),
          after,
          ...nodes.value.slice(currentIndex + 1),
        ];
        nextTick(() => {
          const afterElement = nodeElements.get(after.__id);
          if (afterElement) focusElement(afterElement, 'start', preventScroll);
        });
        emitChange();
        return;
      }
    }

    const inserted = config.map((item) => ({ ...buildNode(item, true), runtime: true }));
    const tail = buildNode({ type: 'text', value: '' });
    nodes.value = ensureEditableTail([
      ...nodes.value.slice(0, insertIndex),
      ...inserted,
      tail,
      ...nodes.value.slice(insertIndex),
    ]);
    nextTick(() => {
      const tailElement = nodeElements.get(tail.__id);
      if (tailElement) focusElement(tailElement, 'start', preventScroll);
    });
    emitChange();
  };

  const insert = (
    value: string | SenderSlotConfig[],
    position: SenderInsertPosition = 'cursor',
    replaceCharacters?: string,
    preventScroll = false,
  ) => {
    if (typeof value === 'string') {
      insertTextAtSelection(value, position, replaceCharacters, preventScroll);
    } else {
      insertSlots(value, position, replaceCharacters, preventScroll);
    }
  };

  const clear = () => {
    nodes.value = [buildNode({ type: 'text', value: '' })];
    activeSkill.value = props.skill;
    emitChange();
  };

  defineExpose({
    get nativeElement() {
      return editorRef.value ?? null;
    },
    focus,
    blur,
    insert,
    clear,
    getValue,
  });
</script>
