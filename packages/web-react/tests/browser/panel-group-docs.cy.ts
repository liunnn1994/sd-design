import { checkComponentDocs } from './docs-contract';

describe('PanelGroup documentation', () => {
  it('documents shared panel-group scenes and framework navigation', () =>
    checkComponentDocs('panel-group'));

  it('uses the resize lines as the basic example frame edges', () => {
    const origin = Cypress.expose('docsOrigin') ?? 'http://127.0.0.1:5188';
    cy.visit(origin + '/react/components/panel-group/');
    cy.get('[data-example="panel-group/basic"]')
      .scrollIntoView()
      .find('.demo-block__preview-content > astro-island:not([ssr])', { timeout: 20000 })
      .find('.single-panel-demo')
      .should(($demo) => {
        const demo = $demo[0];
        const content = demo.querySelector('.single-panel-demo-content')!;
        const line = '.sd-resizebox-trigger-icon-wrapper';
        const rightGrip = demo.querySelector(`.sd-resizebox-trigger-vertical > ${line}`)!;
        const bottomGrip = demo.querySelector(`.sd-resizebox-trigger-horizontal > ${line}`)!;
        const bounds = content.getBoundingClientRect();
        expect(Cypress.$(content)).to.have.css('border-right-color', 'rgba(0, 0, 0, 0)');
        expect(Cypress.$(content)).to.have.css('border-bottom-color', 'rgba(0, 0, 0, 0)');
        expect(rightGrip.getBoundingClientRect().right).to.equal(bounds.right);
        expect(bottomGrip.getBoundingClientRect().bottom).to.equal(bounds.bottom);
      });
  });
});
