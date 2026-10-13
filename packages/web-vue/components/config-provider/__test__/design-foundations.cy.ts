import { defineComponent, h } from 'vue';

import Button from '../../button';
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

  it('普通字号的强调文字在浅色与暗色表面上保持可读对比度', () => {
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
                  'data-contrast-mode': mode,
                  'style': { background: 'var(--sd-color-bg-2)' },
                },
                [
                  h(Button, { type: 'text', class: 'contrast-target' }, () => '文字操作'),
                  h(Button, { type: 'outline', class: 'contrast-target' }, () => '描边操作'),
                  h(
                    Typography.Text,
                    { type: 'primary', class: 'contrast-target' },
                    () => '强调文字',
                  ),
                  h(Link, { class: 'contrast-target' }, () => '链接'),
                ],
              ),
            ),
          ),
      }),
    );
    const luminance = (color: string) => {
      const channels = color
        .match(/[\d.]+/g)!
        .slice(0, 3)
        .map(Number)
        .map((channel) => {
          const value = channel / 255;
          return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
        });
      return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
    };
    cy.get('.contrast-target').each(($element) => {
      const surface = $element.closest('[data-contrast-mode]')[0];
      const foreground = luminance(getComputedStyle($element[0]).color);
      const background = luminance(getComputedStyle(surface).backgroundColor);
      expect(
        (Math.max(foreground, background) + 0.05) / (Math.min(foreground, background) + 0.05),
      ).to.be.at.least(4.5);
    });
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

  it('陶土主操作与暖灰表面在浅色和暗色主题下生效', () => {
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
                [h(Button, { type: 'primary' }, () => '发送')],
              ),
            ),
          ),
      }),
    );
    cy.get('[data-mode="light"]').should('have.css', 'background-color', 'rgb(245, 245, 243)');
    cy.get('[data-mode="dark"]').should('have.css', 'background-color', 'rgb(21, 21, 21)');
    cy.get('.sd-btn').each(($button) => {
      expect($button).to.have.css('background-color', 'rgb(217, 119, 87)');
      expect($button).to.have.css('color', 'rgb(11, 11, 10)');
    });
  });

  it('自定义深色品牌 seed 自动选择白色按钮文字', () => {
    cy.mount(ConfigProvider, {
      props: { theme: { seed: { primary: '#165dff' } } },
      slots: { default: () => h(Button, { type: 'primary' }, () => '提交') },
    });
    cy.get('.sd-btn')
      .should('have.css', 'background-color', 'rgb(22, 93, 255)')
      .and('have.css', 'color', 'rgb(255, 255, 255)');
  });

  it('旧的品牌通道 token 保持可读，并尊重显式前景色覆盖', () => {
    cy.mount(ConfigProvider, {
      props: { theme: { tokens: { primary6: '22, 93, 255' } } },
      slots: { default: () => h(Button, { type: 'primary' }, () => '提交') },
    });
    cy.get('.sd-btn').should('have.css', 'color', 'rgb(255, 255, 255)');
    cy.get('@vue').then(({ wrapper }) =>
      cy.wrap(
        wrapper.setProps({
          theme: { tokens: { 'primary6': '22, 93, 255', 'color-primary-on': '#ffff00' } },
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
