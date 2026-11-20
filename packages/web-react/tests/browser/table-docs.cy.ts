import { startDrag, moveDrag } from '../../../web-vue/cypress/support/drag-sort';
import { checkComponentDocs } from './docs-contract';

describe('React Table documentation', () => {
  it('documents shared table scenes, drag cursors and framework navigation', () => {
    checkComponentDocs('table');
    cy.contains('p', '从拖拽列按住并拖动').should('contain.text', 'grabbing');
  });

  for (const framework of ['vue', 'react'] as const) {
    it(`hydrates the switch and inserts between rows in the ${framework} virtual example`, () => {
      const origin = Cypress.expose('docsOrigin') ?? 'http://127.0.0.1:5188';
      cy.visit(`${origin}${framework === 'react' ? '/react' : ''}/components/table/`, {
        onBeforeLoad(win) {
          cy.spy(win.console, 'warn').as('consoleWarn');
        },
      });
      cy.get('astro-island[prefix]:not([ssr]) .framework-switch', { timeout: 20000 })
        .closest('astro-island')
        .then(([island]) => {
          const prefix = island!.getAttribute('prefix');
          expect(prefix).to.be.ok;
          cy.get('.framework-switch input').should(($radios) => {
            const names = [...$radios].map((radio) => radio.getAttribute('name'));
            expect(names[0]).to.match(new RegExp(`^sd-radio-group-${prefix}-`));
            expect(names).to.deep.equal([names[0], names[0]]);
          });
        });
      const demo = '[data-example="table/virtual-drag"]';
      const row = (index: number) => `${demo} [data-table-drag-path="[${index}]"]`;
      cy.get(demo).scrollIntoView({ offset: { top: -160, left: 0 } });
      cy.get(`${row(0)} .sd-table-drag-handle svg`).should('be.visible');
      startDrag(`${row(0)} .sd-table-drag-handle`);
      moveDrag(row(2), 0.15, false);
      cy.get(row(2))
        .should('have.class', 'sd-table-tr-drop-target')
        .and('not.have.attr', 'data-table-drop-after');
      moveDrag(row(2), 0.15);
      for (const [index, record] of [2, 1, 3].entries()) {
        cy.contains(`${row(index)} .sd-table-td-content`, new RegExp(`^记录 ${record}$`));
      }
      cy.get('@consoleWarn').should(
        'not.have.been.calledWithMatch',
        /Hydration attribute mismatch/,
      );
    });
  }
});
