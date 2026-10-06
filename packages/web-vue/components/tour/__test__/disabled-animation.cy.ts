import Tour from '../index';

describe('Tour disabled animation', () => {
  it('renders the popover at its final opacity when animations are disabled', () => {
    const renderedOpacity = cy.spy().as('renderedOpacity');
    cy.mount(Tour, {
      props: {
        defaultVisible: true,
        animate: false,
        steps: [{ element: '#static-tour-target', popover: { title: 'Static tour' } }],
        onPopoverRender: ({ wrapper }) => {
          renderedOpacity(wrapper && getComputedStyle(wrapper).opacity);
        },
      },
      slots: { default: '<button id="static-tour-target">Target</button>' },
    });
    cy.get('@renderedOpacity').should('have.been.calledWith', '1');
  });
});
