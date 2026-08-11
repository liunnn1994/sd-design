import { createApp, type VNodeChild, type VNodeTypes } from 'vue';

import InnerTextRenderer from './inner-text-renderer.vue';

let container: HTMLDivElement | null;

export default function getInnerText(node: VNodeTypes | VNodeTypes[] | undefined): string {
  if (!node) return '';

  if (!container) {
    container = document.createElement('div');
    container.setAttribute('aria-hidden', 'true');
    document.body.appendChild(container);
  }

  const vm = createApp(InnerTextRenderer, {
    content: node as Exclude<VNodeChild, null | undefined | void>,
  });

  vm.mount(container);

  const text = container.innerText;
  vm.unmount();

  return text;
}
