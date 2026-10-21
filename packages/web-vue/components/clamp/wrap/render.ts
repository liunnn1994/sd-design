// Derived from vue-clamp v1.7.2, Copyright (c) 2018-present GU Yiling. MIT; see THIRD_PARTY_NOTICES.md.
import { h, mergeProps } from 'vue';
import type { CSSProperties, Ref, VNodeChild } from 'vue';

import { trueOrUndefined } from '@sdata/web-core/clamp/attributes';
import { resolveItemKey } from '@sdata/web-core/clamp/wrap/foundation';
import { contentStyle, hiddenItemStyle, itemStyle } from '@sdata/web-core/clamp/wrap/styles';

import type { WrapClampItemKey, WrapClampItemSlotProps, WrapClampSlotProps } from './types';

import { hasSlotContent } from '../slot';

type ElementRef = Ref<HTMLElement | null>;

type AffixPart = 'before' | 'after';
type AffixSlot<T> = ((props: WrapClampSlotProps<T>) => VNodeChild) | undefined;
type ItemSlot<T> = ((props: WrapClampItemSlotProps<T>) => VNodeChild) | undefined;

type ItemsOptions<T> = {
  itemKey: WrapClampItemKey<T> | undefined;
  items: readonly T[];
  itemSlot: ItemSlot<T>;
  renderedItemCount: number;
  visibleItemCount: number;
};

type RootOptions<T> = ItemsOptions<T> & {
  affixSlotProps: WrapClampSlotProps<T> | undefined;
  afterRef: ElementRef;
  afterSlot: AffixSlot<T>;
  attrs: Record<string, unknown>;
  beforeRef: ElementRef;
  beforeSlot: AffixSlot<T>;
  contentRef: ElementRef;
  rootRef: ElementRef;
  rootStyle: CSSProperties;
  rootTag: string;
};

function appendAffixSlot<T>(
  children: VNodeChild[],
  part: AffixPart,
  slot: AffixSlot<T>,
  setRef: ElementRef,
  affixSlotProps: WrapClampSlotProps<T> | undefined,
): void {
  // Keep affix rendering in this helper; resize-heavy flows call it
  // often enough that a component boundary showed up in WrapClamp benchmarks.
  if (!slot || !affixSlotProps) {
    return;
  }

  const content = slot(affixSlotProps);
  if (!hasSlotContent(content)) {
    return;
  }

  children.push(
    h(
      'span',
      {
        'data-part': part,
        'ref': setRef,
        'style': itemStyle,
      },
      content,
    ),
  );
}

function appendItems<T>(
  children: VNodeChild[],
  { itemKey, items, itemSlot, renderedItemCount, visibleItemCount }: ItemsOptions<T>,
): void {
  const renderedCount = Math.min(items.length, renderedItemCount);

  for (let index = 0; index < renderedCount; index += 1) {
    const item = items[index] as T;
    const hidden = index >= visibleItemCount;

    children.push(
      h(
        'span',
        {
          'aria-hidden': trueOrUndefined(hidden),
          'data-part': 'item',
          'key': resolveItemKey(itemKey, item, index),
          'style': hidden ? hiddenItemStyle : itemStyle,
        },
        itemSlot?.({
          item,
          index,
        }) ?? '',
      ),
    );
  }
}

export function renderRoot<T>({
  affixSlotProps,
  afterRef,
  afterSlot,
  attrs,
  beforeRef,
  beforeSlot,
  contentRef,
  itemKey,
  items,
  itemSlot,
  renderedItemCount,
  rootRef,
  rootStyle,
  rootTag,
  visibleItemCount,
}: RootOptions<T>): VNodeChild {
  const children: VNodeChild[] = [];

  appendAffixSlot(children, 'before', beforeSlot, beforeRef, affixSlotProps);
  appendItems(children, {
    itemKey,
    items,
    itemSlot,
    renderedItemCount,
    visibleItemCount,
  });
  appendAffixSlot(children, 'after', afterSlot, afterRef, affixSlotProps);

  return h(
    rootTag,
    mergeProps(attrs, {
      'data-part': 'root',
      'ref': rootRef,
      'style': rootStyle,
    }),
    h(
      'span',
      {
        'data-part': 'content',
        'ref': contentRef,
        'style': contentStyle,
      },
      children,
    ),
  );
}
