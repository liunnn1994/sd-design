import Sender, { type SenderInstance } from '../index';

describe('Sender locked slot content', () => {
  for (const state of ['readonly', 'disabled'] as const) {
    it(`does not insert a line break after becoming ${state}`, () => {
      cy.mount(Sender, {
        props: {
          submitType: 'shiftEnter',
          slotConfig: [{ type: 'text', value: 'Keep this content' }],
        },
      });

      cy.get('@vue').then(({ wrapper }) => {
        (wrapper.vm as unknown as SenderInstance).focus({ cursor: 'end' });
      });
      cy.get('.sd-rich-text-editor-content').should('be.focused');
      cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ [state]: true }));
      cy.get('.sd-rich-text-editor-content').trigger('keydown', { key: 'Enter' });
      cy.get('@vue').then(({ wrapper }) => {
        expect((wrapper.vm as unknown as SenderInstance).getValue().value).to.equal(
          'Keep this content',
        );
      });
    });
  }
});
