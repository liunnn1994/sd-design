import { createVNode, render, type AppContext, type VNodeChild, type VNodeTypes } from 'vue';

import InnerTextRenderer from './inner-text-renderer.vue';

export default function getInnerText(
  node: VNodeTypes | VNodeTypes[] | undefined,
  appContext?: AppContext,
): string {
  if (!node) return '';

  // 每次测量创建一次性容器并在用后移除，避免向 body 永久堆积 aria-hidden div；
  // 离屏定位（fixed + overflow hidden）保证测量期间不干扰布局
  const container = document.createElement('div');
  container.setAttribute('aria-hidden', 'true');
  container.style.cssText = 'position:fixed;top:0;left:0;width:0;height:0;overflow:hidden;';
  document.body.appendChild(container);

  const vm = createVNode(InnerTextRenderer, {
    content: node as Exclude<VNodeChild, null | undefined | void>,
  });

  vm.appContext = appContext ?? null;

  try {
    render(vm, container);
    return container.innerText;
  } finally {
    render(null, container);
    container.remove();
  }
}
