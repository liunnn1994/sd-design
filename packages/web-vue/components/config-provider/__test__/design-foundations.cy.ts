import { defineComponent, h } from 'vue';

import Button, { ButtonGroup } from '../../button';
import Input from '../../input';
import Link from '../../link';
import Sender from '../../sender';
import Typography from '../../typography';
import ConfigProvider from '../index';

describe('设计基础的真实浏览器样式', () => {
  it('小尺寸仍继承公共圆角覆盖，尺寸专属覆盖优先', () => {
    const sizes = ['mini', 'small', 'medium', 'large'] as const;
    cy.mount(ConfigProvider, {
      props: { theme: { components: { button: { 'btn-border-radius': '20px' } } } },
      slots: {
        default: () =>
          sizes.map((size) => h(Button, { size, 'data-radius-size': size }, () => size)),
      },
    });
    cy.get('.sd-btn').each(($button) => expect($button).to.have.css('border-radius', '20px'));
    cy.get('@vue').then(({ wrapper }) =>
      cy.wrap(
        wrapper.setProps({
          theme: {
            components: { button: { 'btn-border-radius': '20px', 'btn-size-mini-radius': '4px' } },
          },
        }),
      ),
    );
    cy.get('[data-radius-size="mini"]').should('have.css', 'border-radius', '4px');
    cy.get('[data-radius-size="small"]').should('have.css', 'border-radius', '20px');
  });

  it('按钮与输入框共享 24 / 28 / 32 / 40px 尺寸', () => {
    const sizes = ['mini', 'small', 'medium', 'large'] as const;
    cy.mount(
      defineComponent({
        setup: () => () =>
          h(
            'div',
            sizes.map((size) =>
              h('div', [
                h(Button, { size, 'data-size': size }, () => '操作'),
                h(Input, { size, 'data-size': size }),
              ]),
            ),
          ),
      }),
    );
    sizes.forEach((size, index) => {
      const height = [24, 28, 32, 40][index];
      cy.get(`.sd-btn[data-size="${size}"]`).should('have.css', 'height', `${height}px`);
      cy.get(`.sd-input-wrapper[data-size="${size}"]`).should('have.css', 'height', `${height}px`);
    });
  });

  it('原有蓝色品牌与白字规则在浅暗主题中生效，同时保留暖灰表面', () => {
    cy.mount(
      defineComponent({
        setup: () => () =>
          h(
            'div',
            ['light', 'dark'].map((mode) =>
              h(
                'div',
                {
                  'sd-theme': mode,
                  'data-mode': mode,
                  'style': { background: 'var(--sd-color-bg-1)' },
                },
                [
                  h(Button, { type: 'primary' }, () => '发送'),
                  h(ButtonGroup, {}, () =>
                    ['copy', 'cut', 'find'].map((label) =>
                      h(Button, { type: 'primary' }, () => label),
                    ),
                  ),
                  h(Button, { type: 'text', class: 'brand-text' }, () => '文字操作'),
                  h(Button, { type: 'outline', class: 'brand-outline' }, () => '描边操作'),
                  h(
                    Typography.Text,
                    { type: 'primary', class: 'brand-typography' },
                    () => '强调文字',
                  ),
                  h(Link, { class: 'brand-link' }, () => '链接'),
                ],
              ),
            ),
          ),
      }),
    );
    cy.get('[data-mode="light"]').should('have.css', 'background-color', 'rgb(245, 245, 243)');
    cy.get('[data-mode="dark"]').should('have.css', 'background-color', 'rgb(21, 21, 21)');
    for (const [mode, color] of [
      ['light', 'rgb(22, 93, 255)'],
      ['dark', 'rgb(60, 126, 255)'],
    ] as const) {
      cy.get(`[data-mode="${mode}"] .sd-btn-primary`).each(($button) => {
        expect($button).to.have.css('background-color', color);
        expect($button).to.have.css('color', 'rgb(255, 255, 255)');
      });
      for (const className of ['brand-text', 'brand-outline', 'brand-typography', 'brand-link']) {
        cy.get(`[data-mode="${mode}"] .${className}`).should('have.css', 'color', color);
      }
    }
    cy.screenshot('original-brand-white-button-groups');
  });

  it('自定义品牌 seed 保留白色按钮文字', () => {
    cy.mount(ConfigProvider, {
      props: { theme: { seed: { primary: '#d97757' } } },
      slots: { default: () => h(Button, { type: 'primary' }, () => '提交') },
    });
    cy.get('.sd-btn')
      .should('have.css', 'background-color', 'rgb(217, 119, 87)')
      .and('have.css', 'color', 'rgb(255, 255, 255)');
  });

  it('原有品牌通道 token 与组件文字颜色覆盖保持兼容', () => {
    cy.mount(ConfigProvider, {
      props: { theme: { tokens: { primary6: '22, 93, 255' } } },
      slots: { default: () => h(Button, { type: 'primary' }, () => '提交') },
    });
    cy.get('.sd-btn').should('have.css', 'color', 'rgb(255, 255, 255)');
    cy.get('@vue').then(({ wrapper }) =>
      cy.wrap(
        wrapper.setProps({
          theme: {
            tokens: { primary6: '22, 93, 255' },
            components: { button: { 'btn-primary-color-text': '#ffff00' } },
          },
        }),
      ),
    );
    cy.get('.sd-btn').should('have.css', 'color', 'rgb(255, 255, 0)');
  });

  it('Sender 使用 20px 圆角并在输入聚焦时显示双环', () => {
    cy.mount(Sender);
    cy.get('.sd-sender-main').should('have.css', 'border-radius', '20px');
    cy.get('.sd-sender-main').then(($main) => {
      const shadow = getComputedStyle($main[0]).boxShadow;
      cy.get('textarea').focus();
      cy.get('.sd-sender-main').should(($focused) => {
        const focusedShadow = getComputedStyle($focused[0]).boxShadow;
        expect(focusedShadow).not.to.equal(shadow);
        expect(focusedShadow).to.contain('inset');
      });
    });
  });

  it('Sender 聚焦阴影可由局部组件 token 覆盖', () => {
    cy.mount(ConfigProvider, {
      props: { theme: { components: { sender: { 'box-shadow-focus': 'none' } } } },
      slots: { default: () => h(Sender) },
    });
    cy.get('textarea').focus();
    cy.get('.sd-sender-main').should('have.css', 'box-shadow', 'none');
  });
});
