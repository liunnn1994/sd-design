import { h } from 'vue';

import type { DescLayout } from '../interface';

import Descriptions from '../index';

describe('Descriptions data slot indexes', () => {
  for (const layout of [
    'horizontal',
    'vertical',
    'inline-horizontal',
    'inline-vertical',
  ] as DescLayout[]) {
    it(`uses original data indexes across rows in ${layout} layout`, () => {
      cy.mount(Descriptions, {
        props: {
          layout,
          column: 3,
          data: Array.from({ length: 5 }, (_, index) => ({
            label: `Label ${index}`,
            value: `Value ${index}`,
            span: index === 0 ? 2 : 1,
          })),
        },
        slots: {
          label: ({ index, label }: { index: number; label: string }) =>
            h('span', { 'data-cy': 'label' }, `${index}:${label}`),
          value: ({ index, value }: { index: number; value: string }) =>
            h('span', { 'data-cy': 'value' }, `${index}:${value}`),
        },
      });
      cy.get('[data-cy="label"]').should(($labels) => {
        expect([...$labels].map((label) => label.textContent)).to.deep.equal([
          '0:Label 0',
          '1:Label 1',
          '2:Label 2',
          '3:Label 3',
          '4:Label 4',
        ]);
      });
      cy.get('[data-cy="value"]').should(($values) => {
        expect([...$values].map((value) => value.textContent)).to.deep.equal([
          '0:Value 0',
          '1:Value 1',
          '2:Value 2',
          '3:Value 3',
          '4:Value 4',
        ]);
      });
    });
  }
});
