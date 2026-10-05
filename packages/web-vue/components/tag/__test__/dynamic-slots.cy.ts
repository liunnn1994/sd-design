import { defineComponent, h, ref } from 'vue';

import Tag from '../index';

describe('Tag dynamic slots and keyboard', () => {
  it('enables ellipsis when the default slot is added after mounting', () => {
    const show = ref(false);
    cy.mount(
      defineComponent({
        setup: () => () => h(Tag, null, show.value ? { default: () => 'Added' } : {}),
      }),
    );
    cy.get('.sd-tag')
      .should('have.class', 'sd-tag-no-ellipsis')
      .then(() => {
        show.value = true;
      });
    cy.get('.sd-tag').should('have.class', 'sd-tag-ellipsis');
    cy.get('.sd-tag-text.sd-ellipsis')
      .should('contain.text', 'Added')
      .then(() => {
        show.value = false;
      });
    cy.get('.sd-tag').should('have.class', 'sd-tag-no-ellipsis');
    cy.get('.sd-tag-text').should('not.exist');
  });

  for (const performant of [false, true]) {
    it(`updates a dynamically added tooltip slot with performant=${performant}`, () => {
      const show = ref(false);
      cy.mount(
        defineComponent({
          setup: () => () =>
            h(
              Tag,
              {
                ellipsisPerformant: performant,
                ellipsisTooltip: { mouseEnterDelay: 0, mouseLeaveDelay: 0 },
              },
              { default: () => 'Short', ...(show.value ? { tooltip: () => 'Added tip' } : {}) },
            ),
        }),
      );
      cy.get('.sd-tag-text').then(() => {
        show.value = true;
      });
      cy.get('.sd-tag-text').trigger('mouseenter');
      cy.get('[role=tooltip]').should('be.visible').and('contain.text', 'Added tip');
    });
  }

  it('does not cancel the Tab key on the close button', () => {
    cy.mount(Tag, { props: { closable: true, checkable: true }, slots: { default: 'Tag' } });
    cy.get('.sd-tag-close-btn').then(($button) => {
      const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
      $button[0].dispatchEvent(event);
      expect(event.defaultPrevented).to.equal(false);
    });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('close')).to.equal(undefined);
      expect(wrapper.emitted('check')).to.equal(undefined);
    });
  });
});
