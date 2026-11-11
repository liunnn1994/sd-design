export const DEFAULT_VIRTUAL_DROPDOWN_HEIGHT = '200px';

export function resolveDropdownVirtualListProps<
  T extends {
    itemSize?: unknown;
    minItemSize?: unknown;
    height?: number | string;
  },
>(
  virtualListProps?: T,
  triggerProps?: { popupStyle?: { maxHeight?: number | string; height?: number | string } },
  defaultItemSize?: number,
): T | undefined {
  if (!virtualListProps) return undefined;
  const next = { ...virtualListProps };
  if (
    next.itemSize === undefined &&
    next.minItemSize === undefined &&
    defaultItemSize !== undefined
  )
    next.itemSize = defaultItemSize;
  if (next.height === undefined)
    next.height =
      triggerProps?.popupStyle?.maxHeight ??
      triggerProps?.popupStyle?.height ??
      DEFAULT_VIRTUAL_DROPDOWN_HEIGHT;
  return next;
}
