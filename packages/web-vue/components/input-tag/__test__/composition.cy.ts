import InputTag from '../index';

describe('InputTag composition', () => {
  it('defers draft updates and tag creation until composition ends', () => {
    cy.mount(InputTag, { props: { defaultValue: ['existing'] } });
    cy.get('input').focus().trigger('compositionstart');
    cy.get('input').invoke('val', '中文').trigger('input');
    cy.get('input').trigger('keydown', { key: 'Enter', isComposing: true });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('update:inputValue')).to.equal(undefined);
      expect(wrapper.emitted('update:modelValue')).to.equal(undefined);
    });
    cy.get('input').trigger('compositionend', { data: '中文' });
    cy.get('input').should('have.value', '中文').type('{enter}');
    cy.get('.sd-input-tag-tag').should('have.length', 2);
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('update:modelValue')).to.deep.equal([[['existing', '中文']]]);
      expect(wrapper.emitted('pressEnter')).to.have.length(1);
    });
  });

  it('does not remove tags with Backspace during composition', () => {
    cy.mount(InputTag, { props: { defaultValue: ['keep'] } });
    cy.get('input').focus().trigger('compositionstart');
    cy.get('input').trigger('keydown', { key: 'Backspace', isComposing: true });
    cy.get('.sd-input-tag-tag').should('have.length', 1);
    cy.get('@vue').should(({ wrapper }) => expect(wrapper.emitted('remove')).to.equal(undefined));
    cy.get('input').trigger('compositionend', { data: '' });
    cy.get('input').type('{backspace}');
    cy.get('.sd-input-tag-tag').should('not.exist');
  });
});
