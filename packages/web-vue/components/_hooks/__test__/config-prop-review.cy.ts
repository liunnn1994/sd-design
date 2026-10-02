import type { PropType } from 'vue';
import { defineComponent, h, toRef } from 'vue';

import type { VirtualListProps } from '../../_components/virtual-list/interface';

import ConfigProvider from '../../config-provider';
import Input from '../../input';
import { useAllowSearch } from '../use-allow-search';
import { useConfigProviderProp } from '../use-config-provider-prop';
import { useDropdownVirtualListProps } from '../use-dropdown-virtual-list-props';

for (const initial of [false, true]) {
  it(`updates clear-button precedence when the explicit prop is ${initial ? 'removed' : 'added'}`, () => {
    cy.mount(
      defineComponent({
        components: { ConfigProvider, Input },
        data: () => ({ localProps: initial ? { allowClear: false } : {} }),
        template:
          '<ConfigProvider allow-clear><Input default-value="abc" v-bind="localProps" /></ConfigProvider>',
      }),
    );
    cy.get('.sd-input-clear-btn').should(initial ? 'not.exist' : 'exist');
    cy.get('@vue').then(({ wrapper }) => {
      (wrapper.vm as { localProps: Record<string, unknown> }).localProps = initial
        ? {}
        : { allowClear: false };
    });
    cy.get('.sd-input-clear-btn').should(initial ? 'exist' : 'not.exist');
  });
}

for (const kind of ['search', 'generic', 'virtual'] as const) {
  const Probe = defineComponent({
    props: {
      local: Boolean,
      allowSearch: Boolean,
      virtualListProps: Object as PropType<VirtualListProps>,
    },
    setup(props) {
      const value =
        kind === 'search'
          ? useAllowSearch(toRef(props, 'allowSearch')).mergedAllowSearch
          : kind === 'generic'
            ? useConfigProviderProp(toRef(props, 'local'), {
                propNames: ['local'],
                getGlobalValue: () => true,
              }).mergedValue
            : useDropdownVirtualListProps(toRef(props, 'virtualListProps'))
                .mergedDropdownVirtualListProps;
      return () => h('div', { 'data-cy': 'precedence' }, value.value ? 'global' : 'local');
    },
  });
  const explicit =
    kind === 'search'
      ? { allowSearch: false }
      : kind === 'generic'
        ? { local: false }
        : { virtualListProps: undefined };
  for (const initial of [false, true]) {
    it(`updates ${kind} precedence when the explicit prop is ${initial ? 'removed' : 'added'}`, () => {
      cy.mount(
        defineComponent({
          data: () => ({ localProps: initial ? explicit : {} }),
          render() {
            return h(ConfigProvider, { allowSearch: true, virtualListProps: { height: 100 } }, () =>
              h(Probe, this.localProps),
            );
          },
        }),
      );
      cy.get('[data-cy=precedence]').should('have.text', initial ? 'local' : 'global');
      cy.get('@vue').then(({ wrapper }) => {
        (wrapper.vm as { localProps: Record<string, unknown> }).localProps = initial
          ? {}
          : explicit;
      });
      cy.get('[data-cy=precedence]').should('have.text', initial ? 'global' : 'local');
    });
  }
}
