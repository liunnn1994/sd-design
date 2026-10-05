import type { TourExpose, TourStep } from '../types';

import Tour from '../index';

const steps: TourStep[] = [
  { element: '#tour-target', popover: { title: 'First' } },
  { element: '#tour-target', popover: { title: 'Second' } },
];
const slots = { default: '<button id="tour-target">Target</button>' };

describe('Tour robustness', () => {
  it('respects allowClose when Escape is pressed', () => {
    cy.mount(Tour, { props: { defaultVisible: true, steps, allowClose: false }, slots });
    cy.get('.sd-tour-popover-title').should('have.text', 'First');
    cy.get('body').trigger('keydown', { key: 'Escape' });
    cy.get('.sd-tour-popover-title').should('have.text', 'First');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('close')).to.equal(undefined);
    });
  });

  it('deselects the previous step when both steps use the same element', () => {
    const onDeselected = cy.spy().as('onDeselected');
    cy.mount(Tour, { props: { defaultVisible: true, steps, onDeselected }, slots });
    cy.get('.sd-tour-popover-next-btn').click();
    cy.get('.sd-tour-popover-title').should('have.text', 'Second');
    cy.get('@onDeselected').should('have.been.calledOnce');
    cy.get('@onDeselected').then((spy) => {
      expect(spy.firstCall.args[1]).to.deep.equal(steps[0]);
    });
  });

  it('does not reapply element state after a start hook destroys the tour', () => {
    cy.mount(Tour, {
      props: {
        steps,
        onHighlightStarted: (_element, _step, { controller }) => controller.destroy(),
      },
      slots,
    });
    cy.get('@vue').then(({ wrapper }) => (wrapper.vm as unknown as TourExpose).drive());
    cy.get('#tour-target')
      .should('not.have.class', 'sd-tour-active-element')
      .and('not.have.attr', 'aria-expanded');
    cy.get('.sd-tour-popover').should('not.exist');
  });

  it('does not render a popover callback after a highlighted hook destroys the tour', () => {
    const onPopoverRender = cy.spy().as('onPopoverRender');
    cy.mount(Tour, {
      props: {
        steps,
        onPopoverRender,
        onHighlighted: (_element, _step, { controller }) => controller.destroy(),
      },
      slots,
    });
    cy.get('@vue').then(({ wrapper }) => (wrapper.vm as unknown as TourExpose).drive());
    cy.get('@onPopoverRender').should('not.have.been.called');
    cy.get('.sd-tour-popover').should('not.exist');
  });

  it('restores the target original aria attributes and tour z-index value on destroy', () => {
    cy.mount(Tour, {
      props: { defaultVisible: true, steps },
      slots: {
        default:
          '<button id="tour-target" aria-haspopup="menu" aria-expanded="false" aria-controls="original-menu" style="--sd-tour-active-z-index: 12 !important">Target</button>',
      },
    });
    cy.get('.sd-tour-popover-title').should('have.text', 'First');
    cy.get('@vue').then(({ wrapper }) => (wrapper.vm as unknown as TourExpose).destroy());
    cy.get('#tour-target').should('have.attr', 'aria-haspopup', 'menu');
    cy.get('#tour-target').should('have.attr', 'aria-expanded', 'false');
    cy.get('#tour-target').should('have.attr', 'aria-controls', 'original-menu');
    cy.get('#tour-target').should(($target) => {
      expect($target[0].style.getPropertyValue('--sd-tour-active-z-index')).to.equal('12');
      expect($target[0].style.getPropertyPriority('--sd-tour-active-z-index')).to.equal(
        'important',
      );
    });
  });
});
