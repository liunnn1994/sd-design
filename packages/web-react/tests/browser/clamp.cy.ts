describe('React clamp', () => {
  beforeEach(() => cy.visit('/clamp.html'));

  it('keeps RichLineClamp DOM and imperative refs separate across root replacement and unmount', () => {
    cy.get('[data-testid="rich-root-ref"]').should('have.prop', 'tagName', 'DIV');
    cy.contains('button', '读取截断引用').click();
    cy.get('[data-testid="rich-root-status"]').should('have.text', 'DIV:function');
    cy.contains('button', '引用展开').click();
    cy.get('[data-testid="rich-root-ref"]').should((element) =>
      expect(element[0].getBoundingClientRect().height).to.be.greaterThan(60),
    );
    cy.contains('button', '替换截断标签').click();
    cy.get('[data-testid="rich-root-ref"]').should('have.prop', 'tagName', 'ARTICLE');
    cy.contains('button', '读取截断引用').click();
    cy.get('[data-testid="rich-root-status"]').should('have.text', 'ARTICLE:function');
    cy.contains('button', '卸载截断引用').click();
    cy.get('[data-testid="rich-root-ref"]').should('not.exist');
    cy.contains('button', '读取截断引用').click();
    cy.get('[data-testid="rich-root-status"]').should('have.text', 'null:undefined');
  });

  it('clamps inline filename bodies while preserving affixes through resize and source replacement', () => {
    cy.get('[data-testid="inline-split"] [data-part="start"]').should('have.text', '/docs/');
    cy.get('[data-testid="inline-split"] [data-part="end"]').should('have.text', '.pdf');
    cy.get('[data-testid="inline-split"] [data-part="body"]')
      .should('have.attr', 'aria-hidden', 'true')
      .and('contain.text', '…');
    cy.get('[data-testid="inline-split"] [data-part="body"]')
      .invoke('text')
      .then((initial) => {
        cy.contains('button', '切换文本宽度').click();
        cy.get('[data-testid="inline-split"] [data-part="body"]').should(($body) =>
          expect($body.text().length).to.be.greaterThan(initial.length),
        );
      });
    cy.contains('button', '切换纯文本').click();
    cy.get('[data-testid="inline-split"] [data-part="body"]')
      .should('have.text', 'Short')
      .and('not.have.attr', 'aria-hidden');
    cy.get('[data-testid="inline-native"] [data-part="body"]').should(
      'have.css',
      'text-overflow',
      'ellipsis',
    );
  });

  it('measures plain line limits and resets when source text changes', () => {
    cy.get('[data-testid="line-clamped"]').should('have.text', 'true');
    cy.get('[data-testid="line-native"]').should(($root) =>
      expect($root[0].getBoundingClientRect().height).to.be.at.most(41),
    );
    cy.contains('button', '展开纯文本').click();
    cy.get('[data-testid="line-native"]').should(($root) =>
      expect($root[0].getBoundingClientRect().height).to.be.greaterThan(80),
    );
    cy.contains('button', '收起纯文本').click();
    cy.get('[data-testid="line-clamped"]').should('have.text', 'true');
    cy.contains('button', '切换纯文本').click();
    cy.get('[data-testid="line-native"] [data-part="body"]').should('have.text', 'Short');
    cy.get('[data-testid="line-clamped"]').should('have.text', 'false');
  });

  it('preserves accessible source text while truncating the middle and expanding affix controls', () => {
    cy.get('[data-testid="line-middle"] [aria-hidden="true"]')
      .should('contain.text', '[cut]')
      .and('contain.text', 'START')
      .and('contain.text', 'END');
    cy.get('[data-testid="line-middle"] [data-part="body"] > span:not([aria-hidden])').should(
      'contain.text',
      'unicode families.',
    );
    cy.contains('button', '展开中部').click();
    cy.get('[data-testid="line-middle"] [aria-hidden="true"]').should('not.exist');
    cy.get('[data-testid="line-middle"]').should(($root) =>
      expect($root[0].getBoundingClientRect().height).to.be.greaterThan(80),
    );
    cy.contains('button', '折叠中部').click();
    cy.get('[data-testid="line-middle"] [aria-hidden="true"]').should('contain.text', '[cut]');
  });

  it('recomputes start truncation on resize and honors a height-only limit', () => {
    cy.get('[data-testid="line-height"]').should(($root) =>
      expect($root[0].getBoundingClientRect().height).to.be.at.most(41),
    );
    cy.get('[data-testid="line-start"] [aria-hidden="true"]')
      .should('contain.text', '[cut]')
      .and('contain.text', 'END')
      .and('not.contain.text', 'START')
      .invoke('text')
      .then((initial) => {
        cy.contains('button', '切换文本宽度').click();
        cy.get('[data-testid="line-start"] [aria-hidden="true"]').should(($text) =>
          expect($text.text().length).to.be.greaterThan(initial.length),
        );
      });
  });

  it('keeps unsafe rich probe content unmodified instead of cloning active form controls', () => {
    cy.get('[data-testid="rich-unsafe-clamp"]').should('not.contain.text', '[more]');
    cy.get('[data-testid="rich-unsafe-clamp"] button[type="submit"]')
      .should('have.length', 1)
      .and('have.text', '保留原始按钮');
  });

  it('measures rich text, expands through its ref and recomputes after content replacement', () => {
    cy.get('[data-testid="rich-clamped"]').should('have.text', 'true');
    cy.get('[data-testid="rich-clamp"]').should(($root) =>
      expect($root[0].getBoundingClientRect().height).to.be.at.most(41),
    );
    cy.contains('button', '展开富文本').click();
    cy.get('[data-testid="rich-clamp"]').should(($root) =>
      expect($root[0].getBoundingClientRect().height).to.be.greaterThan(60),
    );
    cy.contains('button', '收起富文本').click();
    cy.get('[data-testid="rich-clamped"]').should('have.text', 'true');
    cy.contains('button', '改变富文本').click();
    cy.get('[data-testid="rich-clamp"] em').should('have.text', 'Short');
    cy.get('[data-testid="rich-clamped"]').should('have.text', 'false');
  });

  it('preserves rich affix controls during custom-ellipsis measurement and controlled expansion', () => {
    cy.get('[data-testid="rich-custom-clamp"]').should('contain.text', '[more]');
    cy.contains('button', '展开自定义').click();
    cy.get('[data-testid="rich-custom-clamp"]').should(($root) =>
      expect($root[0].getBoundingClientRect().height).to.be.greaterThan(60),
    );
    cy.contains('button', '收起自定义').click();
    cy.get('[data-testid="rich-custom-clamp"]').should('contain.text', '[more]');
  });
});
