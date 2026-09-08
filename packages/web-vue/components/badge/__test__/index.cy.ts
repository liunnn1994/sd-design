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

  it('count = 0 renders neither number nor dot', () => {
    cy.mount(Badge, { props: { count: 0 } });
    cy.get('.sd-badge-number').should('not.exist');
    cy.get('.sd-badge-dot').should('not.exist');
  });

  it('count equal to maxCount shows the plain number without the + suffix', () => {
    cy.mount(Badge, { props: { count: 99, maxCount: 99 } });
    cy.get('.sd-badge-number').should('contain.text', '99');
    cy.get('.sd-badge-number').should('not.contain.text', '+');
  });

  it('custom color renders as an inline backgroundColor on the dot', () => {
    cy.mount(Badge, { props: { color: '#722ed1', count: 5 } });
    cy.get('.sd-badge-dot').should('exist');
    cy.get('.sd-badge-dot').should('have.css', 'background-color', 'rgb(114, 46, 209)');
  });

  it('preset color adds the color modifier class to the dot', () => {
    cy.mount(Badge, { props: { color: 'green', count: 5 } });
    cy.get('.sd-badge-dot').should('have.class', 'sd-badge-color-green');
    cy.get('.sd-badge-dot').should('not.have.attr', 'style');
  });

  it('color with count renders the dot instead of the number', () => {
    cy.mount(Badge, { props: { color: 'red', count: 5 } });
    cy.get('.sd-badge-dot').should('exist');
    cy.get('.sd-badge-number').should('not.exist');
  });

  it('status adds the wrapper, status modifier and status text', () => {
    cy.mount(Badge, { props: { status: 'processing', text: 'Running' } });
    cy.get('.sd-badge').should('have.class', 'sd-badge-status');
    cy.get('.sd-badge-status-dot').should('have.class', 'sd-badge-status-processing');
    cy.get('.sd-badge-status-text').should('contain.text', 'Running');
  });

  it('status with count renders the status dot and the count number', () => {
    cy.mount(Badge, { props: { status: 'danger', text: 'Error', count: 12 } });
    cy.get('.sd-badge-status-dot').should('exist');
    cy.get('.sd-badge-status-text').should('contain.text', 'Error');
    cy.get('.sd-badge-number').should('contain.text', '12');
  });

  it('negative count renders nothing like zero', () => {
    cy.mount(Badge, { props: { count: -5 } });
    cy.get('.sd-badge-number').should('not.exist');
    cy.get('.sd-badge-dot').should('not.exist');

    cy.mount(Badge, { props: { dot: true, count: -5 } });
    cy.get('.sd-badge-dot').should('not.exist');
  });

  it('dotStyle is applied to the dot', () => {
    cy.mount(Badge, { props: { dot: true, count: 1, dotStyle: { borderRadius: '3px' } } });
    cy.get('.sd-badge-dot').should('have.css', 'border-radius', '3px');
  });

  it('offset shifts the dot via negative margin-right and margin-top', () => {
    cy.mount(Badge, { props: { dot: true, count: 1, offset: [10, 20] } });
    cy.get('.sd-badge-dot').should('have.css', 'margin-right', '-10px');
    cy.get('.sd-badge-dot').should('have.css', 'margin-top', '20px');
  });

  it('offset mirrors the horizontal shift under rtl', () => {
    cy.mount(Badge, {
      props: { dot: true, count: 1, offset: [10, 20] },
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
    cy.get('.sd-badge-dot').should('have.css', 'margin-left', '-10px');
    cy.get('.sd-badge-dot').should('have.css', 'margin-right', '0px');
    cy.get('.sd-badge-dot').should('have.css', 'margin-top', '20px');
  });

  it('offset applies to the number badge too', () => {
    cy.mount(Badge, { props: { count: 5, offset: [10, 20] } });
    cy.get('.sd-badge-number').should('have.css', 'margin-right', '-10px');
    cy.get('.sd-badge-number').should('have.css', 'margin-top', '20px');
  });

  it('content slot renders a custom dot with the slot content', () => {
    cy.mount(Badge, {
      props: { count: 1 },
      slots: { content: '<span class="my-avatar">A</span>' },
    });
    cy.get('.sd-badge-custom-dot').should('exist');
    cy.get('.sd-badge-custom-dot .my-avatar').should('contain.text', 'A');
    cy.get('.sd-badge-dot').should('not.exist');
  });

  it('content slot takes precedence over the text prop', () => {
    cy.mount(Badge, {
      props: { text: 'hello' },
      slots: { content: '<span class="my-avatar">A</span>' },
    });
    cy.get('.sd-badge-custom-dot').should('exist');
    cy.get('.sd-badge-text').should('not.exist');
  });

  it('dotStyle and offset apply to the custom dot', () => {
    cy.mount(Badge, {
      props: { dotStyle: { borderRadius: '2px' }, offset: [4, 6] },
      slots: { content: '<span class="my-avatar">A</span>' },
    });
    cy.get('.sd-badge-custom-dot').should('have.css', 'border-radius', '2px');
    cy.get('.sd-badge-custom-dot').should('have.css', 'margin-right', '-4px');
    cy.get('.sd-badge-custom-dot').should('have.css', 'margin-top', '6px');
  });
});
