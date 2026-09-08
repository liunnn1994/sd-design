import type { App } from 'vue';

import { computed, defineComponent, h } from 'vue';

import { getPrefixCls, setGlobalConfig } from '../global-config';

const appLikeStub = { config: { globalProperties: {} } } as unknown as App;

describe('global-config', () => {
  afterEach(() => {
    // 恢复默认前缀，避免污染后续用例
    setGlobalConfig(appLikeStub, { classPrefix: 'sd' });
  });

  it('returns the default prefix', () => {
    cy.mount(
      defineComponent({
        setup() {
          const cls = computed(() => getPrefixCls('probe'));
          return { cls };
        },
        render() {
          return h('div', { class: this.cls }, 'probe');
        },
      }),
    );

    cy.get('.sd-probe').should('exist');
  });


  it('getPrefixCls reacts to runtime classPrefix changes inside computed()', () => {
    cy.mount(
      defineComponent({
        setup() {
          const cls = computed(() => getPrefixCls('probe'));
          return { cls };
        },
        render() {
          return h('div', { class: this.cls }, 'probe');
        },
      }),
    );

    cy.get('.sd-probe').should('exist');
    cy.then(() => {
      setGlobalConfig(appLikeStub, { classPrefix: 'zz' });
    });
    cy.get('.zz-probe').should('exist');
    cy.get('.sd-probe').should('not.exist');
  });
});
