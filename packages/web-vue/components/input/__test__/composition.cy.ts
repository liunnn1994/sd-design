import Input from '../index';

describe('Input composition lifecycle', () => {
  it('uses the accepted value for pasted input events', () => {
    cy.mount(Input, { props: { maxLength: 2 } });
    cy.get('input')
      .focus()
      .invoke('val', '中文好')
      .trigger('input', { inputType: 'insertFromPaste' });
    cy.get('input').should('have.value', '中文');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('update:modelValue')![0]).to.deep.equal(['中文']);
      expect(wrapper.emitted('input')![0][0]).to.equal('中文');
    });
  });

  it('defers model updates and Enter until composition ends', () => {
    cy.mount(Input);
    cy.get('input').focus().trigger('compositionstart', { data: '' });
    cy.get('input').invoke('val', '中').trigger('input', { inputType: 'insertCompositionText' });
    cy.get('input').trigger('keydown', { key: 'Enter', isComposing: true });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('update:modelValue')).to.equal(undefined);
      expect(wrapper.emitted('pressEnter')).to.equal(undefined);
    });
    cy.get('input').trigger('compositionend', { data: '中' });
    cy.get('input').should('have.value', '中').type('{enter}');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('update:modelValue')![0]).to.deep.equal(['中']);
      expect(wrapper.emitted('pressEnter')).to.have.length(1);
      expect(wrapper.emitted('change')![0][0]).to.equal('中');
    });
  });

  it('truncates composed text by grapheme and keeps the input payload consistent', () => {
    cy.mount(Input, { props: { maxLength: 2 } });
    cy.get('input').focus().trigger('compositionstart', { data: '' });
    cy.get('input')
      .invoke('val', '中文好')
      .trigger('input', { inputType: 'insertCompositionText' });
    cy.get('input').trigger('compositionend', { data: '中文好' });
    cy.get('input').should('have.value', '中文');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('update:modelValue')![0]).to.deep.equal(['中文']);
      expect(wrapper.emitted('input')![0][0]).to.equal('中文');
    });
  });
});
