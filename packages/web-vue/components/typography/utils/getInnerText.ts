import { createVNode, render, type AppContext, type VNodeChild, type VNodeTypes } from 'vue';

import {
  createTypographyTextContainer,
  measureTypographyInnerText,
} from '@sdata/web-core/typography/measure';

import InnerTextRenderer from './inner-text-renderer.vue';

export default function getInnerText(
  node: VNodeTypes | VNodeTypes[] | undefined,
  appContext?: AppContext,
): string {
  if (!node) return '';

  const container = createTypographyTextContainer();
  const vm = createVNode(InnerTextRenderer, {
    content: node as Exclude<VNodeChild, null | undefined | void>,
  });

  vm.appContext = appContext ?? null;

  return measureTypographyInnerText(
    container,
    () => render(vm, container),
    () => render(null, container),
  );
}
