import { defineComponent, h, nextTick, ref } from 'vue';

import { LineClamp, RichLineClamp } from '../index';

describe('Clamp adapter', () => {
  for (const component of [LineClamp, RichLineClamp]) {
    it(`${component.name} preserves imperative controls and reactive attrs`, () => {
      cy.mount(component, {
        props: {
          [component === LineClamp ? 'text' : 'html']: 'Long text '.repeat(30),
          maxLines: 1,
        },
        attrs: { 'style': 'width:120px', 'data-testid': 'clamp' },
      });
      cy.get('@vue').then(async ({ wrapper }) => {
        expect(wrapper.vm.clamped).to.equal(true);
        wrapper.vm.expand();
        await nextTick();
        expect(wrapper.vm.expanded).to.equal(true);
        wrapper.vm.collapse();
        await nextTick();
        expect(wrapper.vm.expanded).to.equal(false);
        await wrapper.setProps({ expanded: true });
        await wrapper.setProps({ expanded: false });
        await wrapper.setProps({ 'data-testid': 'updated-clamp' });
      });
      cy.get('[data-testid="updated-clamp"]').should('have.attr', 'data-part', 'root');
    });
  }

  it('replaces filtered affix slots and recomputes after remount', () => {
    const affix = ref(false);
    const visible = ref(true);
    cy.mount(
      defineComponent({
        setup: () => () =>
          visible.value
            ? h(
                LineClamp,
                { text: 'Long text '.repeat(30), maxLines: 2, style: 'width:160px' },
                {
                  after: () => (affix.value ? h('button', 'More') : null),
                },
              )
            : null,
      }),
    );
    cy.get('[data-part="content"]').should('have.css', '-webkit-line-clamp', '2');
    cy.then(() => {
      affix.value = true;
    });
    cy.get('[data-part="after"]').should('have.text', 'More');
    cy.get('[data-part="body"] > span:last-child').should('contain.text', '…');
    cy.then(() => {
      visible.value = false;
    });
    cy.get('[data-part="root"]').should('not.exist');
    cy.then(() => {
      visible.value = true;
    });
    cy.get('[data-part="body"] > span:last-child').should('contain.text', '…');
    cy.then(() => {
      affix.value = false;
    });
    cy.get('[data-part="after"]').should('not.exist');
    cy.get('[data-part="content"]').should('have.css', '-webkit-line-clamp', '2');
  });
});
