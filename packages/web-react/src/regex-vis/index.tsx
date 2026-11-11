import type { RegexVisError, RegexVisFlag } from '@sdata/web-core/regex-vis/types';
import type { ComponentRef as ReactComponentRef } from 'react';

import { createRegexVisFoundation } from '@sdata/web-core/regex-vis/foundation';
import { useLayoutEffect, useMemo, useRef, useState } from 'react';

import type { RegexVisProps } from './types.js';

export type RegexVisSlots = Pick<RegexVisProps, 'renderEmpty' | 'renderError' | 'renderFooter'>;

import { CheckboxGroup } from '../checkbox/index.js';
import { usePrefix } from '../config-provider/index.js';
import { Input } from '../input/index.js';
import { useI18n } from '../locale/index.js';

export type {
  RegexVisProps,
  RegexVisFlag,
  RegexVisNode,
  RegexVisError,
  RegexVisTranslate,
  RegexVisSelectInfo,
} from './types.js';
const flagOptions = ['g', 'i', 'm', 's', 'u', 'y'];
const emptyFlags: RegexVisFlag[] = [];

export function RegexVis(props: RegexVisProps) {
  const {
    value: controlledValue,
    defaultValue = '',
    flags: controlledFlags,
    defaultFlags = emptyFlags,
    readonly = false,
    showInput = true,
    showFlags = true,
    selectable = true,
    placeholder,
    emptyText,
    ariaLabel,
    onValueChange,
    onFlagsChange,
    onSelect,
    onError,
    renderEmpty,
    renderError,
    renderFooter,
    className,
    ...attrs
  } = props;
  const [localValue, setValue] = useState(defaultValue);
  const [localFlags, setFlags] = useState(defaultFlags);
  const [selectedId, setSelectedId] = useState<string>();
  const value = controlledValue ?? localValue;
  const flags = controlledFlags ?? localFlags;
  const prefix = usePrefix('regex-vis');
  const { t, i18nMessage } = useI18n();
  const updateValue = (next: string) => {
    if (controlledValue === undefined) setValue(next);
    onValueChange?.(next);
  };
  const foundation = createRegexVisFoundation(
    {
      get modelValue() {
        return value;
      },
      set modelValue(next) {
        updateValue(next);
      },
      get flags() {
        return flags;
      },
      set flags(next) {
        if (controlledFlags === undefined) setFlags(next);
        onFlagsChange?.(next);
      },
      get selectedId() {
        return selectedId;
      },
      set selectedId(next) {
        setSelectedId(next);
      },
      selectable,
      get parseResult() {
        return parseResult;
      },
    },
    t,
    (info) => onSelect?.(info),
  );
  const parseResult = useMemo(() => foundation.getParseResult(), [value, flags]);
  const error = foundation.getParseError();
  const effectiveFlags = foundation.getEffectiveFlags();
  const diagram = useMemo(() => foundation.getDiagram(), [parseResult, i18nMessage]);
  const literalFlags = foundation.getLiteralFlags();
  const syncedLiteralFlags = useRef<RegexVisFlag[] | undefined>(undefined);
  const errorEmission = useRef<{ error: RegexVisError | undefined } | null>(null);
  useLayoutEffect(() => {
    if (!errorEmission.current || errorEmission.current.error !== error) {
      errorEmission.current = { error };
      onError?.(error);
    }
  }, [error, onError]);
  useLayoutEffect(() => {
    if (syncedLiteralFlags.current !== literalFlags) {
      syncedLiteralFlags.current = literalFlags;
      foundation.syncLiteralFlags(literalFlags);
    }
  }, [literalFlags]);
  useLayoutEffect(() => {
    foundation.syncDiagram(diagram);
  }, [diagram]);
  const label = ariaLabel ?? t('regexVis.graphLabel');
  const empty = emptyText ?? t('regexVis.empty');
  return (
    <section
      {...attrs}
      className={[
        prefix,
        readonly && `${prefix}-readonly`,
        selectable && `${prefix}-selectable`,
        error && `${prefix}-invalid`,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label={label}
    >
      {showInput && (
        <div className={`${prefix}-controls`}>
          <Input
            value={value}
            onValueChange={updateValue}
            className={`${prefix}-input`}
            placeholder={placeholder ?? t('regexVis.placeholder')}
            readonly={readonly}
            error={Boolean(error)}
            allowClear
            aria-label={t('regexVis.inputLabel')}
          />
          {showFlags && (
            <CheckboxGroup
              value={effectiveFlags}
              options={flagOptions}
              disabled={readonly}
              className={`${prefix}-flags`}
              aria-label={t('regexVis.flagsLabel')}
              onValueChange={foundation.updateFlags}
            />
          )}
        </div>
      )}
      <div className={`${prefix}-viewport`}>
        {!value ? (
          <div className={`${prefix}-empty`}>
            {renderEmpty ? renderEmpty({ text: empty }) : empty}
          </div>
        ) : error ? (
          <div className={`${prefix}-error`} role="alert">
            {renderError ? (
              renderError({ error })
            ) : (
              <>
                <span className={`${prefix}-error-title`}>{t('regexVis.invalid')}</span>
                <span className={`${prefix}-error-message`}>{error.message}</span>
              </>
            )}
          </div>
        ) : (
          diagram && (
            <svg
              className={`${prefix}-graph`}
              viewBox={`0 0 ${diagram.width} ${diagram.height}`}
              width={diagram.width}
              height={diagram.height}
              role="img"
              aria-label={`${label}：${value}`}
              data-testid="regex-vis-graph"
            >
              <g className={`${prefix}-rail`} aria-hidden="true">
                {diagram.paths.map((path) => (
                  <path key={path.id} d={path.d} />
                ))}
                <circle cx={8} cy={diagram.startY} r={5} />
                <circle cx={diagram.width - 8} cy={diagram.startY} r={5} />
              </g>
              {diagram.labels.map((item) => (
                <text
                  key={item.id}
                  className={`${prefix}-${item.variant}-label`}
                  x={item.x}
                  y={item.y}
                  dominantBaseline="middle"
                  textAnchor="middle"
                >
                  {item.text}
                </text>
              ))}
              {diagram.quantifiers.map((item) => (
                <g
                  key={item.id}
                  className={`${prefix}-quantifier`}
                  data-y={item.y}
                  aria-hidden="true"
                >
                  <svg
                    x={item.x}
                    y={item.y}
                    width={16}
                    height={16}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                  >
                    <path d="M17 1l4 4-4 4" />
                    <path
                      d="M3 11V9a4 4 0 0 1 4-4h14M21 13v2a4 4 0 0 1-4 4H3"
                      strokeDasharray={item.greedy ? undefined : '4 4'}
                    />
                    <path d="M7 23l-4-4 4-4" />
                  </svg>
                  <text x={item.x + 20} y={item.y + 8} dominantBaseline="middle">
                    {item.text}
                  </text>
                </g>
              ))}
              {diagram.nodes.map((node) => (
                <g
                  key={node.id}
                  className={[
                    `${prefix}-node`,
                    `${prefix}-node-${node.variant}`,
                    selectedId === node.id && `${prefix}-node-selected`,
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  role={selectable ? 'button' : undefined}
                  tabIndex={selectable ? 0 : undefined}
                  aria-label={node.description}
                  aria-pressed={selectable ? selectedId === node.id : undefined}
                  onClick={(event) => {
                    event.stopPropagation();
                    foundation.selectNode(node);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.stopPropagation();
                      event.preventDefault();
                      foundation.selectNode(node);
                    }
                  }}
                >
                  <rect
                    x={node.x}
                    y={node.y}
                    width={node.width}
                    height={node.height}
                    rx={node.variant === 'group' || node.variant === 'choice' ? 8 : 4}
                  />
                  {node.variant === 'group' || node.variant === 'choice' ? (
                    <text x={node.x + 12} y={node.y + 18} dominantBaseline="middle">
                      {node.label}
                    </text>
                  ) : (
                    <text
                      x={node.x + node.width / 2}
                      y={node.y + node.height / 2}
                      dominantBaseline="middle"
                      textAnchor="middle"
                    >
                      {node.lines.map((line, index) => (
                        <tspan
                          key={index}
                          x={node.x + node.width / 2}
                          dy={index === 0 ? -((node.lines.length - 1) * 20) / 2 : 20}
                        >
                          {line}
                        </tspan>
                      ))}
                    </text>
                  )}
                </g>
              ))}
            </svg>
          )
        )}
      </div>
      {renderFooter && (
        <div className={`${prefix}-footer`}>{renderFooter({ value, flags: effectiveFlags })}</div>
      )}
    </section>
  );
}

export default RegexVis;

export type RegexVisInstance = ReactComponentRef<typeof RegexVis>;
