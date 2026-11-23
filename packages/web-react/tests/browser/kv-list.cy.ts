describe('KvList React', () => {
  const main = '[data-testid="kv-main"]';
  const rows = `${main} [data-testid="kv-list-row"]`;
  const key = (index: number) => cy.get(`${rows} .sd-kv-list-key input`).eq(index);
  const value = (index: number) => cy.get(`${rows} .sd-kv-list-value input`).eq(index);
  const action = (label: string) => cy.get(`${main} button[aria-label="${label}"]`);
  beforeEach(() => cy.visit('/kv-list.html'));
  it('synchronizes row editing in order without duplicate StrictMode initialization', () => {
    cy.get('[data-testid="kv-events"]').should('have.text', 'bulk:first: 1\nsecond: 2');
    cy.contains('button', 'KV clear events').click();
    key(0).clear().type('region');
    value(0).clear().type('cn-north');
    cy.get('[data-testid="kv-json"]').should(
      'have.text',
      JSON.stringify([
        { key: 'region', value: 'cn-north' },
        { key: 'second', value: '2' },
      ]),
    );
    cy.get('[data-testid="kv-bulk"]').should('have.text', 'region: cn-north\nsecond: 2');
    cy.get('[data-testid="kv-events"]')
      .invoke('text')
      .should('match', /json:.*\|bulk:/);
    cy.get('[data-testid="kv-toolbar-extra"]').should('have.text', 'Toolbar');
  });
  it('retains blank working rows and their values until a key is supplied', () => {
    action('新增键值对').click();
    cy.get(rows).should('have.length', 3);
    value(2).type('draft');
    cy.get('[data-testid="kv-json"]').should('not.contain.text', 'draft');
    key(2).type('new');
    value(2).should('have.value', 'draft');
    cy.get('[data-testid="kv-json"]').should('contain.text', '"key":"new","value":"draft"');
    action('删除键值对').last().click();
    cy.get(rows).should('have.length', 2);
    action('清空键值对').click();
    cy.get(rows).should('have.length', 1);
    key(0).should('have.value', '');
    cy.get('[data-testid="kv-json"]').should('have.text', '[]');
    action('删除键值对').click();
    cy.get(rows).should('have.length', 1);
  });
  it('parses bulk while preserving raw formatting and duplicate keys after JSON writeback', () => {
    action('切换到 Bulk 编辑').click();
    const raw = ' a : one:two  \na: duplicate\nbare\n: ignored';
    cy.get(`${main} textarea`).clear().type(raw);
    cy.get('[data-testid="kv-bulk"]').should('have.text', raw);
    cy.get('[data-testid="kv-json"]').should(
      'have.text',
      JSON.stringify([
        { key: 'a', value: 'one:two' },
        { key: 'a', value: 'duplicate' },
        { key: 'bare', value: '' },
      ]),
    );
    action('新增键值对').should('be.disabled');
    action('切换到列表编辑').click();
    cy.get(rows).should('have.length', 3);
    value(0).type('!');
    cy.get('[data-testid="kv-bulk"]').should('have.text', 'a: one:two!\na: duplicate\nbare: ');
  });
  it('accepts external nested JSON and bulk replacements and keeps subsequent edits working', () => {
    cy.contains('button', 'KV nested JSON').click();
    value(0).should('have.value', ' nested ').type('x');
    cy.get('[data-testid="kv-json"]').should('contain.text', ' nested x');
    cy.contains('button', 'KV replace JSON').click();
    key(0).should('have.value', 'external');
    value(0).should('have.value', ' changed ');
    cy.contains('button', 'KV replace bulk').click();
    cy.get(rows).should('have.length', 2);
    key(1).should('have.value', 'next');
    value(0).should('have.value', 'new: value').type('!');
    cy.get('[data-testid="kv-bulk"]').should('have.text', 'next: new: value!\nnext: duplicate');
  });
  it('keeps row drafts when callbacks are rejected and synchronizes a later external replacement', () => {
    cy.contains('button', 'KV accept').click();
    value(0).type('draft');
    value(0).should('have.value', '1draft');
    cy.get('[data-testid="kv-json"]').should(
      'have.text',
      JSON.stringify([
        { key: 'first', value: '1' },
        { key: 'second', value: '2' },
      ]),
    );
    cy.get('[data-testid="kv-bulk"]').should('have.text', 'first: 1\nsecond: 2');
    cy.contains('button', 'KV replace JSON').click();
    cy.get(rows).should('have.length', 1);
    value(0).should('have.value', ' changed ');
  });
  it('switches secret and bulk availability dynamically and forwards field disabling', () => {
    action('切换到 Bulk 编辑').click();
    cy.contains('button', 'KV secret').click();
    cy.get(`${main} textarea`).should('not.exist');
    value(0).should('have.attr', 'type', 'password');
    action('切换到 Bulk 编辑').should('not.exist');
    cy.contains('button', 'KV bulk permission').click();
    action('切换到 Bulk 编辑').click();
    cy.get(`${main} textarea`).should('have.value', 'first: 1\nsecond: 2');
    action('切换到列表编辑').click();
    cy.contains('button', 'KV field props').click();
    key(0).should('have.attr', 'placeholder', 'Custom key');
    value(0).should('have.attr', 'placeholder', 'Custom value').and('be.disabled');
    cy.contains('button', 'KV disabled').click();
    cy.get(`${rows} input`).should('be.disabled');
    action('新增键值对').should('be.disabled');
    action('清空键值对').should('be.disabled');
  });
  it('uses shared HTTP suggestions and lets keyProps replace the suggestion list', () => {
    cy.contains('button', 'KV headers').click();
    key(0).clear().type('Auth');
    cy.contains('.sd-select-option', 'Authorization').click();
    key(0).should('have.value', 'Authorization');
    cy.contains('button', 'KV field props').click();
    key(0).clear().type('X-');
    cy.contains('.sd-select-option', 'X-Custom').click();
    key(0).should('have.value', 'X-Custom');
  });
  it('replaces custom editors without losing the model or row action indices', () => {
    value(0).type('a');
    cy.contains('button', 'KV custom').click();
    cy.get('[data-testid="kv-custom-value"] input').first().should('have.value', '1a').type('b');
    cy.contains('button', 'KV custom').click();
    value(0).should('have.value', '1ab').type('c');
    cy.get('[data-testid="kv-json"]').should('contain.text', '1abc');
    cy.get(`${main} [data-testid="kv-action"]`).eq(1).should('have.text', '1:second');
  });
  it('edits uncontrolled defaults and releases the native root ref on unmount', () => {
    cy.get('[data-testid="kv-uncontrolled"] .sd-kv-list-value input')
      .should('have.value', 'local')
      .type('!');
    cy.get('[data-testid="kv-uncontrolled"] button[aria-label="切换到 Bulk 编辑"]').click();
    cy.get('[data-testid="kv-uncontrolled"] textarea').should('have.value', 'default: local!');
    cy.contains('button', 'KV ref').click();
    cy.get('[data-testid="kv-ref"]').should('have.text', 'DIV');
    cy.contains('button', 'KV mount').click();
    cy.contains('button', 'KV ref').click();
    cy.get('[data-testid="kv-ref"]').should('have.text', 'none');
  });
  let suppressCompatibilityMouseEvents = false;
  const startDrag = () => {
    // Sortable ignores pointerdown on a row that is still animating after a reorder.
    cy.get(rows)
      .first()
      .should(([$row]) => expect($row.style.transition).to.equal(''));
    cy.get(`${main} .sd-kv-list-drag-handle`)
      .first()
      .scrollIntoView()
      .then(($handle) => {
        const rect = $handle[0].getBoundingClientRect();
        const point = { clientX: rect.left + rect.width / 2, clientY: rect.top + rect.height / 2 };
        const win = $handle[0].ownerDocument.defaultView!;
        const down = new win.PointerEvent('pointerdown', {
          ...point,
          bubbles: true,
          cancelable: true,
          button: 0,
          pointerType: 'mouse',
          isPrimary: true,
        });
        $handle[0].dispatchEvent(down);
        suppressCompatibilityMouseEvents = down.defaultPrevented;
        cy.document().trigger('pointermove', {
          ...point,
          clientY: point.clientY + 5,
          eventConstructor: 'PointerEvent',
          pointerType: 'mouse',
        });
      });
    cy.get('.sortable-fallback').should('exist');
  };
  const moveDrag = () => {
    cy.get(rows)
      .last()
      .then(($row) => {
        const rect = $row[0].getBoundingClientRect();
        cy.document().trigger('pointermove', {
          clientX: rect.left + rect.width / 2,
          clientY: rect.bottom - 2,
          eventConstructor: 'PointerEvent',
          pointerType: 'mouse',
        });
      });
    cy.get(rows).last().find('input').first().should('have.value', 'first');
  };
  const endDrag = () => {
    cy.document().trigger('pointerup', { eventConstructor: 'PointerEvent', pointerType: 'mouse' });
    cy.then(() => {
      if (!suppressCompatibilityMouseEvents)
        cy.document().trigger('mouseup', { eventConstructor: 'MouseEvent' });
    });
    cy.get('.sortable-fallback').should('not.exist');
    cy.document().trigger('click', { eventConstructor: 'MouseEvent' });
  };
  it('reorders through real DOM drag events and edits the moved row', () => {
    cy.get(`${rows} .sd-kv-list-drag-handle button`)
      .first()
      .should('have.css', 'cursor', 'grab')
      .find('svg')
      .should('exist');
    startDrag();
    cy.get(`${rows}.sd-kv-list-row--chosen .sd-kv-list-drag-handle button`).should(
      'have.css',
      'cursor',
      'grabbing',
    );
    moveDrag();
    endDrag();
    cy.get('[data-testid="kv-json"]').should(
      'have.text',
      JSON.stringify([
        { key: 'second', value: '2' },
        { key: 'first', value: '1' },
      ]),
    );
    value(1).type('moved');
    cy.get('[data-testid="kv-bulk"]').should('have.text', 'second: 2\nfirst: 1moved');
    action('删除键值对').last().click();
    key(0).should('have.value', 'second');
  });
  it('rejects a pending reorder when disabled before release and destroys a live drag on unmount', () => {
    startDrag();
    moveDrag();
    cy.window().then((win) => win.dispatchEvent(new win.Event('kv-disable')));
    cy.get(`${rows} input`).should('be.disabled');
    endDrag();
    key(0).should('have.value', 'first');
    cy.get('[data-testid="kv-json"]').should(
      'have.text',
      JSON.stringify([
        { key: 'first', value: '1' },
        { key: 'second', value: '2' },
      ]),
    );
    cy.contains('button', 'KV disabled').click();
    key(0).should('not.be.disabled');
    startDrag();
    cy.window().then((win) => win.dispatchEvent(new win.Event('kv-unmount')));
    cy.get('.sortable-fallback').should('not.exist');
    cy.get(main).should('not.exist');
  });
});

export {};
