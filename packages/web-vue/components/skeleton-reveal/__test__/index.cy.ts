import { h, ref } from 'vue';

import type { SdThemeConfig } from '../../config-provider/theme';

import ConfigProvider from '../../config-provider';
import SkeletonReveal from '../index';

const mount = (props = {}) =>
  cy.mount(SkeletonReveal, {
    props: { autoplay: false, ...props },
    slots: {
      default: () =>
        h('form', { style: 'padding:24px;width:320px;border:1px solid' }, [
          h('p', '创建项目'),
          h('input', { placeholder: '项目名称' }),
          h('button', { type: 'button' }, '创建'),
        ]),
    },
  });
const replay = () =>
  cy.get('@vue').then(({ wrapper }) => {
    void wrapper.vm.replay();
  });

describe('SkeletonReveal', () => {
  afterEach(() =>
    cy.then(() =>
      Cypress.automation('remote:debugger:protocol', {
        command: 'Emulation.setEmulatedMedia',
        params: { features: [] },
      }),
    ),
  );

  it('系统减少动态效果时直接显示，重播也不创建动画', () => {
    cy.then(() =>
      Cypress.automation('remote:debugger:protocol', {
        command: 'Emulation.setEmulatedMedia',
        params: { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] },
      }),
    );
    mount({ autoplay: true });
    replay();
    cy.get('.sd-skeleton-reveal-overlay').should('not.exist');
    cy.get('input').should('be.visible');
  });

  it('手动播放在离开视口后立即停止', () => {
    mount({ duration: 8000 });
    replay();
    cy.get('.sd-skeleton-reveal').should('have.attr', 'data-state', 'drawing');
    cy.get('.sd-skeleton-reveal').invoke('css', 'transform', 'translateY(3000px)');
    cy.get('.sd-skeleton-reveal-overlay').should('not.exist');
    cy.get('.sd-skeleton-reveal-content').should('have.css', 'opacity', '1');
  });

  it('绘制真实轮廓，完成后释放 SVG 与动画', () => {
    mount({ duration: 600 });
    replay();
    cy.get('.sd-skeleton-reveal-overlay')
      .should('have.attr', 'aria-hidden', 'true')
      .and('have.css', 'pointer-events', 'none');
    cy.get('[data-reveal-draw]').should('have.length', 4);
    cy.get('[data-reveal-draw]')
      .first()
      .should(($rect) => {
        expect(Number.parseFloat(getComputedStyle($rect[0]).strokeDashoffset)).to.be.lessThan(0.95);
      });
    cy.get('.sd-skeleton-reveal').should('have.attr', 'data-state', 'complete');
    cy.get('.sd-skeleton-reveal-overlay').should('not.exist');
    cy.get('input').should('be.visible');
    cy.get('@vue').should(({ wrapper }) => expect(wrapper.emitted('finish')).to.have.length(1));
    cy.get('.sd-skeleton-reveal').should(($root) => {
      expect(
        $root[0]
          .getAnimations({ subtree: true })
          .filter((animation) => animation.playState === 'running'),
      ).to.have.length(0);
    });
  });

  it('聚焦与键盘输入立即结束，不吞掉首轮输入', () => {
    mount({ duration: 8000 });
    replay();
    cy.get('.sd-skeleton-reveal').should('have.attr', 'data-state', 'drawing');
    cy.get('input').focus().type('新项目');
    cy.get('input').should('have.value', '新项目').and('be.focused');
    cy.get('.sd-skeleton-reveal-overlay').should('not.exist');
  });

  it('快速重播和尺寸变化不会留下不可见内容', () => {
    mount({ duration: 8000 });
    replay();
    replay();
    cy.get('.sd-skeleton-reveal').should('have.attr', 'data-state', 'drawing');
    cy.get('form').invoke('css', 'width', '260px');
    cy.get('.sd-skeleton-reveal-overlay').should('not.exist');
    cy.get('.sd-skeleton-reveal-content').should('have.css', 'opacity', '1');
  });

  it('禁用和零时长均直接展示', () => {
    mount({ disabled: true });
    replay();
    cy.get('.sd-skeleton-reveal-overlay').should('not.exist');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ disabled: false, duration: 0 }));
    replay();
    cy.get('input').should('be.visible');
    cy.get('.sd-skeleton-reveal-overlay').should('not.exist');
  });

  it('轮廓数量有上限，卸载清理所有覆盖层', () => {
    cy.mount(SkeletonReveal, {
      props: { autoplay: false, duration: 8000 },
      slots: {
        default: () =>
          h(
            'div',
            Array.from({ length: 100 }, (_, index) => h('p', `内容 ${index}`)),
          ),
      },
    });
    replay();
    cy.get('[data-reveal-draw]').should('have.length', 24);
    cy.get('@vue').then(({ wrapper }) => wrapper.unmount());
    cy.get('.sd-skeleton-reveal-overlay').should('not.exist');
  });

  it('Core 主题 token 与兼容简写均能动态修改真实 SVG 轮廓', () => {
    const theme = ref<SdThemeConfig>({
      components: {
        'skeleton-reveal': {
          'skeleton-reveal-stroke': '#123456',
          'skeleton-reveal-stroke-width': '8px',
        },
      },
    });
    const reveal = ref<InstanceType<typeof SkeletonReveal>>();
    cy.mount(() =>
      h(
        ConfigProvider,
        { theme: theme.value },
        {
          default: () =>
            h(
              SkeletonReveal,
              { ref: reveal, autoplay: false, duration: 8000 },
              {
                default: () =>
                  h('div', { style: 'padding:24px;width:300px' }, [h('p', '主题轮廓')]),
              },
            ),
        },
      ),
    );
    cy.then(() => {
      void reveal.value?.replay();
    });
    cy.get('.sd-skeleton-reveal-overlay > rect')
      .should('have.css', 'stroke', 'rgb(18, 52, 86)')
      .and('have.css', 'stroke-width', '8px');
    cy.get('[data-reveal-draw]').should('have.css', 'stroke-width', '8px');
    cy.then(() => {
      theme.value = {
        components: { 'skeleton-reveal': { stroke: '#00aa66', strokeWidth: '2px' } },
      };
    });
    cy.get('.sd-skeleton-reveal-overlay > rect')
      .should('have.css', 'stroke', 'rgb(0, 170, 102)')
      .and('have.css', 'stroke-width', '2px');
    cy.get('[data-reveal-draw]').should('have.css', 'stroke-width', '5px');
  });
});
