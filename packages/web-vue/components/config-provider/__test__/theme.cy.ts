import { defineComponent, h, ref } from 'vue';

import AutoComplete from '../../auto-complete';
import Cascader from '../../cascader';
import Input from '../../input';
import Select from '../../select';
import TreeSelect from '../../tree-select';
import ConfigProvider from '../config-provider.vue';
import { applyThemeCSSVariables, normalizeTheme, resolveThemeToken } from '../theme';

const mountProvider = (props: Record<string, unknown>, defaultSlot: unknown) =>
  cy.mount(
    defineComponent({
      render() {
        return h(ConfigProvider, props, { default: () => defaultSlot });
      },
    }),
  );

describe('config-provider theme', () => {
  afterEach(() => {
    document.body.removeAttribute('style');
    document.body.removeAttribute('sd-theme');
  });

  it('normalizes the theme object with compatibility fields', () => {
    const normalized = normalizeTheme({
      token: { primary6: '12,34,56' },
      components: { Button: { primary6: '100,100,100' } },
      meta: { cssVarPrefix: 'sd' },
    });
    expect(normalized.tokens['primary-6']).to.equal('12,34,56');
    expect(normalized.components.button['primary-6']).to.equal('100,100,100');
    expect(normalized.meta.cssVarPrefix).to.equal('--sd-');
    expect(resolveThemeToken(normalized, 'button', 'primary-6')).to.equal('100,100,100');
    expect(resolveThemeToken(normalized, 'input', 'primary-6')).to.equal('12,34,56');
  });

  it('applies css variables and removes stale keys', () => {
    const previousKeys = applyThemeCSSVariables(
      document.body,
      normalizeTheme({ tokens: { primary6: '12,34,56' } }),
    );
    expect(document.body.style.getPropertyValue('--primary-6')).to.equal('12,34,56');
    applyThemeCSSVariables(
      document.body,
      normalizeTheme({ tokens: { success6: '10,20,30' } }),
      previousKeys,
    );
    expect(document.body.style.getPropertyValue('--primary-6')).to.equal('');
    expect(document.body.style.getPropertyValue('--success-6')).to.equal('10,20,30');
  });

  it('updates css variables when the theme changes', () => {
    const themeRef = ref({
      tokens: { primary6: '0,100,200' },
      components: { Button: { borderRadius: '10px' } },
    });
    cy.mount(
      defineComponent({
        render() {
          return h(
            ConfigProvider,
            { theme: themeRef.value, themeMode: 'dark' },
            { default: () => h('div', 'content') },
          );
        },
      }),
    );
    cy.get('.sd-theme-provider').should('have.attr', 'sd-theme', 'dark');
    cy.get('.sd-theme-provider').should(($el) => {
      const style = ($el[0] as HTMLElement).style;
      expect(style.getPropertyValue('--primary-6')).to.equal('0,100,200');
      expect(style.getPropertyValue('--component-button-border-radius')).to.equal('10px');
    });
    cy.then(() => {
      themeRef.value = { tokens: { primary6: '200,100,0' } };
    });
    cy.get('.sd-theme-provider').should(($el) => {
      const style = ($el[0] as HTMLElement).style;
      expect(style.getPropertyValue('--primary-6')).to.equal('200,100,0');
      expect(style.getPropertyValue('--component-button-border-radius')).to.equal('');
    });
  });

  it('applies the theme to body when the config provider is global', () => {
    mountProvider(
      { global: true, themeMode: 'dark', theme: { tokens: { success1: '1,2,3' } } },
      h('div', 'content'),
    );
    cy.get('body').should('have.attr', 'sd-theme', 'dark');
    cy.get('body').then(($body) => {
      expect(($body[0] as HTMLElement).style.getPropertyValue('--success-1')).to.equal('1,2,3');
    });
  });

  it('does not force the local theme mode when only tokens are provided', () => {
    cy.mount(
      defineComponent({
        render() {
          return h(
            ConfigProvider,
            { themeMode: 'dark', theme: { tokens: { primary6: '10,10,10' } } },
            {
              default: () =>
                h(
                  ConfigProvider,
                  { theme: { tokens: { success6: '22,33,44' } } },
                  { default: () => h('div', 'nested-content') },
                ),
            },
          );
        },
      }),
    );
    cy.get('.sd-theme-provider').should('have.length', 2);
    cy.get('.sd-theme-provider').eq(0).should('have.attr', 'sd-theme', 'dark');
    cy.get('.sd-theme-provider').eq(1).should('not.have.attr', 'sd-theme');
    cy.get('.sd-theme-provider')
      .eq(1)
      .should(($el) => {
        expect(($el[0] as HTMLElement).style.getPropertyValue('--success-6')).to.equal('22,33,44');
      });
  });

  it('removes the local sd-theme attribute when mode is unset at runtime', () => {
    const themeMode = ref<'light' | 'dark' | undefined>('dark');
    cy.mount(
      defineComponent({
        render() {
          return h(
            ConfigProvider,
            { themeMode: themeMode.value, theme: { tokens: { primary6: '30,40,50' } } },
            { default: () => h('div', 'content') },
          );
        },
      }),
    );
    cy.get('.sd-theme-provider').should('have.attr', 'sd-theme', 'dark');
    cy.then(() => {
      themeMode.value = undefined;
    });
    cy.get('.sd-theme-provider').should('not.have.attr', 'sd-theme');
  });

  it('keeps allowClear behavior unchanged when config is unset', () => {
    mountProvider({}, h(Input, { defaultValue: 'input value' }));
    cy.get('.sd-input-clear-btn').should('not.exist');
  });

  it('enables allowClear by default for descendants when configured', () => {
    mountProvider({ allowClear: true }, h(AutoComplete, { defaultValue: 'auto complete value' }));
    cy.get('.sd-input-clear-btn').should('exist');
  });

  it('prefers an explicit allow-clear prop over provider defaults', () => {
    mountProvider(
      { allowClear: true },
      h(Input, { defaultValue: 'manual override', allowClear: false }),
    );
    cy.get('.sd-input-clear-btn').should('not.exist');
  });

  it('keeps allowSearch behavior unchanged when config is unset', () => {
    const options = [
      {
        label: 'Zhejiang',
        value: 'zhejiang',
        children: [{ label: 'Hangzhou', value: 'hangzhou' }],
      },
    ];
    mountProvider(
      {},
      h('div', [
        h(Cascader, { options }),
        h(TreeSelect, {
          options: [{ label: 'Node 1', value: 'node-1' }],
          fieldNames: { title: 'label' },
        }),
        h(Select, { options: ['Beijing', 'Shanghai'] }),
      ]),
    );
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.findComponent(Cascader).find('input').attributes('readonly')).to.not.equal(
        undefined,
      );
      expect(wrapper.findComponent(TreeSelect).find('input').attributes('readonly')).to.not.equal(
        undefined,
      );
      expect(wrapper.findComponent(Select).find('input').attributes('readonly')).to.equal(
        undefined,
      );
    });
  });

  it('enables allowSearch by default for descendants when configured', () => {
    const options = [
      {
        label: 'Zhejiang',
        value: 'zhejiang',
        children: [{ label: 'Hangzhou', value: 'hangzhou' }],
      },
    ];
    mountProvider(
      { allowSearch: true },
      h('div', [
        h(Cascader, { options }),
        h(TreeSelect, {
          options: [{ label: 'Node 1', value: 'node-1' }],
          fieldNames: { title: 'label' },
        }),
        h(Select, { options: ['Beijing', 'Shanghai'] }),
      ]),
    );
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.findComponent(Cascader).find('input').attributes('readonly')).to.equal(
        undefined,
      );
      expect(wrapper.findComponent(TreeSelect).find('input').attributes('readonly')).to.equal(
        undefined,
      );
      expect(wrapper.findComponent(Select).find('input').attributes('readonly')).to.equal(
        undefined,
      );
    });
  });

  it('prefers an explicit allow-search prop over provider defaults', () => {
    const options = [
      {
        label: 'Zhejiang',
        value: 'zhejiang',
        children: [{ label: 'Hangzhou', value: 'hangzhou' }],
      },
    ];
    mountProvider({ allowSearch: true }, h(Cascader, { options, allowSearch: false }));
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.findComponent(Cascader).find('input').attributes('readonly')).to.not.equal(
        undefined,
      );
    });
  });

  it('keeps dropdown virtual list behavior unchanged when config is unset', () => {
    mountProvider(
      {},
      h('div', [
        h(TreeSelect, {
          defaultPopupVisible: true,
          options: [{ label: 'Node 1', value: 'node-1' }],
          fieldNames: { title: 'label' },
        }),
        h(Select, { defaultPopupVisible: true, options: ['Beijing', 'Shanghai'] }),
      ]),
    );
    cy.get('@vue').should(({ wrapper }) => {
      expect(
        wrapper.findComponent(TreeSelect).findComponent({ name: 'Tree' }).props('virtualListProps'),
      ).to.equal(undefined);
      expect(
        wrapper
          .findComponent(Select)
          .findComponent({ name: 'SelectDropdown' })
          .props('virtualList'),
      ).to.equal(false);
    });
  });

  it('applies virtualListProps to dropdown descendants when configured', () => {
    mountProvider(
      { virtualListProps: { itemSize: 40, buffer: 200 } },
      h('div', [
        h(TreeSelect, {
          defaultPopupVisible: true,
          options: [{ label: 'Node 1', value: 'node-1' }],
          fieldNames: { title: 'label' },
        }),
        h(Select, { defaultPopupVisible: true, options: ['Beijing', 'Shanghai'] }),
      ]),
    );
    cy.get('@vue').should(({ wrapper }) => {
      const treeProps = wrapper
        .findComponent(TreeSelect)
        .findComponent({ name: 'Tree' })
        .props('virtualListProps');
      expect(treeProps.itemSize).to.equal(40);
      expect(treeProps.buffer).to.equal(200);
      expect(treeProps.height).to.equal('200px');
      expect(
        wrapper
          .findComponent(Select)
          .findComponent({ name: 'SelectDropdown' })
          .props('virtualList'),
      ).to.equal(true);
    });
  });

  it('prefers explicit virtual-list-props over provider defaults', () => {
    mountProvider(
      { virtualListProps: { itemSize: 40, buffer: 200 } },
      h(Select, {
        defaultPopupVisible: true,
        options: ['Beijing', 'Shanghai'],
        virtualListProps: { itemSize: 28, height: 160 },
      }),
    );
    cy.get('@vue').should(({ wrapper }) => {
      const dropdown = wrapper.findComponent(Select).findComponent({ name: 'SelectDropdown' });
      expect(dropdown.props('virtualList')).to.equal(true);
      expect(dropdown.findComponent({ name: 'VirtualList' }).props('itemSize')).to.equal(28);
      expect(dropdown.findComponent({ name: 'VirtualList' }).props('height')).to.equal(160);
    });
  });
});
