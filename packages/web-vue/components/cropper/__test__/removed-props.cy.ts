import Cropper from '../index';

describe('Cropper removed child configuration', () => {
  const cases = [
    ['canvasProps', 'cropper-canvas', 'disabled', true],
    ['imageProps', 'cropper-image', 'rotatable', false],
    ['selectionProps', 'cropper-selection', 'movable', false],
  ] as const;

  for (const [prop, selector, attribute, value] of cases) {
    it(`restores ${selector} ${attribute} when the override is removed`, () => {
      let original: string | null;
      cy.mount(Cropper, { props: { fitSelectionToImage: false, width: 400, height: 300 } });
      cy.get(selector).then(($element) => {
        original = $element[0].getAttribute(attribute);
      });
      cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ [prop]: { [attribute]: value } }));
      cy.get(selector).should(($element) => {
        expect($element[0].hasAttribute(attribute)).to.equal(value);
      });
      cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ [prop]: {} }));
      cy.get(selector).should(($element) => {
        expect($element[0].getAttribute(attribute)).to.equal(original);
      });
    });
  }
});
