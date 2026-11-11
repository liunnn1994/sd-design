import type { CascaderOptionCheckedStatus } from '@sdata/web-core/cascader/option';
import type { CascaderOptionInfo } from '@sdata/web-core/cascader/types';
import type { ComponentPropsWithoutRef } from 'react';

import { createCascaderOptionFoundation } from '@sdata/web-core/cascader/option';
import { useContext } from 'react';

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
  multiple?: boolean;
  checkStrictly?: boolean;
  searchOption?: boolean;
  pathLabel?: boolean;
}
export function CascaderOptionView({
  option,
  active,
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
        type="button"
        disabled={option.disabled}
        aria-haspopup={!option.isLeaf}
        aria-expanded={!option.isLeaf && !!active}
        title={option.label}
        className={[prefix, active && `${prefix}-active`, option.disabled && `${prefix}-disabled`]
          .filter(Boolean)
          .join(' ')}
        onMouseEnter={foundation.handleMouseenter}
        onMouseLeave={foundation.handleMouseleave}
        onClick={foundation.handleClick}
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
