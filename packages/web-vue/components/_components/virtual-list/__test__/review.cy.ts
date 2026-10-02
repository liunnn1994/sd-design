import { Virtualizer } from 'virtua/vue';

import VirtualList from '../virtual-list.vue';

it('does not report reaching the bottom when scrolling ends near the top', () => {
  cy.mount(VirtualList, {
    props: {
      height: 100,
      items: Array.from({ length: 100 }, (_, key) => ({ key })),
      itemSize: 30,
      fixedSize: true,
    },
    slots: { default: '<div style="height: 30px">item</div>' },
  });
  cy.get('@vue').then(({ wrapper }) => {
    wrapper.findComponent(Virtualizer).vm.$emit('scrollEnd');
  });
  cy.get('@vue').should(({ wrapper }) => {
    expect(wrapper.emitted('scrollEnd')).to.have.length(1);
    expect(wrapper.emitted('reachBottom')).to.equal(undefined);
  });
});

it('scrolls a horizontal list along its horizontal axis', () => {
  cy.mount(VirtualList, {
    props: {
      direction: 'horizontal',
      height: 50,
      items: Array.from({ length: 100 }, (_, key) => ({ key })),
      itemSize: 30,
      fixedSize: true,
    },
    attrs: { style: 'width: 100px' },
    slots: { default: '<div style="width: 30px; height: 30px">item</div>' },
  });
  cy.get('.sd-virtual-list-scroller').should(($el) =>
    expect($el[0].scrollWidth).to.be.greaterThan(100),
  );
  cy.get('@vue').then(({ wrapper }) => wrapper.vm.scrollToPosition(120));
  cy.get('.sd-virtual-list-scroller').should(($el) => expect($el[0].scrollLeft).to.equal(120));
});

it('still reports reaching the bottom when scrolling ends there', () => {
  cy.mount(VirtualList, {
    props: {
      height: 100,
      items: Array.from({ length: 100 }, (_, key) => ({ key })),
      itemSize: 30,
      fixedSize: true,
    },
    slots: { default: '<div style="height: 30px">item</div>' },
  });
  cy.get('@vue').then(({ wrapper }) => {
    const viewport = wrapper.find('.sd-virtual-list-scroller').element as HTMLElement;
    viewport.scrollTop = viewport.scrollHeight;
    const before = wrapper.emitted('reachBottom')?.length ?? 0;
    wrapper.findComponent(Virtualizer).vm.$emit('scrollEnd');
    expect(wrapper.emitted('reachBottom')).to.have.length(before + 1);
  });
});
