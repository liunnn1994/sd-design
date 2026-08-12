import { defineComponent, h, ref } from 'vue';

import Space from '../index';

const sizes = ['mini', 'small', 'medium', 'large'] as const;

describe('Space', () => {
  it('preserves slotted element identity across updates', () => {
    const TestComponent = defineComponent({
      setup() {
        const value = ref('');

        return () =>
          h(Space, null, {
            default: () => [
              h('input', {
                class: 'space-test-input',
                value: value.value,
                onInput: (event: Event) => {
                  value.value = (event.target as HTMLInputElement).value;
                },
              }),
              h('span', value.value),
            ],
          });
      },
    });

    cy.mount(TestComponent);
    cy.get('.space-test-input').then(($input) => {
      const input = $input[0];
      cy.wrap(input).type('a');
      cy.focused().should(($focused) => {
        expect($focused[0]).to.equal(input);
        expect(input.isConnected).to.equal(true);
      });
    });
  });

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
