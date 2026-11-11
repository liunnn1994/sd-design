import type {
  NormalizedTagGroupOption,
  TagGroupFieldNames,
  TagGroupObjectOption as CoreObjectOption,
  TagGroupOption as CoreOption,
  TagGroupOptionLabel,
} from '@sdata/web-core/tag-group/types';
import type { ComponentPropsWithRef, CSSProperties, ReactNode } from 'react';

import {
  createTagGroupFoundation,
  OVERFLOW_COUNTER_VALUE,
} from '@sdata/web-core/tag-group/foundation';
import { useMemo } from 'react';

import type { EllipsisTooltipProps } from '../ellipsis/index.js';

import { WrapClamp } from '../clamp/index.js';
import { usePrefix } from '../config-provider/index.js';
import { Popover } from '../popover/index.js';
import { Tag } from '../tag/index.js';

export type { TagGroupFieldNames, TagGroupOptionLabel };
export type TagGroupObjectOption = CoreObjectOption<EllipsisTooltipProps>;
export type TagGroupOption = CoreOption<EllipsisTooltipProps>;
export interface TagGroupItemContext {
  data: TagGroupObjectOption;
  option: TagGroupObjectOption;
  label: string | number;
  value: string | number;
  index: number;
  itemClass: string;
  itemStyle: CSSProperties | undefined;
  isOverflow: false;
  measure: false;
}
export interface TagGroupCounterContext {
  label: string;
  value: string;
  hiddenCount: number;
  measure: false;
  counterClass: string;
}
export interface TagGroupProps extends ComponentPropsWithRef<'span'> {
  maxCount?: number | 'responsive';
  options?: TagGroupOption[];
  fieldNames?: TagGroupFieldNames;
  renderItem?: (context: TagGroupItemContext) => ReactNode;
  renderLabel?: (context: {
    data: TagGroupObjectOption;
    option: TagGroupObjectOption;
  }) => ReactNode;
  renderCounter?: (context: TagGroupCounterContext) => ReactNode;
}
export type TagGroupInstance = HTMLSpanElement;
type Option = NormalizedTagGroupOption<EllipsisTooltipProps>;
const emptyOptions: TagGroupOption[] = [];
const emptyFields: TagGroupFieldNames = {};

function HiddenItems({
  options,
  start,
  renderItem,
  className,
}: {
  options: readonly Option[];
  start: number;
  renderItem: (option: Option, index: number, element: 'li' | 'span') => ReactNode;
  className: string;
}) {
  return (
    <ul className={className}>
      {options.map((option, index) => renderItem(option, start + index, 'li'))}
    </ul>
  );
}

export function TagGroup({
  maxCount = 'responsive',
  options = emptyOptions,
  fieldNames = emptyFields,
  renderItem,
  renderLabel,
  renderCounter,
  children,
  className,
  ...attrs
}: TagGroupProps) {
  const cls = usePrefix('tag-group');
  const responsive = maxCount === 'responsive';
  const { foundation, normalized } = useMemo(() => {
    let normalized: Option[] = [];
    const foundation = createTagGroupFoundation<EllipsisTooltipProps>({
      options,
      fieldNames,
      maxCount,
      get normalizedOptions() {
        return normalized;
      },
      get visibleCount(): number {
        return foundation.getVisibleCount();
      },
    });
    normalized = foundation.getNormalizedOptions();
    return { foundation, normalized };
  }, [options, fieldNames, maxCount]);
  const visibleCount = foundation.getVisibleCount();
  const item = (option: Option, index: number, Element: 'li' | 'span') => {
    const label = foundation.resolveOptionLabel(option);
    return (
      <Element
        key={option.key}
        className={`${cls}-item`}
        role={Element === 'span' ? 'listitem' : undefined}
      >
        {renderItem ? (
          renderItem({
            data: option.raw,
            option: option.raw,
            label,
            value: option.value,
            index,
            itemClass: `${cls}-item-content`,
            itemStyle: undefined,
            isOverflow: false,
            measure: false,
          })
        ) : (
          <Tag
            {...option.itemProps}
            className={[option.itemProps.className, `${cls}-item-content`]
              .filter(Boolean)
              .join(' ')}
            visible
            nowrap
          >
            {renderLabel ? renderLabel({ data: option.raw, option: option.raw }) : label}
          </Tag>
        )}
      </Element>
    );
  };
  const counter = (hidden: readonly Option[], Element: 'li' | 'span') =>
    hidden.length > 0 ? (
      <Popover
        key={hidden.length}
        trigger={['hover', 'focus']}
        content={
          <HiddenItems
            className={`${cls}-popover`}
            options={hidden}
            start={visibleCount}
            renderItem={item}
          />
        }
      >
        <Element
          className={`${cls}-item ${cls}-item-counter`}
          role={Element === 'span' ? 'listitem' : undefined}
        >
          {renderCounter ? (
            renderCounter({
              label: `+${hidden.length}`,
              value: `${OVERFLOW_COUNTER_VALUE}-${hidden.length}`,
              hiddenCount: hidden.length,
              measure: false,
              counterClass: `${cls}-counter-content`,
            })
          ) : (
            <Tag className={`${cls}-counter-content`} visible nowrap ellipsis={false} tabIndex={0}>
              +{hidden.length}
            </Tag>
          )}
        </Element>
      </Popover>
    ) : null;
  return (
    <span
      {...attrs}
      className={[
        cls,
        responsive && `${cls}-responsive`,
        options.length === 0 && `${cls}-empty`,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {normalized.length === 0 ? (
        children
      ) : responsive ? (
        <WrapClamp
          items={normalized}
          itemKey="key"
          maxLines={1}
          as="div"
          role="list"
          className={`${cls}-inner`}
          renderItem={({ item: option, index }) => item(option, index, 'span')}
          after={({ hiddenItems }) => counter(hiddenItems, 'span')}
        />
      ) : (
        <ul className={`${cls}-inner`}>
          {foundation.getVisibleOptions().map((option, index) => item(option, index, 'li'))}
          {counter(foundation.getHiddenOptions(), 'li')}
        </ul>
      )}
    </span>
  );
}
export default TagGroup;
