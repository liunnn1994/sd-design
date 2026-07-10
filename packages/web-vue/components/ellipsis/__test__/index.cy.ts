import Ellipsis, { PerformantEllipsis } from '../index';

const overflowing =
  'A design is a plan or specification for the construction of an object or system.';

describe('Ellipsis', () => {
  it('renders single-line ellipsis style', () => {
    cy.mount(Ellipsis, {
      attrs: { style: 'max-width: 120px;' },
      slots: { default: 'ellipsis content' },
    });
    cy.get('.sd-ellipsis')
      .should('have.class', 'sd-ellipsis--single-line')
      .and('have.attr', 'style')
      .and('contain', 'text-overflow: ellipsis');
  });

  it('supports lineClamp', () => {
    cy.mount(Ellipsis, {
      props: { lineClamp: 2 },
      slots: { default: overflowing.repeat(2) },
    });
    cy.get('.sd-ellipsis')
      .should('have.class', 'sd-ellipsis--line-clamp')
      .invoke('attr', 'style')
      .should('contain', '-webkit-line-clamp: 2');
  });

  it('falls back to native title when tooltip is disabled', () => {
    cy.mount(Ellipsis, {
      props: { tooltip: false },
      attrs: { style: 'max-width: 80px;' },
      slots: { default: overflowing },
    });
    cy.get('.sd-ellipsis').should('have.attr', 'title', overflowing);
  });

  it('activates performant ellipsis after mouseenter', () => {
    cy.mount(PerformantEllipsis, {
      props: { tooltip: false },
      attrs: { style: 'max-width: 80px;' },
      slots: { default: 'performant ellipsis content' },
    });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.findComponent({ name: 'Ellipsis' }).exists()).to.equal(false);
    });
    cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.trigger('mouseenter')));
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.findComponent({ name: 'Ellipsis' }).exists()).to.equal(true);
    });
  });
});
