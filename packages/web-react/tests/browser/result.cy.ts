describe('React result', () => {
  beforeEach(() => cy.visit('/result.html'));

  it('renders result status variants and supports custom and invalid status handling', () => {
    for (const [status, icon] of [
      ['info', 'info'],
      ['success', 'check'],
      ['warning', 'exclamation'],
      ['error', 'close'],
    ]) {
      cy.get('[aria-label="结果状态"]').select(status);
      cy.get(`[data-testid="result"] .sd-result-icon-${status}`)
        .should('have.attr', 'aria-hidden', 'true')
        .find(`svg.sd-icon-${icon}`)
        .should('exist');
    }
    cy.get('[aria-label="结果状态"]').select('custom');
    cy.get('[data-testid="result"] .sd-result-icon-custom')
      .should('have.text', '自定义结果')
      .find('svg')
      .should('not.exist');
    cy.get('[aria-label="结果状态"]').select('invalid');
    cy.get('[data-testid="result"] .sd-icon-info').should('exist');
    cy.contains('button', '重试结果 0').click();
    cy.contains('button', '重试结果 1').should('exist');
    cy.get('[data-testid="result"] .sd-result-content').should('have.text', '结果详情');
  });

  it('defaults to info, replaces its icon and removes unused content regions', () => {
    const result = '[data-testid="result"]';
    cy.get(`${result} .sd-result-icon-info svg.sd-icon-info`).should('exist');
    cy.get(`${result} .sd-result-title strong`).should('have.text', '结果标题');
    cy.get(`${result} .sd-result-subtitle`).should('have.text', '结果说明');
    cy.get(`${result} .sd-result-extra button`).should('have.text', '重试结果 0');
    cy.contains('button', '切换结果图标').click();
    cy.get(`${result} .sd-result-icon-info`).should('have.text', '自定义结果');
    cy.get(`${result} .sd-result-icon-info svg`).should('not.exist');
    cy.contains('button', '切换结果内容').click();
    for (const region of ['title', 'subtitle', 'extra', 'content']) {
      cy.get(`${result} .sd-result-${region}`).should('not.exist');
    }
    cy.contains('button', '切换结果图标').click();
    cy.get(`${result} .sd-result-icon-info svg.sd-icon-info`).should('exist');
    cy.contains('button', '切换结果内容').click();
    cy.get(`${result} .sd-result-content`).should('have.text', '结果详情');
  });

  it('renders shared result illustrations with unique and resolvable SVG references', () => {
    for (const status of ['403', '404', '500']) {
      cy.get('[aria-label="结果状态"]').select(status);
      cy.get(`[data-testid="result"] .sd-result-icon-${status}`).should(
        'have.css',
        'padding-top',
        '24px',
      );
      cy.get(`[data-testid="result"] .sd-result-icon-${status} svg`)
        .should('have.attr', 'viewBox', '0 0 213 213')
        .and('be.visible');
      cy.get('[data-testid^="result"] svg').should(($svgs) => {
        const ids = Array.from($svgs).flatMap((svg) =>
          Array.from(svg.querySelectorAll('[id]')).map((node) => node.id),
        );
        expect(new Set(ids).size).to.equal(ids.length);
        for (const svg of Array.from($svgs)) {
          for (const node of Array.from(svg.querySelectorAll('[href]'))) {
            const href = node.getAttribute('href')!;
            if (href.startsWith('#'))
              expect(
                Array.from(svg.querySelectorAll('[id]')).some(
                  (target) => target.id === href.slice(1),
                ),
              ).to.equal(true);
          }
        }
      });
    }
  });
});
