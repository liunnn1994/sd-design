import type { ComponentHost } from '@sdata/web-core/rich-text-editor/foundation';
import type {
  RichTextEditorOptions,
  RichTextEditorRef,
} from '@sdata/web-core/rich-text-editor/types';
import type { CSSProperties } from 'react';

import {
  createRichTextEditorFoundation,
  TRANSFORMERS,
} from '@sdata/web-core/rich-text-editor/foundation';
import { useImperativeHandle, useLayoutEffect, useRef, useState } from 'react';
import { createPortal, flushSync } from 'react-dom';

import type { RichTextEditorProps } from './types.js';

import { useAfterRender } from '../_shared/use-after-render.js';
import { usePrefix } from '../config-provider/index.js';
import { useI18n } from '../locale/index.js';
import { RichTextNodeRenderer } from './node-renderer.js';

const noPlugins: RichTextEditorOptions['plugins'] = [];
export function RichTextEditor(props: RichTextEditorProps) {
  const {
    value,
    modelValue,
    defaultValue,
    editorConfig,
    plugins = noPlugins,
    transformers = TRANSFORMERS,
    disabled,
    readonly,
    history = true,
    historyDelay = 300,
    historyMaxDepth = null,
    autoSize = true,
    spellcheck = true,
    ariaLabel,
    placeholder,
    slots,
    classNames = {},
    styles = {},
    onValueChange: _onValueChange,
    onChange: _onChange,
    onUpdate: _onUpdate,
    onReady: _onReady,
    onFocus,
    onBlur,
    onError: _onError,
    ref,
    className,
    style,
    spellCheck,
    children: _children,
    ...attrs
  } = props;
  const prefix = usePrefix('rich-text-editor');
  const { t } = useI18n();
  const root = useRef<HTMLDivElement>(null);
  const editor = useRef<RichTextEditorRef['editor']>(null);
  const canUndo = useRef(false),
    canRedo = useRef(false);
  const [empty, setEmpty] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [hosts, setHosts] = useState<ComponentHost[]>([]);
  const synchronizeHosts = useRef(false);
  const afterRender = useAfterRender();
  const options: RichTextEditorOptions = {
    modelValue: value ?? modelValue,
    defaultValue,
    editorConfig,
    plugins,
    transformers,
    disabled,
    readonly,
    history,
    historyDelay,
    historyMaxDepth,
  };
  const live = useRef({ options, props });
  live.current = { options, props };
  const [foundation] = useState(() =>
    createRichTextEditorFoundation({
      get options() {
        return live.current.options;
      },
      prefixCls: prefix,
      get editor() {
        return editor.current;
      },
      get rootElement() {
        return root.current ?? undefined;
      },
      setEditor: (value) => {
        editor.current = value;
      },
      setEmpty,
      setCanUndo: (value) => {
        canUndo.current = value;
      },
      setCanRedo: (value) => {
        canRedo.current = value;
      },
      setComponentHosts(hosts) {
        // Commit Lexical snapshots before an inline input restores its controlled DOM value.
        const synchronize = synchronizeHosts.current;
        synchronizeHosts.current = false;
        if (synchronize && hosts.length) flushSync(() => setHosts(hosts));
        else setHosts(hosts);
      },
      hasStateListeners: () =>
        Boolean(live.current.props.onValueChange || live.current.props.onChange),
      afterRender: (task) => {
        void afterRender().then(() => {
          if (editor.current) task();
        });
      },
      onError: (error) => live.current.props.onError?.(error),
      onUpdate: (context) => live.current.props.onUpdate?.(context),
      onUpdateValue: (value) => live.current.props.onValueChange?.(value),
      onChange: (value, context) => live.current.props.onChange?.(value, context),
      onReady: (value) => live.current.props.onReady?.(value),
    }),
  );
  useImperativeHandle(ref, () => {
    const {
      mount: _mount,
      dispose: _dispose,
      syncModel: _sync,
      syncEditable: _editable,
      ...methods
    } = foundation;
    return {
      ...methods,
      get editor() {
        return editor.current;
      },
      get editorState() {
        return editor.current?.getEditorState() ?? null;
      },
      get rootElement() {
        return root.current;
      },
      get canUndo() {
        return canUndo.current;
      },
      get canRedo() {
        return canRedo.current;
      },
    };
  }, [foundation]);
  useLayoutEffect(() => {
    foundation.mount();
    setInitialized(true);
    return foundation.dispose;
  }, [foundation]);
  useLayoutEffect(() => {
    foundation.syncModel(options.modelValue);
  }, [foundation, options.modelValue]);
  useLayoutEffect(() => {
    foundation.syncEditable(disabled, readonly);
  }, [foundation, disabled, readonly]);
  const contentStyle: CSSProperties = !autoSize
    ? {}
    : autoSize === true
      ? { minHeight: '1.5715em' }
      : {
          minHeight: autoSize.minRows ? `${autoSize.minRows}lh` : undefined,
          maxHeight: autoSize.maxRows ? `${autoSize.maxRows}lh` : undefined,
          overflowY: autoSize.maxRows ? 'auto' : undefined,
        };
  return (
    <div
      {...attrs}
      className={[
        prefix,
        classNames.root,
        disabled && `${prefix}-disabled`,
        readonly && `${prefix}-readonly`,
        !disabled && !readonly && `${prefix}-focusable`,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ ...styles.root, ...style }}
    >
      <div
        ref={root}
        className={[`${prefix}-content`, classNames.content].filter(Boolean).join(' ')}
        style={{ ...contentStyle, ...styles.content }}
        role="textbox"
        aria-multiline="true"
        aria-label={ariaLabel ?? t('richTextEditor.ariaLabel')}
        aria-disabled={disabled || undefined}
        aria-readonly={readonly || undefined}
        spellCheck={spellCheck ?? spellcheck}
        contentEditable={initialized && !disabled && !readonly}
        suppressContentEditableWarning
        onFocus={(event) => {
          if (event.target === event.currentTarget) onFocus?.(event.nativeEvent);
        }}
        onBlur={(event) => {
          if (event.target === event.currentTarget) onBlur?.(event.nativeEvent);
        }}
      />
      {empty && (
        <div
          className={[`${prefix}-placeholder`, classNames.placeholder].filter(Boolean).join(' ')}
          style={styles.placeholder}
          aria-hidden="true"
        >
          {slots?.placeholder ? slots.placeholder() : placeholder}
        </div>
      )}
      {hosts.map((host) => {
        const context = {
          nodeKey: host.nodeKey,
          node: host.node,
          disabled: Boolean(disabled),
          readonly: Boolean(readonly),
          editor: host.editor,
          update: (value: Parameters<typeof foundation.updateComponent>[1]) => {
            synchronizeHosts.current = true;
            foundation.updateComponent(host.nodeKey, value);
          },
          remove: () => foundation.removeComponent(host.nodeKey),
        };
        const render = slots?.[`node-${host.node.name}`];
        return createPortal(
          <span className={classNames.component} style={styles.component}>
            {render ? render(context) : <RichTextNodeRenderer {...context} />}
          </span>,
          host.element,
          host.nodeKey,
        );
      })}
    </div>
  );
}
