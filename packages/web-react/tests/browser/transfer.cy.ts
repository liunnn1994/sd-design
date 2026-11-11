import { checkComponentDocs } from './docs-contract';

{
  const transferControl = (name = '') =>
    cy.get('[data-testid="transfer-fixture"]').contains('button', name).click();
  const sourceRows = () => cy.get('.sd-transfer-view-source .sd-transfer-list-item');
  const targetRows = () => cy.get('.sd-transfer-view-target .sd-transfer-list-item');
  const chooseSource = (label = '') =>
    sourceRows().contains('.sd-transfer-list-item', label).find('label.sd-checkbox').click();
  const forward = () => cy.get('.sd-transfer-operations button').first().click();
  describe('React Transfer', () => {
    beforeEach(() => cy.visit('/'));
    it('moves selections in event order and retains data order on both sides', () => {
      sourceRows().should('have.length', 3);
      targetRows().should('have.length', 1).and('contain', 'Delta');
      chooseSource('Alpha');
      cy.get('[data-testid="transfer-events"]').should('have.text', 'selected:a|select:a');
      transferControl('Transfer clear events');
      forward();
      cy.get('[data-testid="transfer-events"]').should(
        'have.text',
        'selected:|select:|value:d,a|change:d,a',
      );
      targetRows().then(($rows) =>
        expect([...$rows].map((row) => row.textContent)).to.deep.equal(['Alpha', 'Delta']),
      );
      targetRows().contains('.sd-transfer-list-item', 'Alpha').find('label.sd-checkbox').click();
      cy.get('.sd-transfer-operations button').last().click();
      targetRows().should('have.length', 1).and('contain', 'Delta');
      transferControl('Transfer read ref');
      cy.get('[data-testid="transfer-events"]').should('contain', 'ref:DIV');
    });
    it('keeps controlled selection and target unchanged until the parent accepts', () => {
      transferControl('Transfer controlled');
      transferControl('Transfer accept');
      chooseSource('Alpha');
      sourceRows()
        .contains('.sd-transfer-list-item', 'Alpha')
        .find('input')
        .should('not.be.checked');
      transferControl('Transfer accept');
      chooseSource('Alpha');
      sourceRows().contains('.sd-transfer-list-item', 'Alpha').find('input').should('be.checked');
      transferControl('Transfer accept');
      forward();
      sourceRows().should('contain', 'Alpha');
      targetRows().should('not.contain', 'Alpha');
      transferControl('Transfer accept');
      forward();
      targetRows().should('contain', 'Alpha');
    });
    it('filters immediately but reports search only on commit, and selects all valid unfiltered rows', () => {
      cy.get('input[aria-label="Transfer source search"]').type('Alpha');
      sourceRows().should('have.length', 1).and('contain', 'Alpha');
      cy.get('[data-testid="transfer-events"]').should('not.contain', 'search:');
      cy.get('input[aria-label="Transfer source search"]').type('{enter}');
      cy.get('[data-testid="transfer-events"]').should('contain', 'search:source:Alpha');
      cy.get('.sd-transfer-view-source .sd-transfer-view-header .sd-checkbox').click();
      cy.get('[data-testid="transfer-selected"]').should('have.text', 'a,c');
      forward();
      targetRows().should('have.length', 3);
      cy.get('.sd-transfer-view-source .sd-transfer-view-empty').should('exist');
      cy.get('input[aria-label="Transfer source search"]').clear();
      sourceRows().should('have.length', 1).and('contain', 'Beta');
      sourceRows().find('input').should('be.disabled');
    });
    it('moves simple rows directly and ignores disabled items', () => {
      transferControl('Transfer simple');
      cy.get('.sd-transfer-operations').should('not.exist');
      sourceRows().contains('.sd-transfer-list-item', 'Alpha').click();
      targetRows().should('contain', 'Alpha');
      sourceRows().contains('.sd-transfer-list-item', 'Beta').click();
      sourceRows().should('contain', 'Beta');
      targetRows().contains('.sd-transfer-list-item', 'Alpha').click();
      sourceRows().should('contain', 'Alpha');
      transferControl('Transfer disabled');
      sourceRows().contains('.sd-transfer-list-item', 'Gamma').click();
      targetRows().should('not.contain', 'Gamma');
    });
    it('removes one-way targets by keyboard and clears only enabled target values', () => {
      transferControl('Transfer controlled');
      transferControl('Transfer disabled values');
      transferControl('Transfer one way');
      cy.get('.sd-transfer-operations button').should('have.length', 1);
      targetRows()
        .contains('.sd-transfer-list-item', 'Beta')
        .find('[role="button"]')
        .should('not.exist');
      targetRows()
        .contains('.sd-transfer-list-item', 'Delta')
        .find('[role="button"]')
        .focus()
        .trigger('keydown', { key: 'Enter' });
      targetRows().should('have.length', 1).and('contain', 'Beta');
      chooseSource('Alpha');
      forward();
      cy.get('.sd-transfer-view-target .sd-transfer-view-header-clear-btn').click();
      targetRows().should('have.length', 1).and('contain', 'Beta');
    });
    it('updates item and panel renderers without losing live selection callbacks', () => {
      transferControl('Transfer custom item');
      cy.get('[data-testid="transfer-custom-a"]').should('have.text', 'a:Alpha');
      cy.get('[data-testid="transfer-forward-icon"]').should('have.text', 'Forward');
      transferControl('Transfer custom item');
      cy.get('[data-testid="transfer-custom-a"]').should('not.exist');
      transferControl('Transfer custom panels');
      cy.get('[data-testid="transfer-source-panel"]').contains('button', 'Gamma').click();
      forward();
      cy.get('[data-testid="transfer-target-panel"]').should('have.text', 'Gamma,Delta');
      transferControl('Transfer custom panels');
      targetRows().should('have.length', 2);
    });
    it('guards custom title callbacks while disabled and inherits Form disabled state', () => {
      transferControl('Transfer custom titles');
      transferControl('Transfer disabled');
      cy.get('[data-testid="transfer-source-title"]').click();
      cy.get('[data-testid="transfer-target-title"]').click();
      cy.get('[data-testid="transfer-events"]').should('have.text', '');
      transferControl('Transfer disabled');
      cy.get('[data-testid="transfer-source-title"]').click();
      cy.get('[data-testid="transfer-selected"]').should('have.text', 'a,c');
      transferControl('Transfer form disabled');
      cy.get('.sd-transfer').should('have.class', 'sd-transfer-disabled');
      cy.get('.sd-transfer-operations button').should('be.disabled');
      cy.get('input[aria-label="Transfer source search"]').should('be.disabled');
    });
    it('removes header selection controls without changing the selected rows', () => {
      chooseSource('Alpha');
      transferControl('Transfer select all');
      cy.get('.sd-transfer-view-header input').should('not.exist');
      cy.get('.sd-transfer-view-source .sd-transfer-view-header-count').should(
        'have.text',
        '1 / 3',
      );
      sourceRows().contains('.sd-transfer-list-item', 'Alpha').find('input').should('be.checked');
      transferControl('Transfer custom titles');
      cy.get('[data-testid="transfer-source-title"]').should('have.text', '1/3::true');
    });
  });

  describe('React Transfer boundaries', () => {
    beforeEach(() => cy.visit('/'));
    it('deduplicates select-all and derives checked state only from enabled selections', () => {
      chooseSource('Alpha');
      cy.get('.sd-transfer-view-source .sd-transfer-view-header .sd-checkbox').click();
      cy.get('[data-testid="transfer-selected"]').should('have.text', 'a,c');
      transferControl('Transfer controlled');
      transferControl('Transfer disabled values');
      cy.get('.sd-transfer-view-target .sd-transfer-view-header .sd-checkbox')
        .should('not.have.class', 'sd-checkbox-checked')
        .and('not.have.class', 'sd-checkbox-indeterminate');
      cy.get('.sd-transfer-view-target .sd-transfer-view-header .sd-checkbox').click();
      cy.get('[data-testid="transfer-selected"]').should('have.text', 'b,d');
      cy.get('.sd-transfer-view-target .sd-transfer-view-header .sd-checkbox').should(
        'have.class',
        'sd-checkbox-checked',
      );
      cy.get('.sd-transfer-view-target .sd-transfer-view-header .sd-checkbox').click();
      cy.get('[data-testid="transfer-selected"]').should('have.text', 'b');
    });
    it('removes exactly once in simple one-way mode using a native Space key', () => {
      transferControl('Transfer simple');
      transferControl('Transfer one way');
      targetRows().find('[role="button"]').focus();
      cy.press(Cypress.Keyboard.Keys.SPACE);
      cy.get('.sd-transfer-view-target .sd-transfer-list-item').should('not.exist');
      cy.get('[data-testid="transfer-events"]').should(
        'have.text',
        'selected:|select:|value:|change:',
      );
    });
    it('moves selected values with a focused native button and retains per-panel filters', () => {
      chooseSource('Alpha');
      cy.get('.sd-transfer-operations button').first().focus();
      cy.then(() =>
        Cypress.automation('remote:debugger:protocol', {
          command: 'Input.dispatchKeyEvent',
          params: {
            type: 'keyDown',
            key: 'Enter',
            code: 'Enter',
            windowsVirtualKeyCode: 13,
            text: '\r',
          },
        }),
      );
      cy.then(() =>
        Cypress.automation('remote:debugger:protocol', {
          command: 'Input.dispatchKeyEvent',
          params: { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 },
        }),
      );
      targetRows().should('contain', 'Alpha');
      cy.get('input[aria-label="Transfer source search"]').type('Gamma');
      cy.get('input[aria-label="Transfer target search"]').type('Delta{enter}');
      sourceRows().should('have.length', 1).and('contain', 'Gamma');
      targetRows().should('have.length', 1).and('contain', 'Delta');
      cy.get('[data-testid="transfer-events"]')
        .should('contain', 'search:source:Gamma')
        .and('contain', 'search:target:Delta');
    });
  });
}

describe('React Transfer documentation', () => {
  it('documents shared transfer scenes and framework navigation', () =>
    checkComponentDocs('transfer'));
});
