import FilePreviewer from '../index';

describe('FilePreviewer native to custom skin', () => {
  for (const type of ['video', 'audio'] as const) {
    it(`registers the ${type} player when enabling its skin after initial native rendering`, () => {
      cy.then(() => {
        expect(customElements.get(`${type}-player`)).to.equal(undefined);
      });
      cy.mount(FilePreviewer, {
        props: { type, fullscreen: false, mediaProps: { skin: 'native' } },
      });
      cy.get(type).should('have.attr', 'controls');
      cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ mediaProps: { skin: 'minimal' } }));
      cy.get(`${type}-minimal-skin`).should(($skin) => {
        expect($skin[0].shadowRoot).not.to.equal(null);
        expect($skin[0].shadowRoot?.querySelector('media-play-button')).not.to.equal(null);
      });
      cy.get(`${type}-player`).should(($player) => {
        expect('store' in $player[0]).to.equal(true);
      });
      cy.wrap(null).should(() => {
        expect(customElements.get(`${type}-player`)).to.be.a('function');
      });
      cy.get('.sd-file-previewer-loading').should('not.exist');
      cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ mediaProps: { skin: 'native' } }));
      cy.get(`${type}-player`).should('not.exist');
      cy.get(type).should('have.attr', 'controls');
    });
  }
});
