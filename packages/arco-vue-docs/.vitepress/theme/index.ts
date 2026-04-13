import ArcoVue from '@arco-design/web-vue';
import ArcoVueIcon from '@arco-design/web-vue/es/icon';
import '../../../web-vue/components/index.less';
import { h } from 'vue';
import type { Theme } from 'vitepress';
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
    app.use(ArcoVue);
    app.use(ArcoVueIcon as never);
    app.component('DemoBlock', DemoBlock);
  },
} satisfies Theme;
