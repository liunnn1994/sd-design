import Textarea from '../index';

describe('Textarea readonly tip', () => {
  it('shows a tooltip when typing into a readonly textarea', () => {
    cy.mount(Textarea, { props: { readonly: true, modelValue: 'hello' } });
    cy.get('.sd-tooltip-content').should('not.exist');
    cy.get('textarea').trigger('keydown', { key: 'a' });
    cy.get('.sd-tooltip-content').should('be.visible').and('contain', '只读');
  });

  it('does not show a tooltip when the textarea is not readonly', () => {
    cy.mount(Textarea, { props: { modelValue: 'hello' } });
    cy.get('textarea').trigger('keydown', { key: 'a' });
    cy.get('.sd-tooltip-content').should('not.exist');
  });

  it('resets the hide timer and hides after the duration', () => {
    cy.mount(Textarea, { props: { readonly: true, modelValue: 'hello' } });
    cy.get('textarea').trigger('keydown', { key: 'a' });
    cy.get('.sd-tooltip-content').should('be.visible');

    // Wait just under the duration, then type again to reset the timer.
    cy.wait(1000);
    cy.get('textarea').trigger('keydown', { key: 'b' });

    // ~2600ms in: without the reset the tip would have hidden ~2200ms after
    // the first keystroke; it is still visible -> timer was reset.
    cy.wait(1600);
    cy.get('.sd-tooltip-content').should('be.visible');

    // Past the reset duration -> auto-hides.
    cy.wait(1000);
    cy.get('.sd-tooltip-content').should('not.be.visible');
  });
});
