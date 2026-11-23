describe('React composed Table', () => {
  it('activates the last page by keyboard and falls back when that page is removed', () => {
    cy.visit('/table-root.html?scenario=page-shrink');
    cy.get('.sd-table-td-content').should('have.text', 'Alpha');
    cy.contains('.sd-pagination-item', /^3$/).focus().trigger('keydown', { key: 'Enter' });
    cy.get('[data-testid="controlled-page"]').should('have.text', '3');
    cy.get('.sd-table-td-content').should('have.text', 'Delta');
    cy.contains('button', 'Remove last row').click();
    cy.get('[data-testid="controlled-page"]').should('have.text', '2');
    cy.get('.sd-pagination [aria-current="page"]').should('have.text', '2');
    cy.get('.sd-table-td-content').should('have.text', 'Gamma');
  });

  it('updates grouped right-fixed offsets after resizing and drops a removed column drag', () => {
    cy.visit('/table-root.html?scenario=column-lifecycle');
    const header = (title: string) => cy.contains('.sd-table-th', new RegExp(`^${title}$`));
    const events = () => cy.get('[data-testid="column-resizes"]');
    const start = (title: string, delta: number) =>
      header(title).then(([$header]) => {
        const right = $header.getBoundingClientRect().right;
        cy.wrap($header).find('.sd-table-column-handle').trigger('mousedown', {
          eventConstructor: 'MouseEvent',
          clientX: right,
          force: true,
        });
        cy.window().trigger('mousemove', {
          eventConstructor: 'MouseEvent',
          clientX: right + delta,
        });
      });
    header('Outer').should('have.css', 'right', '0px');
    header('Inner').should('have.css', 'right', '0px');
    header('Score').should('have.css', 'right', '100px');
    header('Name').should('have.css', 'right', '200px');
    start('Name', 20);
    cy.window().trigger('mouseup');
    events().should('have.text', '__proto__:170');
    start('Score', 50);
    events().should('have.text', '__proto__:170|score:150');
    header('Name').should('have.css', 'right', '250px');
    cy.contains('.sd-table-tbody .sd-table-td', /^Beta$/).should('have.css', 'right', '250px');
    cy.contains('button', 'Toggle score column').then(([$button]) => $button.click());
    header('Score').should('not.exist');
    header('Name').should('have.css', 'right', '100px');
    cy.contains('button', 'Toggle score column').then(([$button]) => $button.click());
    header('Score').should('not.have.class', 'sd-table-th-resizing');
    cy.window().trigger('mousemove', { eventConstructor: 'MouseEvent', clientX: 400 });
    events().should('have.text', '__proto__:170|score:150');
    start('Score', 10);
    cy.window().trigger('mouseup');
    events().should('have.text', '__proto__:170|score:150|score:160');
    header('Name').should('have.css', 'right', '260px');
  });

  it('preserves controlled tree selection until accepting the requested enabled leaves', () => {
    cy.visit('/table-root.html?scenario=controlled-selection');
    const checkbox = (name: string) =>
      cy.contains('.sd-table-tbody [role="row"]', name).find('.sd-checkbox');
    checkbox('Parent').should('have.class', 'sd-checkbox-indeterminate').click();
    cy.get('[data-testid="requested-selection"]').should(($requested) => {
      expect(JSON.parse($requested.text())).to.have.members([0, 1, 'off-page']);
    });
    checkbox('Parent').should('have.class', 'sd-checkbox-indeterminate');
    checkbox('One').find('input').should('not.be.checked');
    cy.contains('button', 'Accept selection').click();
    checkbox('Parent')
      .should('not.have.class', 'sd-checkbox-indeterminate')
      .find('input')
      .should('be.checked');
    checkbox('Zero').find('input').should('be.checked');
    checkbox('One').find('input').should('be.checked');
    checkbox('Disabled').find('input').should('be.disabled').and('not.be.checked');
  });

  it('sorts actual rows and reports the new query and page data in the same callback', () => {
    cy.visit('/table-root.html');
    cy.get('.sd-table-tbody')
      .should('contain.text', 'Beta')
      .and('contain.text', 'Alpha')
      .and('not.contain.text', 'Gamma');
    cy.contains('.sd-table-th .sd-table-cell', 'Score').click();
    cy.get('.sd-table-tbody')
      .should('contain.text', 'Alpha')
      .and('contain.text', 'Gamma')
      .and('not.contain.text', 'Beta');
    cy.get('[data-testid="events"]').should('have.text', 'sort:score:ascend,change:sorter');
    cy.get('[data-testid="change"]').should(
      'have.text',
      '{"keys":[1,2],"sorted":[1,2,0,3],"page":1,"size":2,"sorter":{"field":"score","direction":"ascend"},"filters":{}}',
    );
  });

  it('keeps the live sorter and filter when their column titles change', () => {
    cy.visit('/table-root.html?no-page');
    cy.contains('.sd-table-th .sd-table-cell', 'Score').click().click();
    cy.get('.sd-table-filters').click();
    cy.contains('.sd-table-filters-content .sd-checkbox', 'B only').click();
    cy.get('.sd-table-filters-bottom button').last().click();
    const rows = () => cy.get('.sd-table-tbody .sd-table-tr');
    rows().should('have.length', 2);
    rows().eq(0).should('contain.text', 'Beta');
    rows().eq(1).should('contain.text', 'Gamma');
    cy.contains('button', 'Rename query columns').click();
    cy.contains('.sd-table-th', 'Updated score').should('have.attr', 'aria-sort', 'descending');
    cy.contains('.sd-table-th', 'Updated kind').find('.sd-table-filters-active').should('exist');
    rows().should('have.length', 2);
    rows().eq(0).should('contain.text', 'Beta');
    rows().eq(1).should('contain.text', 'Gamma');
  });
  it('filters actual rows through the popup and preserves controlled column values until accepted', () => {
    cy.visit('/table-root.html?controlled');
    cy.contains('.sd-table-th .sd-table-cell', 'Score').click();
    cy.get('.sd-table-tbody').should('contain.text', 'Beta').and('contain.text', 'Alpha');
    cy.get('.sd-table-filters').click();
    cy.contains('.sd-table-filters-content .sd-checkbox', 'B only').click();
    cy.get('.sd-table-filters-bottom button').last().click();
    cy.get('.sd-table-tbody').should('contain.text', 'Alpha');
    cy.contains('button', 'Accept external').click();
    cy.get('.sd-table-tbody')
      .should('contain.text', 'Gamma')
      .and('contain.text', 'Beta')
      .and('not.contain.text', 'Alpha');
    cy.get('.sd-table-th[aria-sort="ascending"]').should('exist');
  });
  it('combines row selection, page changes, only-current clearing and page size changes', () => {
    cy.visit('/table-root.html?only-current');
    cy.contains('.sd-table-tbody .sd-table-tr', 'Alpha').find('.sd-checkbox').click();
    cy.get('[data-testid="selected"]').should('have.text', '["off-page",1]');
    cy.get('[data-testid="events"]').should('have.text', 'selection,selected');
    cy.get('.sd-pagination-item').contains('2').click();
    cy.get('.sd-table-tbody').should('contain.text', 'Gamma').and('not.contain.text', 'Alpha');
    cy.get('[data-testid="selected"]').should('have.text', '[]');
    cy.get('[data-testid="change"]').should('contain', '"page":2');
    cy.get('.sd-pagination').should('exist');
  });
  it('expands actual nested rows and expanded content, and exposes row ref operations', () => {
    cy.visit('/table-root.html');
    cy.get('.sd-table-cell-inline-icon .sd-table-expand-btn').first().click();
    cy.get('.sd-table-tbody').should('contain.text', 'Child');
    cy.get('[data-testid="events"]').should('have.text', '');
    cy.contains('button', 'Ref expand all').click();
    cy.get('.sd-table-tr-expand').should('contain.text', 'Detail:Alpha');
    cy.contains('button', 'Ref select all').click();
    cy.get('[data-testid="selected"]').should('have.text', '["off-page",0,100,1]');
  });
  it('renders merged cells, numeric summaries, footer and native row/cell event order', () => {
    cy.visit('/table-root.html?summary&span&no-page');
    cy.get('.sd-table-tbody > .sd-table-tr')
      .first()
      .find('.sd-table-td:not(.sd-table-operation)')
      .should('have.length', 2);
    cy.get('.sd-table-tfoot').should('contain.text', 'Total').and('contain.text', '100');
    cy.get('.sd-table-footer').should('have.text', 'Table footer');
    cy.contains('.sd-table-tbody .sd-table-td-content', 'Gamma').click();
    cy.get('[data-testid="events"]').should('have.text', 'cell,row');
    cy.get('.sd-table').should('have.attr', 'role', 'table');
  });
  it('uses provider defaults and lets explicit Table props override them', () => {
    cy.visit('/table-root.html?config');
    cy.get('.sd-table')
      .should('have.class', 'sd-table-size-small')
      .and('have.class', 'sd-table-stripe')
      .and('not.have.class', 'sd-table-border');
    cy.get('.sd-table-thead').should('not.exist');
    cy.get('.sd-pagination').should('not.exist');
    cy.get('.sd-table-tbody').should('contain.text', 'Delta');
    cy.contains('button', 'Override config').click();
    cy.get('.sd-table')
      .should('have.class', 'sd-table-border')
      .and('not.have.class', 'sd-table-stripe');
    cy.get('.sd-table-thead').should('exist');
  });
  it('composes pagination callbacks and changes page size through the real Select', () => {
    cy.visit('/table-root.html?callbacks');
    cy.get('.sd-pagination .sd-select-view').click();
    cy.get('.sd-select-option').contains('4').click();
    cy.get('.sd-table-tbody').should('contain.text', 'Delta');
    cy.get('[data-testid="change"]').should('contain', '"size":4');
    cy.get('[data-testid="events"]').should(
      'contain',
      'size:4,change:pagination,pagination-size:4',
    );
  });
  it('uses table-specific loading configuration', () => {
    cy.visit('/table-root.html?loading');
    cy.get('.sd-table .sd-spin-loading').should('exist');
    cy.contains('.sd-spin-tip', 'Configured loading').should('be.visible');
  });
  it('debounces cell hover events for 30ms and cancels a pending event on unmount', () => {
    cy.clock();
    cy.visit('/table-root.html?hover&no-page');
    cy.get('.sd-table-tbody .sd-table-td:not(.sd-table-operation)').first().trigger('mouseover');
    cy.tick(29);
    cy.get('[data-testid="events"]').should('have.text', '');
    cy.tick(1);
    cy.get('[data-testid="events"]').should('have.text', 'enter:0:name');
    cy.get('.sd-table-tbody .sd-table-td:not(.sd-table-operation)').first().trigger('mouseout');
    cy.contains('button', 'Toggle table').trigger('click');
    cy.tick(100);
    cy.get('[data-testid="events"]').should('have.text', 'enter:0:name');
  });
  it('routes ref clear/reset query operations through the same change pipeline as header controls', () => {
    cy.visit('/table-root.html');
    cy.contains('.sd-table-th .sd-table-cell', 'Score').click();
    cy.contains('button', 'Clear sorter').click();
    cy.get('.sd-table-tbody').should('contain.text', 'Beta').and('contain.text', 'Alpha');
    cy.get('[data-testid="events"]').should('contain', 'sort:score:,change:sorter');
    cy.contains('.sd-table-th .sd-table-cell', 'Score').click();
    cy.get('.sd-table-filters').click();
    cy.contains('.sd-table-filters-content .sd-checkbox', 'B only').click();
    cy.get('.sd-table-filters-bottom button').last().click();
    cy.get('.sd-table-tbody').should('contain.text', 'Gamma').and('not.contain.text', 'Alpha');
    cy.contains('button', 'Reset query').click();
    cy.get('.sd-table-tbody').should('contain.text', 'Beta').and('contain.text', 'Alpha');
    cy.get('[data-testid="change"]').should(
      'have.text',
      '{"keys":[0,1],"sorted":[0,1,2,3],"page":1,"size":2,"filters":{"kind":[]}}',
    );
    cy.get('[data-testid="events"]').should(
      'contain',
      'filter:kind:,change:filter,sort:score:,change:sorter',
    );
  });
  it('splits the horizontal header after filtering a nonempty source down to no rows', () => {
    cy.visit('/table-root.html?scroll-x');
    cy.get('.sd-table-header').should('not.exist');
    cy.get('.sd-table-filters').click();
    cy.contains('.sd-table-filters-content .sd-checkbox', 'No rows').click();
    cy.get('.sd-table-filters-bottom button').last().click();
    cy.get('.sd-table-header').should('exist');
    cy.get('.sd-table-tr-empty .sd-empty').should('be.visible');
    cy.get('.sd-pagination').should('not.exist');
  });
});
