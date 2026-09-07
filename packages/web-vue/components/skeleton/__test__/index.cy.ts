import Skeleton, { SkeletonLine, SkeletonShape } from '../index';

describe('Skeleton', () => {
  it('sets aria-busy while loading', () => {
    cy.mount(Skeleton, {
      props: { loading: true },
      slots: { default: '<div>placeholder</div>' },
    });
    cy.get('.sd-skeleton').should('have.attr', 'aria-busy', 'true');
  });

  it('clears aria-busy when not loading', () => {
    cy.mount(Skeleton, {
      props: { loading: false },
      slots: { content: '<div>real content</div>' },
    });
    cy.get('.sd-skeleton').should('not.have.attr', 'aria-busy');
  });

  it('renders the default slot while loading and the content slot afterwards', () => {
    cy.mount(Skeleton, {
      props: { loading: true },
      slots: {
        default: '<div class="placeholder">placeholder</div>',
        content: '<div class="real">real</div>',
      },
    });
    cy.get('.sd-skeleton').should('contain.text', 'placeholder');
    cy.get('.real').should('not.exist');

    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ loading: false }));
    cy.get('.sd-skeleton').should('contain.text', 'real');
    cy.get('.placeholder').should('not.exist');
  });

  it('applies the animation class when animation is enabled', () => {
    cy.mount(Skeleton, {
      props: { animation: true, loading: true },
      slots: { default: '<div>placeholder</div>' },
    });
    cy.get('.sd-skeleton').should('have.class', 'sd-skeleton-animation');

    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ animation: false }));
    cy.get('.sd-skeleton').should('not.have.class', 'sd-skeleton-animation');
  });

  it('SkeletonLine renders rows with width, height and spacing styles', () => {
    cy.mount(SkeletonLine, {
      props: {
        rows: 3,
        widths: [100, '60%'],
        lineHeight: 30,
        lineSpacing: 10,
      },
    });

    cy.get('.sd-skeleton-line').should('have.length', 3);
    cy.get('.sd-skeleton-line-row').should('have.length', 3);
    cy.get('.sd-skeleton-line-row')
      .eq(0)
      .should('have.attr', 'style')
      .and('contain', 'width: 100px')
      .and('contain', 'height: 30px')
      .and('not.contain', 'margin-top');
    cy.get('.sd-skeleton-line-row')
      .eq(1)
      .should('have.attr', 'style')
      .and('contain', 'width: 60%')
      .and('contain', 'height: 30px')
      .and('contain', 'margin-top: 10px');
    cy.get('.sd-skeleton-line-row')
      .eq(2)
      .should('have.attr', 'style')
      .and('not.contain', 'width')
      .and('contain', 'height: 30px')
      .and('contain', 'margin-top: 10px');
  });

  it('SkeletonShape renders shape and size classes', () => {
    cy.mount(SkeletonShape, {
      props: { shape: 'circle', size: 'large' },
    });
    cy.get('.sd-skeleton-shape')
      .should('have.class', 'sd-skeleton-shape-circle')
      .and('have.class', 'sd-skeleton-shape-large');

    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ shape: 'square', size: 'small' }));
    cy.get('.sd-skeleton-shape')
      .should('have.class', 'sd-skeleton-shape-square')
      .and('have.class', 'sd-skeleton-shape-small')
      .and('not.have.class', 'sd-skeleton-shape-circle');
  });
});
