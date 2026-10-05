import { nextTick } from 'vue';

import Split from '../index';

describe('Split drag lifecycle', () => {
  it('does not start a drag after being unmounted by moveStart', () => {
    let unmount: () => void;
    let previousCursor: string;
    cy.get('body').then(($body) => {
      previousCursor = getComputedStyle($body[0]).cursor;
    });
    const onMoveStart = cy.spy(() => unmount()).as('onMoveStart');
    cy.mount(Split, { props: { onMoveStart } });
    cy.get('@vue').then(async ({ wrapper }) => {
      unmount = () => wrapper.unmount();
      wrapper
        .find('[role="separator"]')
        .element.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      await nextTick();
      await nextTick();
    });
    cy.get('@onMoveStart').should('have.been.calledOnce');
    cy.get('body').should(($body) => {
      expect(getComputedStyle($body[0]).cursor).to.equal(previousCursor);
    });
  });
});
