import { defineComponent, h, shallowRef } from 'vue';

import Alert from '../../alert';
import Button from '../../button';
import Card from '../../card';
import Input from '../../input';
import Select from '../../select';
import Table from '../../table';
import ConfigProvider from '../config-provider.vue';
import { normalizeTheme } from '../theme';

const seed = { primary: '#1476ff', success: '#16a34a', warning: '#d97706', danger: '#e11d48' };

describe('深色主题语义与继承', () => {
  afterEach(() => cy.document().then((document) => document.body.removeAttribute('sd-theme')));

  it('themeMode、算法和祖先模式使用一致的派生色板，紧凑不覆盖明暗', () => {
    const dark = normalizeTheme({ seed, algorithm: ['dark'] }).tokens['primary-6'];
    const light = normalizeTheme({ seed }).tokens['primary-6'];
    const mode = shallowRef<'light' | 'dark'>('dark');
    cy.mount(
      defineComponent({
        setup: () => () =>
          h(
            ConfigProvider,
            { themeMode: mode.value },
            {
              default: () => [
                h(
                  ConfigProvider,
                  { theme: { seed, algorithm: ['compact'] } },
                  {
                    default: () =>
                      h(Button, { id: 'inherited-seed', type: 'primary' }, () => '继承'),
                  },
                ),
                h(
                  ConfigProvider,
                  { themeMode: 'light', theme: { seed, algorithm: ['dark'] } },
                  {
                    default: () =>
                      h(Button, { id: 'explicit-light', type: 'primary' }, () => '浅色优先'),
                  },
                ),
              ],
            },
          ),
      }),
    );
    const assertPalette = (selector: string, value: string | number) =>
      cy.get(selector).should(($el) => {
        expect(
          getComputedStyle($el[0]).getPropertyValue('--sd-primary-6').replace(/\s/g, ''),
        ).to.equal(String(value).replace(/\s/g, ''));
      });
    assertPalette('#inherited-seed', dark);
    assertPalette('#explicit-light', light);
    cy.then(() => {
      mode.value = 'light';
    });
    assertPalette('#inherited-seed', light);
    cy.then(() => {
      mode.value = 'dark';
    });
    assertPalette('#inherited-seed', dark);
  });

  it('全局明暗切换同步局部卡片、表格、表单、语义状态及浮层', () => {
    cy.mount(
      defineComponent({
        setup: () => () =>
          h(
            ConfigProvider,
            { theme: { seed } },
            {
              default: () =>
                h(
                  Card,
                  { id: 'dark-card', title: '主题检查' },
                  {
                    default: () => [
                      ...(['success', 'warning', 'error', 'info'] as const).map((type) =>
                        h(Alert, { type }, () => type),
                      ),
                      h(Input, { id: 'dark-input' }),
                      h(Button, { id: 'loading-button', loading: true }, () => '加载中'),
                      h(Select, { id: 'dark-select', options: ['发布', '归档'] }),
                      h(Table, {
                        columns: [{ title: '名称', dataIndex: 'name' }],
                        data: [{ key: '1', name: '发布任务' }],
                        pagination: false,
                      }),
                    ],
                  },
                ),
            },
          ),
      }),
    );
    cy.document().then((document) => document.body.setAttribute('sd-theme', 'dark'));
    cy.get('#dark-card').should('have.css', 'background-color', 'rgb(35, 35, 36)');
    cy.get('#loading-button').should(($el) => {
      expect(getComputedStyle($el[0], '::before').backgroundColor).to.equal('rgb(35, 35, 36)');
    });
    cy.get('#dark-input').should('have.css', 'background-color', 'rgba(255, 255, 255, 0.08)');
    cy.get('#dark-select').click();
    cy.get('.sd-select-dropdown').should('have.css', 'background-color', 'rgb(55, 55, 57)');
    cy.get('.sd-table-th').should('have.css', 'background-color', 'rgb(46, 46, 48)');
    cy.document().then((document) => document.body.removeAttribute('sd-theme'));
    cy.get('#dark-card').should('have.css', 'background-color', 'rgb(255, 255, 255)');
    cy.get('.sd-select-dropdown').should('have.css', 'background-color', 'rgb(255, 255, 255)');
  });
});
