describe('React affix', () => {
  beforeEach(() => cy.visit('/affix.html'));

  it('affixes to a real scroll target, preserves resized content space and follows outer scrolling', () => {
    cy.contains('button', '加载固钉夹具').click();
    cy.get('[data-testid="affix-wrapper"] .sd-affix').should('not.exist');
    cy.get('#affix-first').scrollTo(0, 120);
    const checkTop = (offset: number) =>
      cy.get('[data-testid="affix-wrapper"]').should(($wrapper) => {
        const target = $wrapper[0].ownerDocument.querySelector('#affix-first')!;
        const fixed = $wrapper[0].querySelector('.sd-affix')!;
        expect(fixed.getBoundingClientRect().top).to.be.closeTo(
          target.getBoundingClientRect().top + offset,
          1,
        );
        expect(fixed.getBoundingClientRect().width).to.be.closeTo(
          $wrapper[0].getBoundingClientRect().width,
          1,
        );
      });
    checkTop(10);
    cy.get('[data-testid="affix-events"]').should('have.text', 'true');
    cy.contains('button', '改变固钉偏移').click();
    checkTop(30);
    cy.get('#affix-outer').scrollTo(0, 50);
    checkTop(30);
    cy.contains('button', '改变固钉高度').click();
    cy.get('[data-testid="affix-wrapper"] .sd-affix').prev().should('have.css', 'height', '90px');
    cy.contains('button', '改变固钉宽度').click();
    cy.get('#affix-outer').should('have.css', 'width', '340px');
    checkTop(30);
    cy.get('[data-testid="affix-events"]').should('have.text', 'true');
    cy.get('#affix-first').scrollTo(0, 0);
    cy.get('[data-testid="affix-wrapper"] .sd-affix').should('not.exist');
    cy.get('[data-testid="affix-events"]').should('have.text', 'true,false');
  });

  it('uses bottom offsets in preference to top offsets and releases after scrolling into view', () => {
    cy.contains('button', '加载固钉夹具').click();
    cy.contains('button', '切换底部固钉').click();
    const checkBottom = () =>
      cy.get('[data-testid="affix-wrapper"]').should(($wrapper) => {
        const target = $wrapper[0].ownerDocument.querySelector('#affix-first')!;
        const fixed = $wrapper[0].querySelector('.sd-affix')!;
        expect(fixed.getBoundingClientRect().bottom).to.be.closeTo(
          target.getBoundingClientRect().bottom - 15,
          1,
        );
      });
    checkBottom();
    cy.contains('button', '改变固钉高度').click();
    cy.get('[data-testid="affix-wrapper"] .sd-affix').prev().should('have.css', 'height', '90px');
    checkBottom();
    cy.contains('button', '改变固钉高度').click();
    cy.get('[data-testid="affix-wrapper"] .sd-affix').prev().should('have.css', 'height', '40px');
    cy.get('#affix-first').scrollTo(0, 250);
    cy.get('[data-testid="affix-wrapper"] .sd-affix').should('not.exist');
  });

  it('rebinds Affix targets, refreshes position through its ref and cleans up listeners', () => {
    cy.contains('button', '加载固钉夹具').click();
    cy.get('#affix-first').scrollTo(0, 120);
    cy.get('#affix-first').then(($target) => {
      cy.spy($target[0], 'removeEventListener').as('oldAffixOff');
    });
    cy.contains('button', '切换固钉目标').click();
    cy.get('@oldAffixOff')
      .should('have.been.calledWith', 'scroll')
      .and('have.been.calledWith', 'resize');
    const checkTarget = () =>
      cy.get('[data-testid="affix-wrapper"]').should(($wrapper) => {
        const target = $wrapper[0].ownerDocument.querySelector('#affix-second')!;
        expect($wrapper[0].querySelector('.sd-affix')!.getBoundingClientRect().top).to.be.closeTo(
          target.getBoundingClientRect().top + 10,
          1,
        );
      });
    checkTarget();
    cy.get('#affix-second').invoke('css', 'transform', 'translateY(25px)');
    cy.contains('button', '刷新固钉位置').click();
    checkTarget();
    cy.get('#affix-second').then(($target) => {
      cy.spy($target[0], 'removeEventListener').as('targetAffixOff');
    });
    cy.get('#affix-outer').then(($target) => {
      cy.spy($target[0], 'removeEventListener').as('outerAffixOff');
    });
    cy.contains('button', '卸载固钉夹具').click();
    cy.get('@targetAffixOff')
      .should('have.been.calledWith', 'scroll')
      .and('have.been.calledWith', 'resize');
    cy.get('@outerAffixOff')
      .should('have.been.calledWith', 'scroll')
      .and('have.been.calledWith', 'resize');
    cy.get('[data-testid="affix-wrapper"]').should('not.exist');
    cy.get('[data-testid="affix-events"]').should('have.text', 'true');
  });
});
