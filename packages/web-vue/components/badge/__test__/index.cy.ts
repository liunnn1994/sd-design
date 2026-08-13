import { configProviderInjectionKey } from '../../config-provider/context';
import Badge from '../index';

describe('Badge', () => {
  it('should have the sd-badge class', () => {
    cy.mount(Badge);
    cy.get('.sd-badge').should('exist');
  });

  it('count should render the number', () => {
    cy.mount(Badge, { props: { count: 10 } });
    cy.get('.sd-badge-number').should('contain.text', '10');
    cy.get('.sd-badge-number .sd-number-flow').should('have.class', 'sd-number-flow-animated');
  });

  it('can disable the count animation', () => {
    cy.mount(Badge, { props: { count: 10, animation: false } });
    cy.get('.sd-badge-number .sd-number-flow').should('not.have.class', 'sd-number-flow-animated');
  });

  it('maxCount should cap the display', () => {
    cy.mount(Badge, { props: { maxCount: 99, count: 1000 } });
    cy.get('.sd-badge-number').should('contain.text', '99+');
  });

  it('dot should only show when count > 0', () => {
    cy.mount(Badge, { props: { dot: true } });
    cy.get('.sd-badge-dot').should('not.exist');
    cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.setProps({ count: 1 })));
    cy.get('.sd-badge-dot').should('exist');
  });

  it('dot with count exposes the count via aria-label', () => {
    cy.mount(Badge, { props: { dot: true, count: 7 } });
    cy.get('.sd-badge-dot').should('have.attr', 'role', 'status');
    cy.get('.sd-badge-dot').should('have.attr', 'aria-label', '7');
  });

  it('status dot is aria-hidden (text conveys status)', () => {
    cy.mount(Badge, { props: { status: 'success', text: 'Done' } });
    cy.get('.sd-badge-status-dot').should('have.attr', 'aria-hidden', 'true');
  });

  it('can set custom text', () => {
    cy.mount(Badge, { props: { text: 'hello world' } });
    cy.get('.sd-badge-text').should('contain.text', 'hello world');
  });

  it('uses the rtl direction from ConfigProvider', () => {
    cy.mount(Badge, {
      global: {
        provide: {
          [configProviderInjectionKey as symbol]: {
            slots: {},
            rtl: true,
          },
        },
      },
    });

    cy.get('.sd-badge').should('have.class', 'sd-badge-rtl');
  });
});
