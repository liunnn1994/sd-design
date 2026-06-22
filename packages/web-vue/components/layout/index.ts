import type { App } from 'vue';

import type { SDOptions } from '../_utils/types';

import { setGlobalConfig, getComponentPrefix } from '../_utils/global-config';
import _Content from './content.vue';
import _Footer from './footer.vue';
import _Header from './header.vue';
import _Layout from './layout.vue';
import _Sider from './sider.vue';

const Layout = Object.assign(_Layout, {
  Header: _Header,
  Footer: _Footer,
  Content: _Content,
  Sider: _Sider,
  install: (app: App, options?: SDOptions) => {
    setGlobalConfig(app, options);
    const componentPrefix = getComponentPrefix(options);

    app.component(componentPrefix + _Layout.name, _Layout);
    app.component(componentPrefix + _Header.name, _Header);
    app.component(componentPrefix + _Footer.name, _Footer);
    app.component(componentPrefix + _Content.name, _Content);
    app.component(componentPrefix + _Sider.name, _Sider);
  },
});

export type LayoutInstance = InstanceType<typeof _Layout>;
export type LayoutHeaderInstance = InstanceType<typeof _Header>;
export type LayoutFooterInstance = InstanceType<typeof _Footer>;
export type LayoutContentInstance = InstanceType<typeof _Content>;
export type LayoutSiderInstance = InstanceType<typeof _Sider>;

export type {
  CollapseType,
  LayoutProps,
  SiderProps,
  SiderTemporaryDrawerProps,
  SiderTheme,
} from './interface';

export {
  _Content as LayoutContent,
  _Footer as LayoutFooter,
  _Header as LayoutHeader,
  _Sider as LayoutSider,
};

export default Layout;
