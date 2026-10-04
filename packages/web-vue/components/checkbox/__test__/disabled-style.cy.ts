import Checkbox from '../index';

interface BrowserNode {
  nodeId: number;
  attributes?: string[];
  children?: BrowserNode[];
  contentDocument?: BrowserNode;
}

function findAppDocument(node: BrowserNode): BrowserNode | undefined {
  if (node.contentDocument && node.attributes?.some((value) => value.includes('aut-iframe')))
    return node.contentDocument;
  for (const child of node.children ?? []) {
    const match = findAppDocument(child);
    if (match) return match;
  }
}

describe('Checkbox disabled styling', () => {
  it('keeps the disabled border color while hovered', () => {
    cy.mount(Checkbox, {
      props: { disabled: true },
      attrs: {
        style:
          '--component-checkbox-mask-color-border-disabled: rgb(12, 34, 56); --component-checkbox-mask-color-border: rgb(78, 90, 12)',
      },
      slots: { default: 'Disabled option' },
    });
    cy.get('.sd-checkbox-icon').should('have.css', 'border-top-color', 'rgb(12, 34, 56)');
    // Avoid asserting the pre-hover color while the border transition is still running.
    cy.get('.sd-checkbox-icon').invoke('css', 'transition', 'none');
    cy.then(async () => {
      await Cypress.automation('remote:debugger:protocol', { command: 'DOM.enable' });
      await Cypress.automation('remote:debugger:protocol', { command: 'CSS.enable' });
    });
    cy.then(() =>
      Cypress.automation('remote:debugger:protocol', {
        command: 'DOM.getDocument',
        params: { depth: -1, pierce: true },
      }).then(async ({ root }: { root: BrowserNode }) => {
        const appDocument = findAppDocument(root);
        expect(appDocument, 'component iframe document').not.to.equal(undefined);
        const { nodeId } = await Cypress.automation('remote:debugger:protocol', {
          command: 'DOM.querySelector',
          params: { nodeId: appDocument!.nodeId, selector: '.sd-checkbox' },
        });
        expect(nodeId, 'rendered checkbox node').not.to.equal(0);
        return Cypress.automation('remote:debugger:protocol', {
          command: 'CSS.forcePseudoState',
          params: { nodeId, forcedPseudoClasses: ['hover'] },
        });
      }),
    );
    cy.get('.sd-checkbox-icon').should('have.css', 'border-top-color', 'rgb(12, 34, 56)');
    cy.get('input').should('be.disabled').and('not.be.checked');
  });
});
