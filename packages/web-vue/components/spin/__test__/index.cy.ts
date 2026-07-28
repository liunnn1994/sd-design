import { h } from 'vue';

import ConfigProvider from '../../config-provider';
import Spin from '../index';

describe('Spin', () => {
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
});
