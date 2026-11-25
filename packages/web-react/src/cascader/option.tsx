import type { CascaderOptionCheckedStatus } from '@sdata/web-core/cascader/option';
import type { CascaderOptionInfo } from '@sdata/web-core/cascader/types';
import type { ComponentPropsWithoutRef } from 'react';

import { createCascaderOptionFoundation } from '@sdata/web-core/cascader/option';
import { createHoverIntent } from '@sdata/web-core/trigger/hover-intent';
import { useContext, useLayoutEffect, useRef, useState } from 'react';

import type { TagProps } from '../tag/index.js';

import { Checkbox } from '../checkbox/index.js';
import { usePrefix } from '../config-provider/index.js';
import { Ellipsis } from '../ellipsis/index.js';
import { PerformantEllipsis } from '../ellipsis/performant.js';
import IconLoading from '../icon/icon-loading.js';
import IconRight from '../icon/icon-right.js';
import { Radio } from '../radio/index.js';
import { CascaderContext } from './context.js';

export interface CascaderOptionProps extends ComponentPropsWithoutRef<'li'> {
  option: CascaderOptionInfo<TagProps>;
  active?: boolean;
  expanded?: boolean;
  multiple?: boolean | undefined;
  checkStrictly?: boolean | undefined;
  searchOption?: boolean;
  pathLabel?: boolean | undefined;
}
export function CascaderOptionView({
  option,
  active,
  expanded,
  multiple = false,
  checkStrictly = false,
  searchOption,
  pathLabel,
  ...attrs
}: CascaderOptionProps) {
  const context = useContext(CascaderContext);
  const prefix = usePrefix('cascader-option');
  const foundation = createCascaderOptionFoundation(
    {
      option,
      multiple,
      checkStrictly,
      get checkedStatus(): CascaderOptionCheckedStatus {
        return foundation.getCheckedStatus();
      },
    },
    context,
  );
  const checked = foundation.getCheckedStatus();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const live = useRef({ expanded, option });
  live.current = { expanded, option };
  const [hoverIntent] = useState(() =>
    createHoverIntent({
      getReference: () => buttonRef.current,
      getFloating: () =>
        live.current.expanded && !live.current.option.isLeaf
          ? (buttonRef.current?.closest('[data-sd-cascader-column]')
              ?.nextElementSibling as HTMLElement | null)
          : null,
    }),
  );
  useLayoutEffect(
    () => () => hoverIntent.cancel(),
    [
      hoverIntent,
      expanded,
      option.key,
      option.raw,
      option.disabled,
      option.isLeaf,
      context.expandTrigger,
      multiple,
      checkStrictly,
    ],
  );
  const label = pathLabel ? foundation.getPathOptionLabel() : option.label;
  const content =
    !pathLabel && context.renderOption ? (
      context.renderOption(option)
    ) : context.ellipsis === false ? (
      label
    ) : context.ellipsis === 'performant-ellipsis' ? (
      <PerformantEllipsis>{label}</PerformantEllipsis>
    ) : (
      <Ellipsis>{label}</Ellipsis>
    );
  return (
    <li {...attrs}>
      <button
        ref={buttonRef}
        type="button"
        disabled={option.disabled}
        aria-haspopup={!option.isLeaf}
        aria-expanded={!option.isLeaf && !!active}
        title={option.label}
        className={[prefix, active && `${prefix}-active`, option.disabled && `${prefix}-disabled`]
          .filter(Boolean)
          .join(' ')}
        onMouseEnter={(event) => {
          if (context.expandTrigger === 'hover')
            hoverIntent.enter(event.nativeEvent, foundation.handleMouseenter);
          else foundation.handleMouseenter();
        }}
        onMouseLeave={(event) => {
          foundation.handleMouseleave();
          if (context.expandTrigger === 'hover') hoverIntent.leave(event.nativeEvent, () => {});
          else hoverIntent.cancel();
        }}
        onClick={() => {
          hoverIntent.cancel();
          if (context.expandTrigger === 'hover') foundation.handleMouseenter();
          foundation.handleClick();
        }}
      >
        {multiple && (
          <Checkbox
            modelValue={checked.checked}
            indeterminate={checked.indeterminate}
            disabled={option.disabled || option.selectionDisabled}
            uninjectGroupContext
            onChange={foundation.handleCheckboxChange}
            onClick={(event) => event.stopPropagation()}
          />
        )}
        {checkStrictly && !multiple && (
          <Radio
            modelValue={context.valueMap?.has(option.key)}
            disabled={option.disabled}
            uninjectGroupContext
            onChange={foundation.handleRadioChange}
            onClick={(event) => event.stopPropagation()}
          />
        )}
        <div className={`${prefix}-label`}>
          {content}
          {foundation.getIsLoading() ? (
            <IconLoading />
          ) : !searchOption && !option.isLeaf ? (
            <IconRight />
          ) : null}
        </div>
      </button>
    </li>
  );
}
