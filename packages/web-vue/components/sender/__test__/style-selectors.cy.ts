import Sender from '../index';

describe('Sender action button styles', () => {
  it('applies the primary color token to the cancel text button', () => {
    cy.mount(Sender, { props: { loading: true } });
    cy.get('.sd-sender').invoke('css', '--component-sender-color-primary', 'rgb(12, 34, 56)');
    cy.get('.sd-sender-actions-btn.sd-btn-text')
      .invoke('css', 'transition', 'none')
      .should('have.css', 'color', 'rgb(12, 34, 56)');
  });

  it('keeps the disabled speech text button transparent with the disabled color token', () => {
    cy.mount(Sender, { props: { allowSpeech: true, disabled: true, voiceGlow: false } });
    cy.get('.sd-sender').invoke(
      'css',
      '--component-sender-color-bg-actions-disabled',
      'rgb(78, 90, 12)',
    );
    cy.get('.sd-sender-actions-btn-disabled.sd-btn-text')
      .invoke('css', 'transition', 'none')
      .should('have.css', 'color', 'rgb(78, 90, 12)')
      .and('have.css', 'background-color', 'rgba(0, 0, 0, 0)');
  });

  it('applies the disabled background token to the empty send button', () => {
    cy.mount(Sender);
    cy.get('.sd-sender').invoke(
      'css',
      '--component-sender-color-bg-actions-disabled',
      'rgb(78, 90, 12)',
    );
    cy.get('.sd-sender-actions-btn-disabled:not(.sd-btn-text)')
      .invoke('css', 'transition', 'none')
      .should('have.css', 'color', 'rgb(255, 255, 255)')
      .and('have.css', 'background-color', 'rgb(78, 90, 12)');
  });
});
