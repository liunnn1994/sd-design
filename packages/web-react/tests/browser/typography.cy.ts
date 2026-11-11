import { checkComponentDocs } from './docs-contract';

describe('Typography', () => {
  beforeEach(() => cy.visit('/'));
  it('renders semantic roots, formatting and escaped rich text', () => {
    cy.get('[data-testid="typography-fixture"] article h3').should('have.text', 'Title');
    cy.get('[data-testid="typography-fixture"] blockquote').should(
      'have.class',
      'sd-typography-spacing-close',
    );
    cy.get('[data-testid="typography-fixture"] span.sd-typography-danger mark code del u b').should(
      'have.text',
      'Formatting',
    );
    cy.get('[data-testid="ty-escape"] > [data-part="content"] > [data-part="body"]').should(
      'contain.text',
      '<img src=x onerror=alert(1)>',
    );
    cy.get('[data-testid="ty-escape"] img, [data-testid="ty-escape"] [data-injected]').should(
      'not.exist',
    );
  });
  it('copies live contextual children and preserves interactive child identity', () => {
    cy.get('[data-testid="ty-context-clamp"] > [data-part="content"] > [data-part="body"]').should(
      'have.text',
      'Original',
    );
    cy.get('[aria-label="Typography draft"]')
      .type('draft')
      .then((el) => cy.wrap({ node: el[0] }).as('draft', { type: 'static' }));
    cy.contains('button', 'Typography update').click();
    cy.get('[data-testid="ty-context-clamp"] > [data-part="content"] > [data-part="body"]').should(
      'have.text',
      'Updated',
    );
    cy.get<{ node: HTMLElement }>('@draft').then((saved) =>
      cy
        .get('[aria-label="Typography draft"]')
        .should('have.value', 'draft')
        .and('be.focused')
        .and((el) => expect(el[0]).to.equal(saved.node)),
    );
    cy.get('[data-testid="ty-copy"] [role="button"]').click();
    cy.get('[data-testid="ty-copied"]').should('have.text', 'Updated');
    cy.get('[data-testid="ty-context-clamp"] > [data-part="content"] [role="button"]').click();
    cy.get('[data-testid="ty-copied"]').should('have.text', 'Updated');
  });
  it('edits controlled text with ordered events and ignores composing Enter', () => {
    cy.get('[data-testid="ty-edit"] [role="button"]').focus().type('{enter}');
    cy.get('.sd-typography-edit-content input').should('have.value', 'Editable').and('be.focused');
    cy.get('[data-testid="ty-events"]').should('have.text', 'editing:true|start');
    cy.get('.sd-typography-edit-content input').clear().type('changed');
    cy.get('.sd-typography-edit-content input').trigger('keydown', {
      key: 'Enter',
      isComposing: true,
    });
    cy.get('.sd-typography-edit-content').should('exist');
    cy.get('.sd-typography-edit-content input').type('{enter}');
    cy.get('[data-testid="ty-edit"]').should('contain.text', 'changed');
    cy.get('[data-testid="ty-events"]').should(
      'contain.text',
      'text:changed|change:changed|editing:false|end',
    );
    cy.contains('button', 'Typography accept').click();
    cy.get('[data-testid="ty-edit"] [role="button"]').click();
    cy.get('.sd-typography-edit-content input').type('x').should('have.value', 'changed');
  });
  it('expands and collapses formatted text and removes stale title and controls', () => {
    cy.get('[data-testid="ty-clamp"]').should('have.attr', 'title');
    cy.get('[data-testid="ty-clamp"] [data-part="content"] mark code').should('exist');
    cy.get('[data-testid="ty-clamp"] > [data-part="content"] .sd-typography-operation-expand')
      .click()
      .should('have.attr', 'aria-expanded', 'true');
    cy.get('[data-testid="ty-clamp"]').should('not.have.attr', 'title');
    cy.get('[data-testid="ty-clamp"]').should('contain.text', 'More content here.');
    cy.contains('button', 'Typography ellipsis').click();
    cy.get('[data-testid="ty-clamp"]').should('not.have.attr', 'title');
    cy.get('[data-testid="ty-clamp"] .sd-typography-operation-expand').should('not.exist');
  });
  it('anchors ellipsis tooltips to the actual root and disables them for short text', () => {
    cy.get('[data-testid="ty-tooltip"]').trigger('mouseover');
    cy.get('[role="tooltip"]')
      .should('be.visible')
      .and('contain.text', 'The full long tooltip source content');
    cy.get('[data-testid="ty-tooltip"]').trigger('mouseout');
    cy.contains('button', 'Typography short').click();
    cy.get('[data-testid="ty-tooltip"] > [data-part="content"] > [data-part="body"]').should(
      'have.text',
      'short',
    );
    cy.get('[data-testid="ty-tooltip"]').trigger('mouseover');
    cy.get('[role="tooltip"]').should('not.exist');
  });
  it('uses explicit copy text and custom feedback and resets its copy timer', () => {
    cy.get('[data-testid="ty-custom"] [role="button"]')
      .should('have.text', 'copy-custom')
      .focus()
      .type(' ');
    cy.get('[data-testid="ty-copied"]').should('have.text', 'explicit');
    cy.get('[data-testid="ty-custom"] [role="button"]').should('have.text', 'done');
    cy.clock(Date.now(), ['setTimeout', 'clearTimeout']);
    cy.get('[data-testid="ty-copy"] [role="button"]').click();
    cy.tick(300);
    cy.get('[data-testid="ty-copy"] .sd-typography-operation-copied').click();
    cy.tick(300);
    cy.get('[data-testid="ty-copy"] .sd-typography-operation-copied').should('exist');
    cy.tick(200);
    cy.get('[data-testid="ty-copy"] .sd-typography-operation-copy').should('exist');
  });
  it('measures default editing children before focusing at the end and finishes on blur', () => {
    cy.contains('button', 'Typography initial').click();
    cy.get('.sd-typography-edit-content input')
      .should('have.value', 'Initial child text')
      .and('be.focused')
      .and('have.prop', 'selectionStart', 18);
    cy.get('.sd-typography-edit-content input').blur();
    cy.get('.sd-typography-edit-content').should('not.exist');
    cy.contains('button', 'Typography initial').click();
  });
  it('honors rejected controlled editing and clears its root ref while editing', () => {
    cy.get('[data-testid="ty-controlled"] [role="button"]').click().click();
    cy.get('.sd-typography-edit-content').should('not.exist');
    cy.get('[data-testid="ty-events"]').should('have.text', 'controlled:true|controlled:true');
    cy.contains('button', 'Typography read ref').click();
    cy.get('[data-testid="ty-ref"]').should('have.text', 'DIV');
    cy.contains('button', 'Typography allow editing').click();
    cy.get('[data-testid="ty-controlled"] [role="button"]').click();
    cy.get('.sd-typography-edit-content input').should('be.focused');
    cy.contains('button', 'Typography read ref').click();
    cy.get('[data-testid="ty-ref"]').should('have.text', 'null');
    cy.get('.sd-typography-edit-content input').type('{enter}');
    cy.get('[data-testid="ty-controlled"]').should('exist');
  });
  it('supports popover configuration for the full source', () => {
    cy.get('[data-testid="ty-popover"]').trigger('mouseover');
    cy.get('.sd-popover-content')
      .should('be.visible')
      .and('contain.text', 'A long paragraph inside a popover');
    cy.get('.sd-popover-title').should('have.text', 'Full source');
  });
});

describe('Typography documentation', () => {
  it('documents shared typography scenes and framework navigation', () =>
    checkComponentDocs('typography'));
});
