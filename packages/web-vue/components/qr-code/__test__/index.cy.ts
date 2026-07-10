import { h } from 'vue';

import QrCode from '../index';

const value = 'https://sd-design.js.org';

describe('QrCode', () => {
  it('renders svg markup when type is svg', () => {
    cy.mount(QrCode, { props: { value, type: 'svg' } });
    cy.get('.sd-qr-code-svg').should('exist');
  });

  it('renders the icon slot without an icon prop', () => {
    cy.mount(QrCode, {
      props: { value },
      slots: { icon: '<span class="custom-icon">QR</span>' },
    });
    cy.get('.sd-qr-code-icon .custom-icon').should('exist');
  });

  it('emits refresh when the expired action is clicked', () => {
    cy.mount(QrCode, { props: { value, status: 'expired' } });
    cy.get('.sd-qr-code-refresh-btn').click({ force: true });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('refresh')).to.have.length(1);
    });
  });

  it('supports a custom status render', () => {
    cy.mount(QrCode, {
      props: {
        value,
        status: 'scanned',
        statusRender: ({ status }: { status: string }) =>
          h('span', { class: 'custom-status' }, status),
      },
    });
    cy.get('.custom-status').should('have.text', 'scanned');
  });

  it('passes spinProps to the loading spin', () => {
    cy.mount(QrCode, {
      props: { value, status: 'loading', spinProps: { size: 10, dot: true } },
    });
    cy.get('.sd-spin-icon').invoke('attr', 'style').should('contain', 'font-size: 10px');
    cy.get('.sd-dot-loading').invoke('attr', 'style').should('contain', 'width: 70px');
  });

  it('renders nothing when value is empty', () => {
    cy.mount(QrCode, { props: { value: '' } });
    cy.get('.sd-qr-code').should('not.exist');
  });
});
