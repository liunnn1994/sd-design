import SDVue from '@sd-design/web-vue';
import SDVueIcon from '@sd-design/web-vue/es/icon';
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
    app.use(SDVue);
    app.use(SDVueIcon as never);
    app.component('DemoBlock', DemoBlock);
  },
} satisfies Theme;
