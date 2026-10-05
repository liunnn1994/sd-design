import { defineComponent, h, ref } from 'vue';

import Steps, { Step } from '../index';

describe('Steps dynamic order', () => {
  it('updates step numbers after keyed children are reordered', () => {
    const order = ref(['a', 'b', 'c']);
    const change = cy.spy().as('change');
    cy.mount(
      defineComponent({
        setup: () => () =>
          h(Steps, { changeable: true, onChange: change }, () =>
            order.value.map((key) => h(Step, { key, title: key })),
          ),
      }),
    );
    cy.get('.sd-steps-icon').should(($icons) => {
      expect([...$icons].map((icon) => icon.textContent)).to.deep.equal(['1', '2', '3']);
    });
    cy.then(() => {
      order.value = ['c', 'a', 'b'];
    });
    cy.get('.sd-steps-item').first().click();
    cy.get('@change').should('have.been.calledOnceWith', 1);
    cy.get('.sd-steps-item').first().should('have.attr', 'aria-current', 'step');
  });

  it('does not count steps belonging to a nested Steps component', () => {
    cy.mount(() =>
      h(Steps, null, () => [
        h(
          Step,
          { title: 'outer-one' },
          { description: () => h(Steps, null, () => [h(Step, { title: 'inner' })]) },
        ),
        h(Step, { title: 'outer-two' }),
      ]),
    );
    cy.get('.sd-steps > .sd-steps-item').last().find('.sd-steps-icon').should('have.text', '2');
  });
});
