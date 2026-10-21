import { defineComponent, h, ref } from 'vue';

import SelectView from '../../_components/select-view/select-view.vue';
import ExpandTransition from '../../_components/transition/expand-transition.vue';

describe('Native transition and select focus foundations', () => {
  it('runs the actual shared transition and clears height after entry and removal', () => {
    cy.mount(
      defineComponent({
        setup() {
          const show = ref(false);
          return () =>
            h('div', [
              h(
                'button',
                {
                  id: 'native-expand-toggle',
                  onClick: () => {
                    show.value = !show.value;
                  },
                },
                'Toggle',
              ),
              h(ExpandTransition, null, () =>
                show.value
                  ? h(
                      'div',
                      {
                        id: 'native-expand-body',
                        style: { transition: 'height .08s linear', overflow: 'hidden' },
                      },
                      h('div', { style: { height: '60px' } }, 'Native content'),
                    )
                  : null,
              ),
            ]);
        },
      }),
      { global: { stubs: { transition: false } } },
    );
    cy.get('#native-expand-toggle').click();
    cy.get('#native-expand-body').should((element) => {
      expect(element[0].style.height).to.equal('');
      expect(element[0].getBoundingClientRect().height).to.equal(60);
    });
    cy.get('#native-expand-toggle').click();
    cy.get('#native-expand-body').should('not.exist');
    cy.get('#native-expand-toggle').click();
    cy.get('#native-expand-body').should((element) => expect(element[0].style.height).to.equal(''));
  });

  it('blurs the active select input on close and preserves another input focus', () => {
    cy.mount(
      defineComponent({
        setup() {
          const opened = ref(true),
            blurs = ref(0);
          return () =>
            h('div', [
              h(SelectView, {
                modelValue: [],
                inputValue: '',
                allowSearch: true,
                opened: opened.value,
                onBlur: () => {
                  blurs.value++;
                },
              }),
              h('input', { id: 'other-native-input' }),
              h(
                'button',
                {
                  id: 'native-select-open',
                  onClick: () => {
                    opened.value = true;
                  },
                },
                'Open',
              ),
              h(
                'button',
                {
                  id: 'native-select-close',
                  onClick: () => {
                    opened.value = false;
                  },
                },
                'Close',
              ),
              h('output', { id: 'native-select-blurs' }, String(blurs.value)),
            ]);
        },
      }),
    );
    cy.get('.sd-select-view input').focus();
    cy.get('#native-select-close').then((button) => button[0].click());
    cy.get('.sd-select-view input').should('not.have.focus');
    cy.get('#native-select-blurs').should('have.text', '1');
    cy.get('#native-select-open').then((button) => button[0].click());
    cy.get('.sd-select-view input').focus();
    cy.get('#other-native-input').focus();
    cy.get('#native-select-blurs').should('have.text', '2');
    cy.get('#native-select-close').then((button) => button[0].click());
    cy.get('#other-native-input').should('have.focus');
    cy.get('#native-select-blurs').should('have.text', '2');
  });
});
