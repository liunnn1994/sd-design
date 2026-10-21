import Tag from '../index';

describe('Tag foundation adapter', () => {
  it('retains requested fallback when controlled checked and visible bindings are released', () => {
    cy.mount(Tag, {
      props: { checkable: true, checked: false, visible: true, closable: true },
      slots: { default: 'Shared tag' },
    });
    cy.get('.sd-tag').click().should('have.attr', 'aria-pressed', 'false');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ checked: undefined }));
    cy.get('.sd-tag')
      .should('have.attr', 'aria-pressed', 'true')
      .trigger('keydown', { key: ' ' })
      .should('have.attr', 'aria-pressed', 'false');
    cy.get('.sd-tag-close-btn').click();
    cy.get('.sd-tag').should('exist');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('update:checked')).to.deep.equal([[true], [false]]);
      expect(wrapper.emitted('update:visible')).to.deep.equal([[false]]);
      expect(wrapper.emitted('close')).to.have.length(1);
    });
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ visible: undefined }));
    cy.get('.sd-tag').should('not.exist');
  });

  it('invalidates color and alpha caches across custom, built-in and gradient changes', () => {
    cy.mount(Tag, {
      props: { color: 'rgba(10, 20, 30, 0.25)', bordered: false },
      slots: { default: 'Color' },
    });
    cy.get('.sd-tag').should('have.css', 'background-color', 'rgba(10, 20, 30, 0.25)');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ backgroundAlpha: 0 }));
    cy.get('.sd-tag').should('have.css', 'background-color', 'rgba(10, 20, 30, 0)');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ color: 'red' }));
    cy.get('.sd-tag')
      .should('have.class', 'sd-tag-red')
      .should(($tag) => {
        expect(($tag[0] as HTMLElement).style.getPropertyValue('--sd-tag-bg-color')).to.equal('');
      });
    cy.get('@vue').then(({ wrapper }) =>
      wrapper.setProps({ color: 'linear-gradient(90deg, #000000, #ffffff)', bordered: undefined }),
    );
    cy.get('.sd-tag').should('have.css', 'background-color', 'rgb(128, 128, 128)');
  });
});
