import oracle from '../../../web-core/tests/fixtures/markdown-pre-diff-vue.json';
import {
  captureMarkdownDiff,
  compactMarkdownDiffCapture,
  isMarkdownDiffSynchronized,
  markdownDiffScenarios,
} from '../../../web-core/tests/fixtures/markdown-pre-diff.js';
const expected: Record<string, unknown> = oracle;
let last: unknown;
let lastKey = '';
function capture(key: string, synced = false) {
  cy.get('pre.code-pre-fallback').should(
    'have.attr',
    'data-markstream-code-theme',
    key.startsWith('dark-') ? 'vitesse-dark' : 'vitesse-light',
  );
  if (synced)
    cy.get('pre.code-pre-fallback').should(($pre) =>
      expect(isMarkdownDiffSynchronized($pre[0]), key).to.equal(true),
    );
  cy.get('pre.code-pre-fallback').should(($pre) => {
    last = compactMarkdownDiffCapture(captureMarkdownDiff($pre[0]));
    lastKey = key;
    expect(last, key).to.deep.equal(expected[key]);
  });
}
describe('React pre diff against real Vue DOM snapshots', () => {
  afterEach(() => {
    if (last) cy.writeFile(`../../.local/markdown-pre-diff-react-${lastKey}.json`, last);
  });
  for (const scenario of Object.keys(markdownDiffScenarios))
    it(`matches all Vue ${scenario} rows, geometry and live changes`, () => {
      cy.viewport(1000, 660);
      cy.visit(`/markdown-pre-diff.html?scenario=${scenario}`);
      const synced = ['dark', 'split', 'collapsed', 'reserved'].includes(scenario);
      capture(`${scenario}-wide`, synced);
      cy.contains('button', 'Resize').click();
      capture(`${scenario}-narrow`, synced);
      cy.contains('button', 'Expand').click();
      capture(`${scenario}-expanded`, synced);
      cy.contains('button', 'Change').click();
      capture(`${scenario}-configured`, synced);
      cy.contains('button', 'Number width').click();
      capture(`${scenario}-numbered`, synced);
      cy.contains('button', 'Number width').click();
      capture(`${scenario}-shrunk`, synced);
    });
  for (const name of ['patch', 'blank', 'loading'])
    it(`matches Vue ${name} metadata, blank lines and loading tails`, () => {
      cy.viewport(1000, 660);
      cy.visit(`/markdown-pre-diff.html?case=${name}`);
      capture(name);
    });
  it('keeps diff colors in a fragment and falls back when enhanced fills are missing', () => {
    cy.visit('/markdown-pre-diff.html?fragment');
    const expectFill = (color: string) =>
      cy
        .get('.markstream-pre__diff-line--removed')
        .first()
        .should(([$row]) => {
          const view = $row.ownerDocument.defaultView!;
          expect(view.getComputedStyle($row, '::before').backgroundColor).to.equal(color);
        });
    expectFill(oracle['split-wide'].panes[0].layouts[1].fill);
    cy.get('pre.markstream-pre--diff-preview').invoke(
      'css',
      '--sd-markdown-pre-removed-line',
      'initial',
    );
    expectFill('rgba(171, 89, 89, 0.12)');
  });
  it('disconnects its row observer when the diff is removed', () => {
    let active = 0;
    cy.visit('/markdown-pre-diff.html', {
      onBeforeLoad(window) {
        const Observer = window.ResizeObserver;
        window.ResizeObserver = class extends Observer {
          tracked = false;
          override observe(element: Element, options?: ResizeObserverOptions) {
            if (!this.tracked && element.matches('pre.markstream-pre--diff-preview')) {
              this.tracked = true;
              active++;
            }
            super.observe(element, options);
          }
          override disconnect() {
            if (this.tracked) {
              active--;
              this.tracked = false;
            }
            super.disconnect();
          }
        };
      },
    });
    capture('split-wide', true);
    cy.then(() => expect(active).to.equal(1));
    cy.contains('button', 'Unmount').click();
    cy.get('pre').should('not.exist');
    cy.then(() => expect(active).to.equal(0));
  });
});
