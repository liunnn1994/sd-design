import { h } from 'vue';

import ConfigProvider from '../../config-provider';
import Spin from '../index';

describe('Spin', () => {
  it('forwards attributes to the status root', () => {
    cy.mount(Spin, { attrs: { class: 'custom-spin' } });
    cy.get('.sd-spin').should('have.class', 'custom-spin');
  });

  it('exposes role=status / aria-live and hides the decorative icon', () => {
    cy.mount(Spin, { props: { tip: 'Loading data' } });
    cy.get('.sd-spin').should('have.attr', 'role', 'status');
    cy.get('.sd-spin').should('have.attr', 'aria-live', 'polite');
    cy.get('.sd-spin-icon').should('have.attr', 'aria-hidden', 'true');
    cy.get('.sd-spin-tip').should('contain', 'Loading data');
  });

  it('shows the loading mask immediately by default', () => {
    cy.mount(Spin, {
      props: { loading: true },
      slots: { default: () => 'Content' },
    });
    cy.get('.sd-spin-mask').should('exist');
  });

  it('delays showing the loading mask by 400ms when delay is true', () => {
    cy.clock();
    cy.mount(Spin, {
      props: { loading: true, delay: true },
      slots: { default: () => 'Content' },
    });
    cy.get('.sd-spin-mask').should('not.exist');
    cy.tick(399);
    cy.get('.sd-spin-mask').should('not.exist');
    cy.tick(1);
    cy.get('.sd-spin-mask').should('exist');
  });

  it('delays a standalone loading indicator', () => {
    cy.clock();
    cy.mount(Spin, { props: { delay: 100, tip: 'Loading' } });
    cy.get('.sd-spin-icon').should('not.exist');
    cy.tick(100);
    cy.get('.sd-spin-icon').should('exist');
    cy.get('.sd-spin-tip').should('have.text', 'Loading');
  });

  it('does not flash when loading ends before the numeric delay', () => {
    cy.clock();
    cy.mount(Spin, {
      props: { loading: false, delay: 100 },
      slots: { default: () => 'Content' },
    });
    cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.setProps({ loading: true })));
    cy.tick(50);
    cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.setProps({ loading: false })));
    cy.tick(100);
    cy.get('.sd-spin-mask').should('not.exist');
  });

  it('hides immediately after a delayed loading mask becomes visible', () => {
    cy.clock();
    cy.mount(Spin, {
      props: { loading: true, delay: 100 },
      slots: { default: () => 'Content' },
    });
    cy.tick(100);
    cy.get('.sd-spin-mask').should('exist');
    cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.setProps({ loading: false })));
    cy.get('.sd-spin-mask').should('not.exist');
  });

  it('uses ConfigProvider spinProps and lets local props override them', () => {
    cy.mount(() =>
      h(ConfigProvider, { spinProps: { dot: true, tip: 'Global tip' } }, () =>
        h(Spin, { tip: 'Local tip' }),
      ),
    );
    cy.get('.sd-dot-loading').should('exist');
    cy.get('.sd-spin-tip').should('have.text', 'Local tip');
  });

  it('uses the ConfigProvider loading slot when no icon, element or dot is set', () => {
    cy.mount(() =>
      h(ConfigProvider, null, {
        loading: () => h('i', { class: 'global-loading' }),
        default: () => h(Spin),
      }),
    );
    cy.get('.sd-spin-icon .global-loading').should('exist');
  });

  it('prefers the dot prop over the ConfigProvider loading slot', () => {
    cy.mount(() =>
      h(ConfigProvider, null, {
        loading: () => h('i', { class: 'global-loading' }),
        default: () => h(Spin, { dot: true }),
      }),
    );
    cy.get('.sd-dot-loading').should('exist');
    cy.get('.global-loading').should('not.exist');
  });

  it('applies the size prop as font-size on the icon', () => {
    cy.mount(Spin, { props: { size: 40 } });
    cy.get('.sd-spin-icon').should('have.css', 'font-size', '40px');
  });

  it('hides the icon but keeps the tip when hideIcon is true', () => {
    cy.mount(Spin, { props: { hideIcon: true, tip: 'Loading' } });
    cy.get('.sd-spin-icon').should('not.exist');
    cy.get('.sd-spin-tip').should('have.text', 'Loading');
  });

  it('renders five dot items when dot is true', () => {
    cy.mount(Spin, { props: { dot: true } });
    cy.get('.sd-dot-loading').should('exist');
    cy.get('.sd-dot-loading-item').should('have.length', 5);
  });

  it('sizes dot loading from the size prop', () => {
    cy.mount(Spin, { props: { dot: true, size: 8 } });
    cy.get('.sd-dot-loading').should('have.css', 'width', '56px').and('have.css', 'height', '8px');
    cy.get('.sd-dot-loading-item').first().should('have.css', 'width', '8px');
  });

  it('renders the icon slot with spin applied and gives it precedence over element and dot', () => {
    cy.mount(Spin, {
      props: { dot: true },
      slots: { icon: () => h('i', { class: 'custom-icon' }) },
    });
    cy.get('.sd-spin-icon .custom-icon').should('exist');
    cy.get('.custom-icon').should('have.attr', 'spin', 'true');
    cy.get('.sd-dot-loading').should('not.exist');
  });

  it('renders the element slot when no icon slot is given', () => {
    cy.mount(Spin, {
      slots: { element: () => h('i', { class: 'custom-element' }) },
    });
    cy.get('.sd-spin-icon .custom-element').should('exist');
  });

  it('prefers the tip slot over the tip prop', () => {
    cy.mount(Spin, { props: { tip: 'Prop tip' }, slots: { tip: () => h('span', 'Slot tip') } });
    cy.get('.sd-spin-tip').should('have.text', 'Slot tip');
  });

  it('adds the with-tip class only outside container mode', () => {
    cy.mount(Spin, { props: { tip: 'Loading' } });
    cy.get('.sd-spin').should('have.class', 'sd-spin-with-tip');

    cy.mount(Spin, {
      props: { loading: true, tip: 'Loading' },
      slots: { default: () => 'Content' },
    });
    cy.get('.sd-spin').should('not.have.class', 'sd-spin-with-tip');
    // 容器模式下 tip 只随 loading 遮罩一起出现在 mask 内
    cy.get('.sd-spin-tip').should('contain', 'Loading');
  });

  it('renders content without a mask when not loading in container mode', () => {
    cy.mount(Spin, { props: { loading: false }, slots: { default: () => 'Content' } });
    cy.get('.sd-spin-mask').should('not.exist');
    cy.get('.sd-spin-icon').should('not.exist');
    cy.get('.sd-spin').should('not.have.class', 'sd-spin-loading');
    cy.get('.sd-spin').should('contain', 'Content');
  });

  it('shows and hides the container mask as loading toggles', () => {
    cy.mount(Spin, { props: { loading: false }, slots: { default: () => 'Content' } });
    cy.get('.sd-spin-mask').should('not.exist');
    cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.setProps({ loading: true })));
    cy.get('.sd-spin-mask').should('exist');
    cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.setProps({ loading: false })));
    cy.get('.sd-spin-mask').should('not.exist');
  });

  it('always shows the indicator in standalone mode regardless of loading', () => {
    cy.mount(Spin, { props: { loading: false } });
    cy.get('.sd-spin-icon').should('exist');
  });
});
