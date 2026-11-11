import { readMarkdownTextFontProfile } from '@sdata/web-core/markdown/text-height';
const expectHeights = (expected: number[]) =>
  cy
    .get('.probe-renderer > .node-slot > .node-placeholder')
    .should(($nodes) =>
      expect([...$nodes].map((node) => Number.parseFloat(node.style.height))).to.deep.equal(
        expected,
      ),
    );
const visit = (noCanvas = false, query = '') =>
  cy.visit(`/markdown-probe.html${query}`, {
    onBeforeLoad(window) {
      window.requestIdleCallback = () => 1;
      window.cancelIdleCallback = () => undefined;
      if (noCanvas) cy.stub(window.HTMLCanvasElement.prototype, 'getContext').returns(null);
    },
  });
describe('React Markdown text measurement probes', () => {
  it('mounts hidden native probes without adding rendered slots', () => {
    visit();
    cy.get('.height-estimation-probes')
      .should('have.attr', 'aria-hidden', 'true')
      .and('not.be.visible');
    cy.get('.height-estimation-probes > [data-probe]').should('have.length', 9);
    const expected = [
      ['normal 400 14px Arial', 22.001, 15.999, 0],
      ['normal 400 14px Arial', 22.001, 6.999, 6],
      ['normal 400 14px Arial', 22.001, 36.999, 27.765625],
      ['normal 700 36px Arial', 43.2, 35.8, 0],
      ['normal 600 24px Arial', 32.4, 65.6, 0],
      ['normal 600 20px Arial', 30, 42, 0],
      ['normal 600 16px Arial', 20, 26, 0],
      ['normal 500 16px Arial', 20, 20, 0],
      ['normal 500 16px Arial', 20, 20, 0],
    ] as const;
    cy.get('.height-estimation-probes > [data-probe]').should(($nodes) => {
      [...$nodes].forEach((node, index) => {
        const profile = readMarkdownTextFontProfile(
          node,
          node.querySelector<HTMLElement>('p,h1,h2,h3,h4,h5,h6'),
        )!;
        expect(profile.font).to.equal(expected[index][0]);
        expect(profile.lineHeight).to.be.closeTo(expected[index][1], 0.002);
        expect(profile.wrapperOverhead).to.be.closeTo(expected[index][2], 0.002);
        expect(profile.widthAdjustment).to.be.closeTo(expected[index][3], 0.002);
      });
    });
    cy.get('.node-slot > .node-content').should('have.length', 1);
    cy.get('.height-estimation-probes > [data-probe]').then(($nodes) =>
      cy.writeFile(
        '../../.local/markdown-probe-react-profile.json',
        [...$nodes].map((node) => ({
          probe: node.dataset.probe,
          profile: readMarkdownTextFontProfile(
            node,
            node.querySelector<HTMLElement>('p,h1,h2,h3,h4,h5,h6'),
          ),
          html: node.innerHTML,
        })),
      ),
    );
  });
  it('matches real Vue estimates at wide, narrow and same-bucket widths', () => {
    visit();
    expectHeights([104, 60, 28, 195, 132, 80, 38, 40, 60]);
    cy.contains('button', /^Resize$/).click();
    expectHeights([192, 60, 28, 292, 198, 80, 38, 40, 60]);
    cy.contains('button', /^Resize$/).click();
    cy.contains('button', 'Resize within bucket').click();
    expectHeights([104, 60, 28, 195, 132, 80, 38, 40, 38]);
  });
  it('refreshes font profiles and falls back when paragraph rendering is customized', () => {
    visit();
    expectHeights([104, 60, 28, 195, 132, 80, 38, 40, 60]);
    cy.contains('button', 'Resize within bucket').click();
    cy.contains('button', 'Change font').click();
    expectHeights([126, 60, 28, 195, 176, 80, 38, 40, 38]);
    cy.contains('button', 'Custom paragraph').click();
    expectHeights([122, 80, 80, 195, 176, 80, 80, 40, 80]);
  });
  it('keeps the static fallback usable when canvas measurement is unavailable', () => {
    visit(true);
    expectHeights([122, 80, 28, 32, 176, 80, 28, 20, 28]);
    cy.contains('button', 'Toggle coordination').click();
    cy.get('.height-estimation-probes').should('not.exist');
  });
  it('uses the shared paragraph and list margins in actual rendered content', () => {
    visit();
    cy.get('[data-testid="probe-viewport"]').scrollTo(0, 80);
    cy.get('.probe-renderer > .node-slot[data-node-index="1"] > .node-content > .paragraph-node')
      .should('have.css', 'margin-top', '8px')
      .and('have.css', 'margin-bottom', '8px');
    cy.get('.height-estimation-probes [data-probe="list-item"] .list-item').should(
      'have.css',
      'margin-top',
      '3.5px',
    );
  });
  it('matches the desktop list geometry above the upstream responsive breakpoint', () => {
    cy.viewport(1280, 660);
    visit();
    expectHeights([104, 60, 28, 195, 123, 80, 38, 40, 60]);
  });
  it('matches ordered and unordered list margins on both sides of the responsive breakpoint', () => {
    for (const width of [1000, 1280])
      for (const ordered of [false, true]) {
        cy.viewport(width, 660);
        visit(false, `?list-only${ordered ? '&ordered' : ''}`);
        cy.get(
          '.probe-renderer > .node-slot[data-node-index="0"] > .node-content > .list-node',
        ).should(($list) => {
          const mobileUnordered = width === 1000 && !ordered;
          expect(Number.parseFloat($list.css('margin-top'))).to.be.closeTo(
            mobileUnordered ? (14 * 4) / 3 : 14,
            0.02,
          );
          expect(Number.parseFloat($list.css('padding-left'))).to.be.closeTo(
            mobileUnordered ? (14 * 14) / 9 : 12,
            0.02,
          );
        });
      }
  });
});
