import type { MarkdownPerformanceTestApi } from './markdown-performance-main.js';
const api = () =>
  cy.window().its('markdownPerformanceApi') as Cypress.Chainable<MarkdownPerformanceTestApi>;
describe('Markdown manual performance monitor', () => {
  beforeEach(() => cy.visit('/markdown-performance.html'));
  it('retains browser debugger helpers and the same Core and facade instance', () => {
    cy.window().then(async (browser) => {
      const value = (browser as unknown as { markdownPerformanceApi: MarkdownPerformanceTestApi })
        .markdownPerformanceApi;
      const facade = await value.loadFacade();
      expect(value.perfMonitor).to.equal(value.coreMonitor).and.equal(facade.perfMonitor);
      expect(value.enablePerfMonitoring).to.equal(facade.enablePerfMonitoring);
      expect(browser).to.have.property('__katexPerfMonitor', value.perfMonitor);
      expect(browser).to.have.property('__katexPerfReport', value.getPerfReport);
    });
  });
  it('records, pauses, reports and exports actual manual samples without losing them on disable', () => {
    cy.window().then((window) => {
      cy.spy(window.console, 'group').as('group');
      cy.spy(window.console, 'groupEnd').as('groupEnd');
    });
    api().then((value) => {
      value.enablePerfMonitoring();
      for (const [type, duration] of [
        ['direct', 10],
        ['worker', 5],
        ['cache-hit', 0.1],
      ] as const)
        value.perfMonitor.recordRender({
          type,
          duration,
          timestamp: Date.now(),
          formulaLength: 3,
          success: true,
        });
      value.disablePerfMonitoring();
      value.perfMonitor.recordRender({
        type: 'direct',
        duration: 500,
        timestamp: Date.now(),
        formulaLength: 3,
        success: true,
      });
      const report = value.getPerfReport();
      expect(report.totalRenders).to.equal(3);
      expect(report.cacheHitRate).to.equal('33.3');
      const exported = value.perfMonitor.exportMetrics();
      expect(exported.stats).to.deep.equal(report);
      expect(exported.metrics).to.have.length(3);
      value.perfMonitor.reset();
      expect(value.perfMonitor.getStats().totalRenders).to.equal(0);
    });
    cy.get('@group').should('have.been.calledOnce');
    cy.get('@groupEnd').should('have.been.calledOnce');
  });
});
