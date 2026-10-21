import { h, ref } from 'vue';

import SelectDropdown from '../select-dropdown.vue';

describe('SelectDropdown foundation adapter', () => {
  it('emits original native events in reachBottom then scroll order with live offsets', () => {
    const offset = ref(0),
      events: Array<[string, Event]> = [];
    cy.mount({
      setup: () => () =>
        h(
          SelectDropdown,
          {
            bottomOffset: offset.value,
            scrollbar: { outerStyle: { height: '120px' } },
            onScroll: (event: Event) => events.push(['scroll', event]),
            onReachBottom: (event: Event) => events.push(['bottom', event]),
          },
          () =>
            Array.from({ length: 30 }, (_, i) => h('li', { style: { height: '30px' } }, String(i))),
        ),
    });
    cy.get('[data-overlayscrollbars-viewport]').scrollTo('bottom');
    cy.wrap(null).should(() => {
      const index = events.findIndex(([name]) => name === 'bottom');
      expect(index).to.be.greaterThan(-1);
      expect(events[index + 1]?.[0]).to.equal('scroll');
      expect(events[index + 1]?.[1]).to.equal(events[index]?.[1]);
    });
    cy.then(() => {
      offset.value = -100;
      events.length = 0;
    });
    cy.get('[data-overlayscrollbars-viewport]')
      .scrollTo('top')
      .should((el) => expect(el[0].scrollTop).to.equal(0));
    cy.then(() => {
      events.length = 0;
    });
    cy.get('[data-overlayscrollbars-viewport]').scrollTo('bottom');
    cy.wrap(null).should(() => {
      expect(events.length).to.be.greaterThan(0);
      expect(events.some(([name]) => name === 'bottom')).to.equal(false);
    });
  });
});
