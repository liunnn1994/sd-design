import type { Theme } from 'vitepress';

import { h } from 'vue';

import '../../../web-vue/components/index.less';
import SDVue from '@sdata/web-vue';
import SDVueIcon from '@sdata/web-vue/es/icon';
import DefaultTheme from 'vitepress/theme';

import DemoBlock from './components/DemoBlock.vue';
import ThemeBridge from './components/ThemeBridge.vue';
import './style.css';

export default {
  extends: DefaultTheme,
  Layout() {
    return h('div', null, [h(DefaultTheme.Layout), h(ThemeBridge)]);
  },
  enhanceApp({ app }) {
    app.use(SDVue);
    app.use(SDVueIcon as never);
    app.component('DemoBlock', DemoBlock);
  },
} satisfies Theme;
