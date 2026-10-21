import { defineComponent, h, reactive, ref, watchEffect } from 'vue';

import type { PaginationProps } from '../../pagination/interface';

import { usePagination as useListPagination } from '../../list/use-pagination';
import { usePagination as useTablePagination } from '../../table/hooks/use-pagination';
import { useCursor } from '../use-cursor';
import { usePagination as useSharedPagination } from '../use-pagination';

describe('Compatibility pagination and cursor adapters', () => {
  for (const variant of ['shared', 'list', 'table'])
    it(`${variant} keeps controlled requests, latest models and retained local release state`, () => {
      cy.mount(
        defineComponent({
          setup() {
            const initial: PaginationProps = {
              current: 1,
              pageSize: 2,
              defaultCurrent: 4,
              defaultPageSize: 6,
            };
            const props = reactive<{
              pagination: PaginationProps;
              paginationProps: PaginationProps;
            }>({ pagination: initial, paginationProps: initial });
            const events = ref<unknown[][]>([]);
            const emit = (name: string, value: unknown) => events.value.push([name, value]);
            const api =
              variant === 'table'
                ? useTablePagination(props, emit)
                : variant === 'list'
                  ? useListPagination(props, { emit })
                  : useSharedPagination(props, { emit });
            const current = 'page' in api ? api.page : api.current;
            const replace = (value: PaginationProps) => {
              props.pagination = value;
              props.paginationProps = value;
            };
            return () =>
              h('div', [
                h(
                  'output',
                  { id: 'compat-pagination-value' },
                  `${current.value}|${api.pageSize.value}`,
                ),
                h('output', { id: 'compat-pagination-events' }, JSON.stringify(events.value)),
                h(
                  'button',
                  {
                    id: 'compat-pagination-request',
                    onClick: () => {
                      api.handlePageChange(9);
                      api.handlePageSizeChange(7);
                    },
                  },
                  'Request',
                ),
                h(
                  'button',
                  {
                    id: 'compat-pagination-external',
                    onClick: () => replace({ current: 12, pageSize: 3 }),
                  },
                  'External',
                ),
                h(
                  'button',
                  {
                    id: 'compat-pagination-release',
                    onClick: () => replace({ defaultCurrent: 50, defaultPageSize: 60 }),
                  },
                  'Release',
                ),
              ]);
          },
        }),
      );
      cy.get('#compat-pagination-value').should('have.text', '1|2');
      cy.get('#compat-pagination-request').click();
      cy.get('#compat-pagination-value').should('have.text', '1|2');
      cy.get('#compat-pagination-events').should(
        'have.text',
        '[["pageChange",9],["pageSizeChange",7]]',
      );
      cy.get('#compat-pagination-external').click();
      cy.get('#compat-pagination-value').should('have.text', '12|3');
      cy.get('#compat-pagination-release').click();
      cy.get('#compat-pagination-value').should('have.text', '9|7');
    });

  it('restores real native input selection after suffix/prefix/character/end formatting', () => {
    cy.mount(
      defineComponent({
        setup() {
          const input = ref<HTMLInputElement>();
          const [record, restore] = useCursor(input);
          return () =>
            h('div', [
              h('input', { id: 'compat-cursor-input', ref: input }),
              h('button', { id: 'compat-cursor-record', onClick: record }, 'Record'),
              h('button', { id: 'compat-cursor-restore', onClick: restore }, 'Restore'),
            ]);
        },
      }),
    );
    for (const [value, expected] of [
      ['longabcXYZ', 7],
      ['abcNEW', 3],
      ['c--cZ', 4],
      ['none', 4],
    ] as const) {
      cy.get('#compat-cursor-input').then((element) => {
        const input = element[0] as HTMLInputElement;
        input.value = 'abcXYZ';
        input.focus();
        input.setSelectionRange(3, 3);
      });
      cy.get('#compat-cursor-record').then((button) => button[0].click());
      cy.get('#compat-cursor-input').then((element) => {
        (element[0] as HTMLInputElement).value = value;
      });
      cy.get('#compat-cursor-restore').then((button) => button[0].click());
      cy.get('#compat-cursor-input').should((element) => {
        const input = element[0] as HTMLInputElement;
        expect(input.selectionStart).to.equal(expected);
        expect(input.selectionEnd).to.equal(expected);
        expect(input).to.equal(input.ownerDocument.activeElement);
      });
    }
  });

  it('retains private snapshot dependency tracking when restore runs inside watchEffect', () => {
    cy.mount(
      defineComponent({
        setup() {
          const input = ref<HTMLInputElement>(),
            report = ref(0);
          let runs = 0;
          const [record, restore] = useCursor(input);
          watchEffect(() => {
            restore();
            report.value = ++runs;
          });
          return () =>
            h('div', [
              h('input', { id: 'cursor-effect-input', ref: input }),
              h('button', { id: 'cursor-effect-record', onClick: record }, 'Record'),
              h('output', { id: 'cursor-effect-runs' }, String(report.value)),
            ]);
        },
      }),
    );
    let before = 0;
    cy.get('#cursor-effect-runs').then((output) => {
      before = Number(output.text());
    });
    cy.get('#cursor-effect-input').then((element) => {
      const input = element[0] as HTMLInputElement;
      input.value = 'abcXYZ';
      input.setSelectionRange(3, 3);
    });
    cy.get('#cursor-effect-record').then((button) => button[0].click());
    cy.get('#cursor-effect-runs').should((output) =>
      expect(Number(output.text())).to.equal(before + 1),
    );
  });
});
