describe('React Table column query adapters', () => {
  it('cycles ascending, descending and no sort using the current column and native event', () => {
    cy.visit('/table-column-query.html');
    cy.get('[data-testid="sort"]').should('have.text', 'none:ascend:true:true');
    cy.contains('button', 'Sort').click();
    cy.get('[data-testid="sort"]').should('have.text', 'ascend:descend:true:true');
    cy.contains('button', 'Sort').click();
    cy.get('[data-testid="sort"]').should('have.text', 'descend:none:true:true');
    cy.contains('button', 'Sort').click();
    cy.get('[data-testid="sort"]').should('have.text', 'none:ascend:true:true');
    cy.get('[data-testid="events"]').should(
      'have.text',
      'sort:name:ascend:click,sort:name:descend:click,sort:name::click',
    );
  });
  it('keeps unconfirmed draft values through rerenders, confirms and resets the popup', () => {
    cy.visit('/table-column-query.html');
    cy.contains('button', 'Open filter').click();
    cy.contains('button', 'Checkbox').click();
    cy.get('[data-testid="filter"]').should('have.text', 'true:true:true:one|two');
    cy.contains('button', 'Single filter').click();
    cy.get('[data-testid="filter"]').should('have.text', 'true:true:false:one|two');
    cy.contains('button', 'Radio').click();
    cy.contains('button', 'Confirm').click();
    cy.get('[data-testid="filter"]').should('have.text', 'false:true:false:single');
    cy.contains('button', 'Reset').click();
    cy.get('[data-testid="filter"]').should('have.text', 'false:false:false:');
    cy.get('[data-testid="events"]').should(
      'have.text',
      'filter:name:single:click,filter:name::click',
    );
  });
  it('resynchronizes external filter values and a reused column field', () => {
    cy.visit('/table-column-query.html');
    cy.contains('button', 'Checkbox').click();
    cy.contains('button', 'External').click();
    cy.get('[data-testid="filter"]').should('have.text', 'false:true:true:external');
    cy.contains('button', 'Change column').click();
    cy.get('[data-testid="filter"]').should('have.text', 'false:true:true:other');
    cy.contains('button', 'Sort').click();
    cy.get('[data-testid="events"]').should('have.text', 'sort:other:ascend:click');
  });
});
