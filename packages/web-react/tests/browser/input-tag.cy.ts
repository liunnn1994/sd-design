describe('React InputTag', () => {
  beforeEach(() => cy.visit('/input-tag.html'));

  it('reorders keyed tags, cancels a pending leave on reinsertion and forwards native input events', () => {
    cy.clock();
    cy.contains('button', 'Reverse tag order').click();
    cy.get('[data-testid="tags-ordered"] .sd-tag b').then(($tags) =>
      expect([...$tags].map((tag) => tag.textContent)).to.deep.equal(['third', 'second', 'first']),
    );
    cy.get('[data-testid="tags-ordered"] .sd-tag-close-btn').last().click();
    cy.get('[data-testid="tags-ordered"] .input-tag-zoom-leave-active').should('exist');
    cy.contains('button', 'Restore tag order').click();
    cy.get('[data-testid="tags-ordered"] .input-tag-zoom-leave-active').should('not.exist');
    cy.tick(1000);
    cy.get('[data-testid="tags-ordered"] .sd-tag b').then(($tags) =>
      expect([...$tags].map((tag) => tag.textContent)).to.deep.equal(['first', 'second', 'third']),
    );
    cy.get('[data-testid="tags-ordered"] input')
      .should('have.attr', 'name', 'ordered-tags')
      .should('have.attr', 'maxlength', '8')
      .trigger('paste');
    cy.get('[data-testid="tag-events"]').should('contain.text', 'paste:INPUT');
  });

  it('merges native InputTag class and style without losing managed width', () => {
    cy.get('[data-testid="tags-mapped"] input')
      .should('have.class', 'custom-tag-input')
      .should('have.class', 'sd-input-tag-input')
      .should('have.css', 'color', 'rgb(12, 34, 56)');
    cy.get('[data-testid="tags-mapped"] input')
      .type('wider-input')
      .then(($input) => expect($input[0].getBoundingClientRect().width).to.be.greaterThan(30));
  });

  it('animates an initial tag when restored after its leave has finished', () => {
    cy.get('[data-testid="tags-ordered"] .sd-tag-close-btn').first().click();
    cy.get('[data-testid="tags-ordered"] .sd-tag').should('have.length', 2);
    cy.contains('button', 'Restore tag order').click();
    cy.get('[data-testid="tags-ordered"] .input-tag-zoom-enter-active').should('exist');
    cy.get('[data-testid="tags-ordered"] .sd-tag').should('have.length', 3);
  });

  it('creates unique tags, preserves event order, animates removal and clears the list', () => {
    cy.get('[data-testid="tags-basic"] .sd-tag').should('have.length', 2);
    cy.get('[data-testid="tags-basic"] input').type('three{enter}').should('have.value', '');
    cy.get('[data-testid="tags-basic"] .sd-tag').should('have.length', 3);
    cy.get('[data-testid="tag-events"]').should(
      'contain.text',
      'update:["one","two","three"]|change:["one","two","three"]|enter:three',
    );
    cy.get('[data-testid="tags-basic"] input').type('three{enter}').should('have.value', 'three');
    cy.get('[data-testid="tags-basic"] .sd-tag').should('have.length', 3);
    cy.get('[data-testid="tags-basic"] input').type('{backspace}').should('have.value', 'thre');
    cy.get('[data-testid="tags-basic"] .sd-tag').should('have.length', 3);
    cy.get('[data-testid="tags-basic"] input').clear().type('{backspace}');
    cy.get('[data-testid="tags-basic"] .input-tag-zoom-leave-active').should('exist');
    cy.get('[data-testid="tags-basic"] .sd-tag').should('have.length', 2);
    cy.get('[data-testid="tag-events"]').should('contain.text', 'remove:three');
    cy.get('[data-testid="tags-basic"] .sd-input-tag-clear-btn').click({ force: true });
    cy.get('[data-testid="tags-basic"] .sd-tag').should('not.exist');
    cy.get('[data-testid="tag-events"]').should('contain.text', 'update:[]|change:[]|clear');
  });

  it('keeps a disabled-input tag field focusable and restores its placeholder after clearing', () => {
    const root = () => cy.get('[data-testid="tags-disabled-input"]');
    root().find('input').should('have.prop', 'readOnly', true).and('not.be.disabled');
    root().find('input').should('not.have.attr', 'placeholder');
    root().find('input').focus();
    cy.press(Cypress.Keyboard.Keys.SPACE);
    root().find('input').should('have.value', '');
    root().should('have.class', 'sd-input-tag-focus');
    root().find('.sd-tag').should('have.length', 1).and('contain.text', 'Existing');
    root().find('input').blur();
    cy.get('[data-testid="tag-events"]').should(
      'have.text',
      'locked-input-focus|locked-input-blur',
    );
    root().find('.sd-input-tag-clear-btn').click({ force: true });
    root().find('.sd-tag').should('not.exist');
    root().find('input').should('have.attr', 'placeholder', 'Choose tags');
    cy.get('[data-testid="tag-events"]').should('contain.text', 'locked-input-change:[]');
  });

  it('restores controlled tag and input values and accepts external reset and release', () => {
    cy.get('[data-testid="tags-controlled"] input')
      .should('have.value', 'kept')
      .type('x')
      .should('have.value', 'kept');
    cy.get('[data-testid="tag-events"]').should('contain.text', 'input:keptx');
    cy.get('[data-testid="tags-controlled"] input').type('{enter}').should('have.value', 'kept');
    cy.get('[data-testid="tags-controlled"] .sd-tag').should('have.length', 1);
    cy.get('[data-testid="tag-events"]').should('contain.text', 'controlled:["fixed","kept"]');
    cy.contains('button', 'Reset tag input').click();
    cy.get('[data-testid="tags-controlled"] input').should('have.value', 'reset');
    cy.get('[data-testid="tags-external"] input').type('added{enter}');
    cy.get('[data-testid="tags-external"] .sd-tag').should('have.length', 2);
    cy.contains('button', 'Release tag model').click();
    cy.get('[data-testid="tags-external"] .sd-tag').should('not.exist');
  });

  it('preserves composition drafts until committed and configures retention and fit width', () => {
    cy.get('[data-testid="tags-retained"] input')
      .focus()
      .trigger('compositionstart', { data: '' })
      .invoke('val', '中文')
      .trigger('compositionupdate', { data: '中文' })
      .trigger('input')
      .trigger('keydown', { key: 'Enter' });
    cy.get('[data-testid="tags-retained"] .sd-tag').should('not.exist');
    cy.get('[data-testid="tags-retained"] input')
      .should('have.value', '中文')
      .trigger('compositionend', { data: '中文' })
      .type('{enter}')
      .should('have.value', '中文');
    cy.get('[data-testid="tags-retained"] .sd-tag').should('contain.text', '中文');
    cy.get('[data-testid="tags-retained"]')
      .should('have.class', 'sd-input-tag-fit-width')
      .should('have.class', 'sd-input-tag-has-prefix')
      .should('have.class', 'sd-input-tag-has-suffix');
    cy.get('[data-testid="tags-retained"] input')
      .type('longer-value')
      .then(($input) => {
        expect($input[0].getBoundingClientRect().width).to.be.greaterThan(30);
      });
    cy.get('[data-testid="tags-retained"] input').blur().should('have.value', '');
  });

  it('submits the initial default draft and retains a later draft only on blur', () => {
    const root = '[data-testid="tags-retain-blur"]';
    cy.get(`${root} input`).should('have.value', 'initial draft').type('{enter}');
    cy.get(`${root} .sd-tag`).should('have.length', 1).and('contain.text', 'initial draft');
    cy.get('[data-testid="tag-events"]').should('have.text', 'initial-draft:["initial draft"]');
    cy.get(`${root} input`).should('have.value', '').type('keep this').blur();
    cy.get(`${root} input`).should('not.be.focused').and('have.value', 'keep this');
    cy.get(`${root} .sd-tag`).should('have.length', 1);
  });

  it('keeps input focus and draft when switching tag overflow layouts and responds to resize', () => {
    cy.get(
      '[data-testid="tags-responsive"] .sd-input-tag-tag-counter > .sd-tag-text > .sd-ellipsis-content',
    ).should('have.text', '+2');
    cy.contains('button', 'Focus tag input').click();
    cy.get('[data-testid="tags-responsive"] input')
      .should('be.focused')
      .should('have.value', 'draft');
    cy.contains('button', 'Toggle tag layout').click();
    cy.get('[data-testid="tags-responsive"]').should('have.class', 'sd-input-tag-responsive');
    cy.get('[data-testid="tags-responsive"] input')
      .should('be.focused')
      .should('have.value', 'draft');
    cy.get('[data-testid="tags-responsive"] .sd-input-tag-tag-counter:visible').should('exist');
    cy.contains('button', 'Resize tags').click();
    cy.get('[data-testid="tags-responsive"] .sd-input-tag-tag-counter:visible').should('not.exist');
    cy.get('[data-testid="tags-responsive"] .sd-input-tag-item-holder:visible').should(
      'have.length',
      4,
    );
    cy.contains('button', 'Toggle tag layout').click();
    cy.get('[data-testid="tags-responsive"] input')
      .should('be.focused')
      .should('have.value', 'draft');
  });

  it('maps tag fields, skips locked tags, honors readonly and composes FormItem context', () => {
    cy.get('[data-testid="tags-mapped"] .sd-tag')
      .first()
      .should('contain.text', 'Label:Mapped')
      .should('have.class', 'sd-tag-red');
    cy.get('[data-testid="tags-mapped"] .sd-tag-close-btn').click();
    cy.get('[data-testid="tag-events"]').should('contain.text', 'mapped-close');
    cy.get('[data-testid="tags-mapped"] .sd-tag').should('have.length', 1);
    cy.get('[data-testid="tags-mapped"] input').type('{backspace}');
    cy.get('[data-testid="tags-mapped"] .sd-tag').should('have.length', 1);
    cy.get('[data-testid="tags-readonly"] .sd-tag-close-btn').should('not.exist');
    cy.get('[data-testid="tags-readonly"] .sd-input-tag-clear-btn').should('not.exist');
    cy.get('[data-testid="tags-readonly"] input').trigger('keydown', { key: 'Backspace' });
    cy.contains('[role="tooltip"]', 'Tags are locked').should('be.visible');
    cy.get('[data-testid="tags-disabled"] input').should('be.disabled');
    cy.get('[data-testid="tags-uninjected"] input').should('not.be.disabled');
    cy.get('[data-testid="tags-uninjected"]')
      .should('have.class', 'sd-input-tag-size-small')
      .find('.sd-input-tag-clear-btn')
      .should('exist');
    cy.get('[data-testid="tags-form"] input').type('valid{enter}');
    cy.get('[data-testid="tags-form"] .sd-input-tag-clear-btn').click({ force: true });
    cy.contains('Tags required').should('be.visible');
  });

  it('keeps a user value matching the overflow counter key removable', () => {
    const root = () => cy.get('[data-testid="tags-counter-identity"]');
    root().find('.sd-input-tag-tag-counter').should('have.length', 1).and('contain.text', '+1');
    root()
      .find('.sd-input-tag-tag')
      .first()
      .should('contain.text', '__sd__more')
      .and('not.have.class', 'sd-input-tag-tag-counter')
      .find('.sd-tag-close-btn')
      .click();
    root().find('.sd-input-tag-tag-counter').should('not.exist');
    root().find('.sd-input-tag-tag').should('have.length', 2).and('contain.text', 'hidden');
    cy.get('[data-testid="tag-events"]').should('have.text', 'counter:["second","hidden"]');
  });

  it('ignores Backspace during composition and skips tags with a closability override', () => {
    const root = () => cy.get('[data-testid="tags-removal"]');
    root().find('input').focus().trigger('compositionstart');
    root().find('input').trigger('keydown', { key: 'Backspace', isComposing: true });
    root().find('.sd-input-tag-tag').should('have.length', 2);
    cy.get('[data-testid="tag-events"]').should('be.empty');
    root().find('input').trigger('compositionend', { data: '' }).type('{backspace}{backspace}');
    root().find('.sd-input-tag-tag').should('have.length', 1).and('contain.text', 'Locked');
    cy.get('[data-testid="tag-events"]').should('have.text', 'boundary:removable');
  });

  it('updates prefix and suffix layout without blurring or clearing the draft', () => {
    const root = '[data-testid="tags-retained"]';
    cy.get(`${root} input`).type('draft');
    for (const addon of ['prefix', 'suffix']) {
      const selector = `${root} .sd-input-tag-${addon}`;
      cy.contains('button', `Toggle tag ${addon}`).click();
      cy.get(selector).should('not.exist');
      cy.get(root).should('not.have.class', `sd-input-tag-has-${addon}`);
      cy.contains('button', `Toggle tag ${addon}`).click();
      cy.get(selector).should('be.visible');
      cy.get(root).should('have.class', `sd-input-tag-has-${addon}`);
      cy.get(`${root} input`).should('be.focused').and('have.value', 'draft');
    }
  });

  it('uses replaced field names for labels, duplicate detection and removal', () => {
    const root = '[data-testid="tags-live-mapping"]';
    cy.get(`${root} .sd-tag`).should('contain.text', 'Default label');
    cy.contains('button', 'Change tag mapping').click();
    cy.get(`${root} .sd-tag`).should('contain.text', 'Mapped label');
    cy.get(`${root} input`).type('existing{enter}').should('have.value', 'existing');
    cy.get(`${root} .sd-tag`).should('have.length', 1);
    cy.get('[data-testid="tag-events"]').should('have.text', 'mapped-enter:existing');
    cy.get(`${root} input`).clear().type('new{enter}');
    cy.get(`${root} .sd-tag`).should('have.length', 2);
    cy.get(`${root} .sd-tag`).first().find('.sd-tag-close-btn').click();
    cy.get(`${root} .sd-tag`).should('have.length', 1).and('contain.text', 'new');
    cy.get('[data-testid="tag-events"]').should('contain.text', 'mapped-remove:existing');
  });

  it('guards a tag with a closability override while disabled or readonly', () => {
    const root = '[data-testid="tags-guarded"]';
    cy.contains('button', 'Disable guarded tags').click();
    cy.get(`${root} input`).should('be.disabled');
    cy.get(`${root} .sd-tag-close-btn`).should('not.exist');
    cy.contains('button', 'Make guarded tags readonly').click();
    cy.get(`${root} input`).should('have.attr', 'readonly');
    cy.get(`${root} input`).focus().trigger('keydown', { key: 'Backspace' });
    cy.get(`${root} .sd-tag-close-btn`).should('not.exist');
    cy.get(`${root} .sd-tag`).should('have.length', 1).and('contain.text', 'Keep');
    cy.get('[data-testid="tag-events"]').should('be.empty');
    cy.contains('button', 'Enable guarded tags').click();
    cy.get(`${root} .sd-tag-close-btn`).click();
    cy.get(`${root} .sd-tag`).should('not.exist');
    cy.get('[data-testid="tag-events"]').should('have.text', 'guarded:keep');
  });
});
