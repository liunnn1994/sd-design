import type { App } from 'vue';
import { computed, defineComponent, h } from 'vue';

import ConfigProvider from '../../config-provider';
import {
  getComponentPrefix,
  getCssVarToken,
  getPrefixCls,
  setGlobalConfig,
} from '../global-config';

const app = { config: { globalProperties: {} } } as unknown as App;

describe('Prefix foundation adapter', () => {
  beforeEach(() => setGlobalConfig(app, { classPrefix: 'sd' }));
  afterEach(() => setGlobalConfig(app, { classPrefix: 'sd' }));

  it('keeps setup provider scope and live global computed prefixes with fixed CSS tokens', () => {
    const makeProbe = (id: string) =>
      defineComponent({
        setup() {
          const scoped = getPrefixCls('static');
          const live = computed(() => getPrefixCls('live'));
          return () => h('output', { id }, `${scoped}|${live.value}|${getCssVarToken('--color')}`);
        },
      });
    const ScopedProbe = makeProbe('prefix-scoped-report'),
      GlobalProbe = makeProbe('prefix-global-report');
    cy.mount(
      defineComponent({
        setup: () => () =>
          h('div', [
            h(ConfigProvider, { prefixCls: 'scope' }, () => h(ScopedProbe)),
            h(GlobalProbe),
          ]),
      }),
    );
    cy.get('#prefix-scoped-report').should('have.text', 'scope-static|scope-live|--sd-color');
    cy.get('#prefix-global-report').should('have.text', 'sd-static|sd-live|--sd-color');
    cy.then(() => setGlobalConfig(app, { classPrefix: 'next' }));
    cy.get('#prefix-scoped-report').should('have.text', 'scope-static|scope-live|--sd-color');
    cy.get('#prefix-global-report').should('have.text', 'sd-static|next-live|--sd-color');
    cy.then(() => {
      expect(getComponentPrefix()).to.equal('Sd');
      expect(getComponentPrefix({ componentPrefix: '' })).to.equal('');
      expect(getComponentPrefix({ componentPrefix: 'Custom' })).to.equal('Custom');
    });
  });
});
