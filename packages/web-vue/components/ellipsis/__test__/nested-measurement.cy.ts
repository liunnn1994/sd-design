import { defineComponent, h, ref } from 'vue';

import Ellipsis from '../ellipsis.vue';

const MeasurementProbe = defineComponent({
  name: 'RichLineClamp',
  props: { html: String, maxLines: Number },
  setup: () => () => h('div', 'Measurement probe'),
});

describe('Ellipsis nested measurement', () => {
  it('excludes every measurement probe when copying nested content', () => {
    cy.mount(Ellipsis, {
      props: { tooltip: false },
      attrs: { style: 'width: 120px' },
      slots: {
        default: () => h(Ellipsis, { tooltip: false }, () => 'Nested content'),
      },
      global: { stubs: { RichLineClamp: MeasurementProbe } },
    });
    cy.get('@vue').should(({ wrapper }) => {
      const probes = wrapper.findAllComponents(MeasurementProbe);
      expect(probes).to.have.length(2);
      for (const probe of probes) {
        expect(probe.props('html')).not.to.include('data-ellipsis-measure');
        expect(probe.props('html')).not.to.include('Measurement probe');
      }
    });
  });

  it('keeps real nested measurements stable when live content changes', () => {
    const text = ref('Nested long content '.repeat(12));
    cy.mount(
      defineComponent({
        setup: () => () =>
          h(
            Ellipsis,
            {
              tooltip: false,
              class: 'outer-ellipsis',
              style: 'width: 100px',
            },
            () => h(Ellipsis, { tooltip: false, style: 'width: 180px' }, () => text.value),
          ),
      }),
    );
    const inner = '.outer-ellipsis > .sd-ellipsis-content > .sd-ellipsis';
    cy.get(inner).should('have.attr', 'title', text.value.trim());
    cy.get('.outer-ellipsis').should('not.have.attr', 'title');
    cy.get('[data-ellipsis-measure]').should('have.length', 2);
    cy.then(() => {
      text.value = 'Updated nested content '.repeat(12);
    });
    cy.get(inner).should('have.attr', 'title', 'Updated nested content '.repeat(12).trim());
    cy.get('[data-ellipsis-measure]').should('have.length', 2);
    cy.get('@vue').then(({ wrapper }) => wrapper.unmount());
    cy.get('[data-ellipsis-measure]').should('not.exist');
  });
});
