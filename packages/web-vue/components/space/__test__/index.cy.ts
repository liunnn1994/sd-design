import Space from '../index';

const sizes = ['mini', 'small', 'medium', 'large'] as const;

describe('Space', () => {
  sizes.forEach((size) => {
    it(`renders with size ${size}`, () => {
      cy.mount(Space, {
        props: { size },
        slots: { default: ['<div>aaa</div>', '<div>bbb</div>'] },
      });
      cy.get('.sd-space').should('exist');
    });
  });
});
