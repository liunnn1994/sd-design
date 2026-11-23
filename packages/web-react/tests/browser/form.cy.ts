describe('React form', () => {
  beforeEach(() => cy.visit('/form.html'));

  it('validates only the requested field and clears its error without resetting the model', () => {
    cy.contains('button', 'Validate name').click();
    cy.get('[data-testid="form-result"]').should(($result) => {
      const errors = JSON.parse($result.text());
      expect(Object.keys(errors)).to.deep.equal(['first']);
      expect(errors.first.message).to.equal('Name required');
    });
    cy.get('[role="alert"]').should('have.length', 1).and('have.text', 'Name required');
    cy.contains('button', 'Clear form').click();
    cy.get('[role="alert"]').should('not.exist');
    cy.get('[data-testid="form-model"]').should(
      'have.text',
      '{"first":"","second":"initial","agree":false}',
    );
    cy.contains('button', 'Validate form').click();
    cy.get('[data-testid="nested-form-item"] [role="alert"]').should(
      'have.text',
      'Agreement required',
    );
  });

  it('focuses the field through its label after a field path changes', () => {
    cy.contains('label', 'Name').click();
    cy.get('form input').should('be.focused');
    cy.contains('button', 'Rename form field').click();
    cy.contains('label', 'Replacement name').click();
    cy.get('form input').should('be.focused').and('have.value', 'initial');
  });

  it('registers a field assigned after mount and removes it when its path is cleared', () => {
    cy.visit('/form.html?scenario=dynamic-field');
    cy.contains('button', 'Assign form field').click();
    cy.contains('button', 'Validate form').click();
    cy.get('[role="alert"]').should('have.text', 'Name required');
    cy.get('[data-testid="form-result"]').should('contain.text', '"field":"first"');

    cy.contains('button', 'Clear field path').click();
    cy.get('[role="alert"]').should('not.exist');
    cy.contains('button', 'Validate form').click();
    cy.get('[data-testid="form-result"]').should('have.text', 'null');

    cy.contains('button', 'Assign form field').click();
    cy.contains('button', 'Validate form').click();
    cy.get('[role="alert"]').should('have.text', 'Name required');
    cy.get('[data-testid="form-result"]').should('contain.text', '"field":"first"');
  });

  it('clears the old error and resets the replacement field to its own initial value', () => {
    cy.visit('/form.html?scenario=dynamic-field');
    cy.contains('button', 'Assign form field').click();
    cy.contains('button', 'Validate form').click();
    cy.get('[role="alert"]').should('have.text', 'Name required');

    cy.contains('button', 'Rename form field').click();
    cy.get('[role="alert"]').should('not.exist');
    cy.get('form input').should('have.value', 'initial').clear().type('Edited');
    cy.contains('button', 'Reset form').click();
    cy.get('form input').should('have.value', 'initial');
  });

  it('routes the label to the explicitly supplied native target', () => {
    cy.visit('/form.html?scenario=label-target');
    cy.contains('label', 'Name').should('have.attr', 'for', 'alternate-name').click();
    cy.get('input[aria-label="Alternate name"]').should('be.focused');
  });

  it('validates Form controls after model commits and propagates nested errors and disabled state', () => {
    cy.get('[data-testid="form-fixture"]').within(() => {
      cy.contains('button', 'Validate form').click();
      cy.contains('[role="alert"]', 'Name required').should('be.visible');
      cy.contains('[role="alert"]', 'Name required').should(
        'not.have.class',
        'form-blink-enter-active',
      );
      cy.get('[data-testid="nested-form-item"] [role="alert"]').should(
        'have.text',
        'Agreement required',
      );
      cy.get('input').type('Ada');
      cy.contains('[role="alert"]', 'Name required').should('not.exist');
      cy.get('[aria-label="Form agreement"]').click();
      cy.get('[data-testid="nested-form-item"] [role="alert"]').should('not.exist');
      cy.get('label')
        .contains('Name')
        .invoke('attr', 'for')
        .then((id) => cy.get('input').should('have.attr', 'id', id));
      cy.get('[data-testid="form-inherited-button"]').should('have.class', 'sd-btn-size-small');
      cy.contains('button', 'Disable form').click();
      cy.get('input').should('be.disabled');
      cy.get('[role="switch"]').should('be.disabled');
      cy.get('[data-testid="form-inherited-button"]').should('be.disabled');
      cy.contains('button', 'Disable form').click();
      cy.contains('button', 'Submit form').click();
      cy.get('[data-testid="form-events"]').should('have.text', 'success,submit');
    });
  });

  it('accumulates Form setFields writeback and resets all initial snapshots', () => {
    cy.get('[data-testid="form-fixture"]').within(() => {
      cy.contains('button', 'Set form fields').click();
      cy.get('[data-testid="form-model"]').should(
        'have.text',
        '{"first":"set first","second":"set second","agree":true}',
      );
      cy.contains('[role="alert"]', 'Server first').should('be.visible');
      cy.contains('button', 'Reset form').click();
      cy.get('[data-testid="form-model"]').should(
        'have.text',
        '{"first":"","second":"initial","agree":false}',
      );
      cy.get('[role="alert"]').should('not.exist');
      cy.contains('button', 'Rename form field').click();
      cy.get('input').should('have.value', 'initial').clear().type('changed');
      cy.contains('button', 'Reset form').click();
      cy.get('input').should('have.value', 'initial');
    });
  });

  it('cleans up nested Form errors and registration on unmount', () => {
    cy.get('[data-testid="form-fixture"]').within(() => {
      cy.contains('button', 'Validate form').click();
      cy.get('[data-testid="nested-form-item"] [role="alert"]').should('exist');
      cy.contains('button', 'Toggle nested field').click();
      cy.get('[data-testid="nested-form-item"] [role="alert"]').should('not.exist');
      cy.get('input').type('Valid');
      cy.contains('button', 'Validate form').click();
      cy.get('[data-testid="form-result"]').should('have.text', 'null');
    });
  });

  it('invalidates late Form validation UI while preserving the validation result and submit snapshot', () => {
    cy.get('[data-testid="form-fixture"]').within(() => {
      cy.get('input').type('Original');
      cy.contains('button', 'Slow form validator').click();
      cy.contains('button', 'Validate name').click();
      cy.contains('button', 'Clear form').click();
      cy.contains('button', 'Finish form validator').click();
      cy.get('[data-testid="form-result"]').should('contain.text', 'Late error');
      cy.contains('[role="alert"]', 'Late error').should('not.exist');
      cy.contains('button', 'Submit form').click();
      cy.get('input').clear().type('Changed');
      cy.contains('button', 'Finish form validator').click();
      cy.get('[data-testid="form-result"]').should('contain.text', 'Original');
      cy.get('[data-testid="form-events"]').should('have.text', 'failed,submit');
    });
  });

  it('scrolls to an escaped field id and forwards invalid-submit scroll options', () => {
    cy.get('.sd-form-item-wrapper-col')
      .first()
      .then(([$field]) => {
        expect($field.id).to.contain('123:form');
        cy.stub($field, 'scrollIntoView').as('scroll');
      });
    cy.contains('button', 'Scroll to name').click();
    cy.get('@scroll').should('have.been.calledOnceWithExactly', {
      behavior: 'smooth',
      block: 'nearest',
    });
    cy.contains('button', 'Submit form').click();
    cy.get('[data-testid="form-events"]').should('have.text', 'failed,submit');
    cy.get('@scroll').should('have.been.calledWithExactly', {
      behavior: 'instant',
      block: 'nearest',
    });
  });

  it('keeps an assigned field error when an older successful validation finishes', () => {
    cy.get('[data-testid="form-fixture"] input').type('Original');
    cy.contains('button', 'Slow form validator').click();
    cy.contains('button', 'Validate name').click();
    cy.get('[data-testid="form-result"]').should('have.text', 'Pending');
    cy.contains('button', 'Set form fields').click();
    cy.contains('[role="alert"]', 'Server first').should('be.visible');
    cy.contains('button', 'Approve form validator').click();
    cy.get('[data-testid="form-result"]').should('have.text', 'null');
    cy.contains('[role="alert"]', 'Server first').should('be.visible');
    cy.contains('button', 'Clear form').click();
    cy.get('[role="alert"]').should('not.exist');
    cy.get('[data-testid="form-fixture"] input').should('have.value', 'set first');
  });

  it('keeps the latest error when two validations finish in reverse order', () => {
    cy.get('input').type('Original');
    cy.contains('button', 'Slow form validator').click();
    cy.contains('button', 'Validate name').click();
    cy.get('input').clear().type('Current');
    cy.contains('button', 'Validate name').click();
    cy.contains('button', 'Finish newest validation').click();
    cy.contains('[role="alert"]', 'Current error').should('be.visible');
    cy.get('[data-testid="form-result"]').should('contain.text', '"value":"Current"');
    cy.contains('button', 'Approve form validator').click();
    cy.get('[data-testid="form-result"]').should('have.text', 'null');
    cy.contains('[role="alert"]', 'Current error').should('be.visible');
  });

  it('returns the original field and label when the path changes during validation', () => {
    cy.get('input').type('Original');
    cy.contains('button', 'Slow form validator').click();
    cy.contains('button', 'Validate name').click();
    cy.contains('button', 'Rename form field').click();
    cy.get('label').contains('Replacement name').should('be.visible');
    cy.contains('button', 'Finish form validator').click();
    cy.get('[data-testid="form-result"]').should(($result) => {
      const errors = JSON.parse($result.text());
      expect(Object.keys(errors)).to.deep.equal(['first']);
      expect(errors.first).to.include({
        field: 'first',
        label: 'Name',
        value: 'Original',
        message: 'Late error',
      });
    });
    cy.get('[role="alert"]').should('not.exist');
    cy.get('input').should('have.value', 'initial');
  });

  it('retains the validation result but drops the nested error after a field unmounts', () => {
    cy.visit('/form.html?scenario=nested');
    cy.get('input').type('Valid');
    cy.contains('button', 'Validate form').click();
    cy.contains('button', 'Toggle nested field').click();
    cy.get('[aria-label="Form agreement"]').should('not.exist');
    cy.contains('button', 'Finish form validator').click();
    cy.get('[data-testid="form-result"]').should('contain.text', '"field":"agree"');
    cy.get('[data-testid="nested-form-item"] [role="alert"]').should('not.exist');
    cy.contains('button', 'Validate form').click();
    cy.get('[data-testid="form-result"]').should('have.text', 'null');
  });

  it('reports a rejected validator on native submit and succeeds after correcting the input', () => {
    cy.visit('/form.html?scenario=rejection');
    cy.get('input').type('bad');
    cy.get('[aria-label="Form agreement"]').click();
    cy.contains('button', 'Submit form').click();
    cy.get('[data-testid="form-events"]').should('have.text', 'failed,submit');
    cy.contains('[role="alert"]', 'Validation unavailable').should('be.visible');
    cy.get('input').clear().type('good');
    cy.contains('button', 'Submit form').click();
    cy.get('[data-testid="form-events"]').should('have.text', 'failed,submit,success,submit');
    cy.get('[role="alert"]').should('not.exist');
  });

  for (const outcome of ['success', 'failure']) {
    it(`suppresses submission events after unmount when validation resolves to ${outcome}`, () => {
      cy.get('input').type('Original');
      cy.get('[aria-label="Form agreement"]').click();
      cy.contains('button', 'Slow form validator').click();
      cy.contains('button', 'Submit form').click();
      cy.contains('button', 'Toggle form').click();
      cy.get('form').should('not.exist');
      cy.contains(
        'button',
        outcome === 'success' ? 'Approve form validator' : 'Finish form validator',
      ).click();
      cy.window().then((win) => new Promise((resolve) => win.requestAnimationFrame(resolve)));
      cy.get('[data-testid="form-events"]').should('be.empty');
    });
  }
});
