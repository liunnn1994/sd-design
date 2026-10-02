import { defineComponent, h, ref } from 'vue';

import {
  MarkdownRender,
  ThemeProvider,
  VueRendererMarkdown,
  setCustomComponents,
  removeCustomComponents,
} from '../../index';
import ImageNode from '../nodes/image.vue';

const pixel = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';

describe('Markdown SD 节点', () => {
  it('图片保留 fallback、lazy 和成功事件载荷', () => {
    const load = cy.stub().as('imageLoad');
    const error = cy.stub().as('imageError');
    cy.intercept('GET', '**/sd-markdown-missing.png', { statusCode: 404 });
    cy.mount(ImageNode, {
      props: {
        node: {
          type: 'image',
          src: '/sd-markdown-missing.png',
          alt: '图片说明',
          title: '图片标题',
          raw: '![图片说明](/sd-markdown-missing.png)',
        },
        fallbackSrc: pixel,
        lazy: true,
        onLoad: load,
        onError: error,
      },
    });
    cy.get('.sd-image img')
      .should('have.attr', 'alt', '图片说明')
      .and('have.attr', 'loading', 'lazy');
    cy.get('.sd-image img').should('have.attr', 'src', pixel);
    cy.get('@imageLoad').should('have.been.calledOnceWith', pixel);
    cy.get('@imageError').should('not.have.been.called');
  });
  it('图片终态错误显示调用方错误插槽', () => {
    cy.intercept('GET', '**/sd-markdown-error.png', { statusCode: 404 });
    const error = cy.stub().as('imageError');
    cy.mount(ImageNode, {
      props: {
        node: {
          type: 'image',
          src: '/sd-markdown-error.png',
          alt: '失败图片',
          title: null,
          raw: '',
        },
        onError: error,
      },
      slots: {
        error: (scope: { displaySrc: string }) =>
          h('span', { id: 'custom-error' }, scope.displaySrc),
      },
    });
    cy.get('#custom-error').should('contain.text', '/sd-markdown-error.png');
    cy.get('@imageError').should('have.been.calledOnce');
  });
  it('主题继承和显式 isDark 优先', () => {
    const mode = ref<'light' | 'dark'>('dark');
    cy.mount(
      defineComponent({
        setup: () => () =>
          h(ThemeProvider, { themeMode: mode.value }, () => [
            h(MarkdownRender, { content: '## 继承', final: true, id: 'inherited' }),
            h(MarkdownRender, { content: '## 显式', final: true, isDark: false, id: 'explicit' }),
          ]),
      }),
    );
    cy.get('#inherited').should('have.class', 'dark');
    cy.get('#explicit')
      .should('not.have.class', 'dark')
      .then(() => {
        mode.value = 'light';
      });
    cy.get('#inherited').should('not.have.class', 'dark');
  });
  it('app 级调用方映射优先，注册表后续更新仍生效', () => {
    const heading = defineComponent({
      setup: () => () => h('h2', { class: 'app-heading' }, '应用标题'),
    });
    const override = defineComponent({
      setup: () => () => h('h2', { class: 'later-heading' }, '后续标题'),
    });
    cy.mount(MarkdownRender, {
      props: { content: '## 标题', final: true, customId: 'later' },
      global: { plugins: [[VueRendererMarkdown, { components: { heading } }]] },
    });
    cy.get('.app-heading')
      .should('exist')
      .then(() => setCustomComponents('later', { heading: override }));
    cy.get('.later-heading')
      .should('contain.text', '后续标题')
      .then(() => removeCustomComponents('later'));
    cy.get('.app-heading').should('exist');
  });
  it('safe 与 trusted 的 HTML 信任策略分别保留', () => {
    cy.mount(
      defineComponent({
        setup: () => () =>
          h('div', [
            h(MarkdownRender, {
              content: '<div><button>安全策略</button></div>',
              final: true,
              id: 'safe',
            }),
            h(MarkdownRender, {
              content: '<div><button>信任策略</button></div>',
              final: true,
              htmlPolicy: 'trusted',
              id: 'trusted',
            }),
          ]),
      }),
    );
    cy.get('#safe button').should('not.exist');
    cy.get('#trusted .sd-btn').should('contain.text', '信任策略');
  });
});
