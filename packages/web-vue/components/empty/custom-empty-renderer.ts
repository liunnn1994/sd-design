// 稳定标识的函数式组件：接住 ConfigProvider 插槽返回的 vnode 作为唯一子节点渲染。
// 必须定义在模块级保持标识稳定，否则每次渲染都识别为新组件导致整树重挂载。
import type { VNode } from 'vue';

export const CustomEmptyRenderer = (props: { vnode?: VNode | VNode[] }) => props.vnode;
CustomEmptyRenderer.props = ['vnode'];
