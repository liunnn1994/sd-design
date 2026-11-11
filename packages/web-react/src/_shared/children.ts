import type { ReactNode } from 'react';

import { Children, Fragment, isValidElement } from 'react';

export function getRenderItems(
  children: ReactNode,
  prefix = '',
): { key: string; content: ReactNode }[] {
  return Children.toArray(children).flatMap((child, index) => {
    const key = `${prefix}/${isValidElement(child) ? (child.key ?? index) : index}`;
    return isValidElement<{ children?: ReactNode }>(child) && child.type === Fragment
      ? getRenderItems(child.props.children, key)
      : [{ key, content: child }];
  });
}
