import { defineComponent, h, reactive, ref, toRef } from 'vue';

import type { ConfigProvider as ProviderContext } from '../../config-provider/context';

import ConfigProvider from '../../config-provider';
import { useAllowClear } from '../use-allow-clear';
import { useAllowSearch } from '../use-allow-search';
import { useConfigProviderProp } from '../use-config-provider-prop';
import { useDropdownVirtualListProps } from '../use-dropdown-virtual-list-props';
import useMergeState from '../use-merge-state';
import usePopupContainer from '../use-popup-container';

const Probe = defineComponent({
  props: {
    allowClear: { type: Boolean, default: undefined },
    allowSearch: { type: Boolean, default: undefined },
    legacySearch: { type: Boolean, default: undefined },
    configValue: { type: Boolean, default: undefined },
    virtualListProps: { type: Object, default: undefined },
  },
  setup(props) {
    const { mergedAllowClear } = useAllowClear(toRef(props, 'allowClear'));
    const searchOptions = {
      compatPropNames: ['legacySearch', 'legacy-search'],
      getCompatValue(): boolean | undefined {
        expect(this).to.equal(searchOptions);
        return props.legacySearch;
      },
      getDefaultValue(): boolean {
        expect(this).to.equal(searchOptions);
        return false;
      },
    };
    const { mergedAllowSearch } = useAllowSearch(toRef(props, 'allowSearch'), searchOptions);
    const configOptions = {
      propNames: ['configValue', 'config-value'],
      getGlobalValue(context: ProviderContext | undefined): boolean | undefined {
        expect(this).to.equal(configOptions);
        return context?.allowClear;
      },
    };
    const { mergedValue } = useConfigProviderProp(toRef(props, 'configValue'), configOptions);
    const { mergedDropdownVirtualListProps } = useDropdownVirtualListProps(
      toRef(props, 'virtualListProps'),
    );
    return () =>
      h(
        'output',
        { id: 'config-values' },
        JSON.stringify([
          mergedAllowClear.value ?? null,
          mergedAllowSearch.value ?? null,
          mergedValue.value ?? null,
          mergedDropdownVirtualListProps.value?.height ?? null,
        ]),
      );
  },
});

describe('Configuration priority foundation adapters', () => {
  it('keeps the legacy merge tuple and clears local requests on control release', () => {
    cy.mount(
      defineComponent({
        setup() {
          const props = reactive({ value: undefined as string | undefined });
          const [merged, setLocal, local] = useMergeState('seed', props);
          return () =>
            h('div', [
              h('output', { id: 'legacy-merge-values' }, `${merged.value}|${local.value}`),
              h(
                'button',
                { id: 'legacy-merge-local', onClick: () => setLocal('pending') },
                'Local',
              ),
              h(
                'button',
                {
                  id: 'legacy-merge-control',
                  onClick: () => {
                    props.value = 'held';
                  },
                },
                'Control',
              ),
              h(
                'button',
                {
                  id: 'legacy-merge-release',
                  onClick: () => {
                    props.value = undefined;
                  },
                },
                'Release',
              ),
            ]);
        },
      }),
    );
    cy.get('#legacy-merge-values').should('have.text', 'seed|seed');
    cy.get('#legacy-merge-local').click();
    cy.get('#legacy-merge-values').should('have.text', 'pending|pending');
    cy.get('#legacy-merge-control').click();
    cy.get('#legacy-merge-local').click();
    cy.get('#legacy-merge-values').should('have.text', 'held|pending');
    cy.get('#legacy-merge-release').click();
    cy.get('#legacy-merge-values').should('have.text', 'undefined|undefined');
    cy.get('#legacy-merge-local').click();
    cy.get('#legacy-merge-values').should('have.text', 'pending|pending');
  });
  it('retains direct and queried popup container identity with the original fallback', () => {
    cy.mount(
      defineComponent({
        setup() {
          const props = reactive({ popupContainer: undefined as string | HTMLElement | undefined });
          const fallback = document.createElement('aside');
          fallback.id = 'legacy-popup-fallback';
          const container = usePopupContainer(fallback, props);
          return () =>
            h('div', [
              h('div', { id: 'legacy-popup-a' }),
              h('div', { id: 'legacy-popup-b' }),
              h('output', { id: 'legacy-popup-value' }, container.value?.id),
              h(
                'button',
                {
                  id: 'legacy-popup-selector',
                  onClick: () => {
                    props.popupContainer = '#legacy-popup-a';
                  },
                },
                'Selector',
              ),
              h(
                'button',
                {
                  id: 'legacy-popup-direct',
                  onClick: () => {
                    props.popupContainer = document.getElementById('legacy-popup-b')!;
                  },
                },
                'Direct',
              ),
              h(
                'button',
                {
                  id: 'legacy-popup-missing',
                  onClick: () => {
                    props.popupContainer = '#legacy-popup-missing-target';
                  },
                },
                'Missing',
              ),
            ]);
        },
      }),
    );
    cy.get('#legacy-popup-value').should('have.text', 'legacy-popup-fallback');
    cy.get('#legacy-popup-selector').click();
    cy.get('#legacy-popup-value').should('have.text', 'legacy-popup-a');
    cy.get('#legacy-popup-direct').click();
    cy.get('#legacy-popup-value').should('have.text', 'legacy-popup-b');
    cy.get('#legacy-popup-missing').click();
    cy.get('#legacy-popup-value').should('have.text', 'legacy-popup-fallback');
  });
  it('tracks absent, explicit undefined, compatibility and false props across VNode updates', () => {
    cy.mount(
      defineComponent({
        setup() {
          const local = ref<Record<string, unknown>>({});
          const enabled = ref(true);
          return () =>
            h(
              ConfigProvider,
              {
                allowClear: enabled.value,
                allowSearch: enabled.value,
                virtualListProps: { height: 300 },
              },
              () => [
                h(Probe, local.value),
                h(
                  'button',
                  {
                    id: 'config-undefined',
                    onClick: () => {
                      local.value = {
                        allowClear: undefined,
                        allowSearch: undefined,
                        configValue: undefined,
                        virtualListProps: undefined,
                        legacySearch: true,
                      };
                    },
                  },
                  'Explicit undefined',
                ),
                h(
                  'button',
                  {
                    id: 'config-compat',
                    onClick: () => {
                      local.value = { legacySearch: undefined };
                    },
                  },
                  'Compatibility undefined',
                ),
                h(
                  'button',
                  {
                    id: 'config-compat-false',
                    onClick: () => {
                      local.value = { 'legacy-search': false };
                    },
                  },
                  'Compatibility false',
                ),
                h(
                  'button',
                  {
                    id: 'config-false',
                    onClick: () => {
                      local.value = {
                        'allow-clear': false,
                        'allow-search': false,
                        'config-value': false,
                        'virtual-list-props': { height: 99 },
                      };
                    },
                  },
                  'Explicit false',
                ),
                h(
                  'button',
                  {
                    id: 'config-absent',
                    onClick: () => {
                      local.value = {};
                    },
                  },
                  'Omit props',
                ),
                h(
                  'button',
                  {
                    id: 'config-provider-false',
                    onClick: () => {
                      enabled.value = false;
                    },
                  },
                  'Provider false',
                ),
              ],
            );
        },
      }),
    );
    cy.get('#config-values').should('have.text', '[true,true,true,300]');
    cy.get('#config-undefined').click();
    cy.get('#config-values').should('have.text', '[null,null,null,null]');
    cy.get('#config-compat').click();
    cy.get('#config-values').should('have.text', '[true,null,true,300]');
    cy.get('#config-compat-false').click();
    cy.get('#config-values').should('have.text', '[true,false,true,300]');
    cy.get('#config-false').click();
    cy.get('#config-values').should('have.text', '[false,false,false,99]');
    cy.get('#config-absent').click();
    cy.get('#config-values').should('have.text', '[true,true,true,300]');
    cy.get('#config-provider-false').click();
    cy.get('#config-values').should('have.text', '[null,false,false,300]');
  });
});
