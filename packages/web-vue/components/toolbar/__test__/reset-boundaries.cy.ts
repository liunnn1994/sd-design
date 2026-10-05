import Toolbar, { type ToolbarInstance } from '../index';

describe('Toolbar reset boundaries', () => {
  it('restores nested initial values on every reset', () => {
    cy.mount(Toolbar, { props: { modelValue: { filter: { term: 'initial' } } } });
    cy.get('@vue').then(({ wrapper }) => {
      (wrapper.vm as unknown as ToolbarInstance).reset(false);
      const next = wrapper.emitted('update:modelValue')!.at(-1)![0] as { filter: { term: string } };
      next.filter.term = 'edited';
      return wrapper.setProps({ modelValue: next });
    });
    cy.get('@vue').then(({ wrapper }) => {
      (wrapper.vm as unknown as ToolbarInstance).reset(false);
      expect(wrapper.emitted('update:modelValue')!.at(-1)![0]).to.deep.equal({
        filter: { term: 'initial' },
      });
    });
  });

  for (const preserve of [false, true]) {
    it(`preserves an own __proto__ field when ${preserve ? 'skipped' : 'restored'}`, () => {
      cy.mount(Toolbar, {
        props: {
          modelValue: JSON.parse('{"__proto__":{"term":"initial"}}'),
          resetSkipKeys: preserve ? ['__proto__'] : [],
        },
      });
      cy.get('@vue').then(({ wrapper }) =>
        wrapper.setProps({ modelValue: JSON.parse('{"__proto__":{"term":"edited"}}') }),
      );
      cy.get('@vue').then(({ wrapper }) => {
        (wrapper.vm as unknown as ToolbarInstance).reset(false);
        const next = wrapper.emitted('update:modelValue')!.at(-1)![0] as Record<string, unknown>;
        expect(Object.hasOwn(next, '__proto__')).to.equal(true);
        expect(next.__proto__).to.deep.equal({ term: preserve ? 'edited' : 'initial' });
        expect(Object.getPrototypeOf(next)).to.equal(Object.prototype);
      });
    });
  }
});
