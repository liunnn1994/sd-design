import Divider from '../index';

describe('Divider', () => {
  it('applies the direction class reactively', () => {
    cy.mount(Divider, { props: { direction: 'horizontal' } });
    cy.get('.sd-divider-horizontal').should('exist');
    cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.setProps({ direction: 'vertical' })));
    cy.get('.sd-divider-vertical').should('exist');
  });

  it('renders the separator role on the root element', () => {
    cy.mount(Divider);
    cy.get('.sd-divider').should('have.attr', 'role', 'separator');
  });

  it('renders no text span and no with-text class without the default slot', () => {
    cy.mount(Divider);
    cy.get('.sd-divider').should('not.have.class', 'sd-divider-with-text');
    cy.get('.sd-divider-text').should('not.exist');
  });

  it('renders the default slot as the divider text for horizontal dividers', () => {
    cy.mount(Divider, { slots: { default: 'Label' } });
    cy.get('.sd-divider').should('have.class', 'sd-divider-with-text');
    cy.get('.sd-divider-text').should('contain.text', 'Label');
  });

  it('uses the center orientation by default', () => {
    cy.mount(Divider, { slots: { default: 'Label' } });
    cy.get('.sd-divider-text').should('have.class', 'sd-divider-text-center');
  });

  it("renders the left orientation class for orientation='left'", () => {
    cy.mount(Divider, { props: { orientation: 'left' }, slots: { default: 'Label' } });
    cy.get('.sd-divider-text').should('have.class', 'sd-divider-text-left');
    cy.get('.sd-divider-text').should('not.have.class', 'sd-divider-text-center');
  });

  it("renders the right orientation class for orientation='right'", () => {
    cy.mount(Divider, { props: { orientation: 'right' }, slots: { default: 'Label' } });
    cy.get('.sd-divider-text').should('have.class', 'sd-divider-text-right');
  });

  it('does not render text for vertical dividers even when the default slot is provided', () => {
    cy.mount(Divider, { props: { direction: 'vertical' }, slots: { default: 'Label' } });
    cy.get('.sd-divider-text').should('not.exist');
  });

  it('renders a solid border by default (horizontal)', () => {
    cy.mount(Divider);
    cy.get('.sd-divider').should('have.css', 'border-bottom-style', 'solid');
    cy.get('.sd-divider').should('have.css', 'border-bottom-width', '1px');
  });

  it('type sets the border style (horizontal)', () => {
    cy.mount(Divider, { props: { type: 'dashed' } });
    cy.get('.sd-divider').should('have.css', 'border-bottom-style', 'dashed');
  });

  it('type sets the border-left style for vertical dividers', () => {
    cy.mount(Divider, { props: { direction: 'vertical', type: 'dotted' } });
    cy.get('.sd-divider').should('have.css', 'border-left-style', 'dotted');
  });

  it('size sets the border width (horizontal)', () => {
    cy.mount(Divider, { props: { size: 3 } });
    cy.get('.sd-divider').should('have.css', 'border-bottom-width', '3px');
  });

  it('size sets the border-left width for vertical dividers', () => {
    cy.mount(Divider, { props: { direction: 'vertical', size: 3 } });
    cy.get('.sd-divider').should('have.css', 'border-left-width', '3px');
  });

  it('margin (number) renders symmetric top/bottom margins for horizontal dividers', () => {
    cy.mount(Divider, { props: { margin: 12 } });
    cy.get('.sd-divider').should('have.css', 'margin-top', '12px');
    cy.get('.sd-divider').should('have.css', 'margin-bottom', '12px');
    cy.get('.sd-divider').should('have.css', 'margin-left', '0px');
  });

  it('margin (number) renders left/right margins for vertical dividers', () => {
    cy.mount(Divider, { props: { direction: 'vertical', margin: 12 } });
    cy.get('.sd-divider').should('have.css', 'margin-left', '12px');
    cy.get('.sd-divider').should('have.css', 'margin-right', '12px');
    cy.get('.sd-divider').should('have.css', 'margin-top', '0px');
  });

  it('margin (string) is passed through as-is for horizontal dividers', () => {
    cy.mount(Divider, { props: { margin: '2em' } });
    // Computed CSS resolves em to px, so assert the inline style verbatim.
    cy.get('.sd-divider').should('have.attr', 'style').and('include', 'margin: 2em 0');
  });
});
