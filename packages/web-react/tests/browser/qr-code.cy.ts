describe('React qr-code', () => {
  beforeEach(() => cy.visit('/qr-code.html'));

  it('renders real QrCode canvas pixels and updates multiline values in SVG mode', () => {
    cy.get('[data-testid="qr-main"] canvas')
      .should('have.attr', 'width', '160')
      .and('have.attr', 'role', 'img')
      .and('have.attr', 'aria-label', '二维码:first-value')
      .then((element) => {
        const pixels = (element[0] as HTMLCanvasElement)
          .getContext('2d')!
          .getImageData(0, 0, 160, 160).data;
        expect(pixels.some((value, index) => index % 4 === 3 && value === 255)).to.equal(true);
        expect(pixels.some((value, index) => index % 4 === 0 && value === 11)).to.equal(true);
      });
    cy.contains('button', 'QR type').click();
    cy.get('[data-testid="qr-main"] svg path').should('have.length', 2);
    cy.get('[data-testid="qr-main"] svg path')
      .eq(1)
      .invoke('attr', 'd')
      .as('qrPath', { type: 'static' });
    cy.contains('button', 'QR value').click();
    cy.get('[data-testid="qr-main"] [role="img"]').should(
      'have.attr',
      'aria-label',
      '二维码:second-value\n多行',
    );
    cy.get('@qrPath').then((path) =>
      cy.get('[data-testid="qr-main"] svg path').eq(1).should('not.have.attr', 'd', path),
    );
  });

  it('tracks QrCode ancestor themes, applies explicit options and measures a previously empty root', () => {
    cy.contains('button', 'QR type').click();
    cy.get('[data-testid="qr-main"] svg path').eq(1).should('have.attr', 'stroke', '#0b0b0a');
    cy.contains('button', /^QR status$/).click();
    const cover = '[data-testid="qr-main"] .sd-qr-code-cover';
    cy.get(cover)
      .invoke('css', 'background-color')
      .then((light) => {
        cy.contains('button', 'QR theme').click();
        cy.get(cover).should(($cover) => {
          expect(getComputedStyle($cover[0]).backgroundColor).not.to.equal(light);
          expect(getComputedStyle($cover[0]).backgroundColor).to.contain('0.88');
        });
      });
    cy.get('[data-testid="qr-main"] svg path').eq(0).should('have.attr', 'fill', '#20201e');
    cy.get('[data-testid="qr-main"] svg path').eq(1).should('have.attr', 'stroke', '#f6f6f6');
    cy.contains('button', 'QR options').click();
    cy.get('[data-testid="qr-main"]')
      .should('have.class', 'sd-qr-code-borderless')
      .and('have.css', 'width', '200px')
      .and('have.css', 'background-color', 'rgb(170, 187, 204)');
    cy.get('[data-testid="qr-main"] svg path').eq(0).should('have.attr', 'fill', '#aabbcc');
    cy.get('[data-testid="qr-main"] svg path').eq(1).should('have.attr', 'stroke', '#112233');
    cy.get('[data-testid="qr-main"] svg')
      .invoke('attr', 'viewBox')
      .then((value) => expect(Number(value!.split(' ')[2])).to.be.greaterThan(35));
    cy.get('[data-testid="qr-empty"]').should('not.exist');
    cy.contains('button', 'QR empty').click();
    cy.get('[data-testid="qr-empty"] svg path').eq(1).should('have.attr', 'stroke', '#f6f6f6');
    cy.contains('button', 'QR empty').click();
    cy.get('[data-testid="qr-empty"]').should('not.exist');
  });

  it('renders QrCode status, locale, refresh and inherited loading props', () => {
    cy.contains('button', /^QR status$/).click();
    cy.get('[data-testid="qr-main"] [role="status"]')
      .should('have.attr', 'aria-live', 'polite')
      .and('contain.text', '二维码已过期');
    cy.get('[data-testid="qr-main"] button').click();
    cy.get('[data-testid="qr-events"]').should('have.text', 'refresh');
    cy.contains('button', 'QR locale').click();
    cy.get('[data-testid="qr-main"] button').should('have.text', 'Refresh');
    cy.contains('button', /^QR status$/).click();
    cy.get('[data-testid="qr-main"] .sd-spin').should('contain.text', 'Inherited QR loading');
    cy.get('[data-testid="qr-main"] .sd-spin-icon').should('have.css', 'font-size', '10px');
    cy.contains('button', 'QR local spin').click();
    cy.get('[data-testid="qr-main"] .sd-spin')
      .should('contain.text', 'Local QR loading')
      .and('not.contain.text', 'Inherited QR loading');
    cy.get('[data-testid="qr-main"] .sd-dot-loading').should('have.css', 'width', '56px');
    cy.contains('button', /^QR status$/).click();
    cy.get('[data-testid="qr-main"] [role="status"]').should('have.text', 'QR code scanned');
    cy.contains('button', /^QR status$/).click();
    cy.get('[data-testid="qr-main"] .sd-qr-code-cover').should('not.exist');
  });

  it('updates QrCode icons, custom status precedence and native refs', () => {
    cy.get('[data-testid="qr-main"] .sd-qr-code-icon').should('not.exist');
    cy.contains('button', 'QR icon').click();
    cy.get('[data-testid="qr-main"] img')
      .should('have.attr', 'alt', 'QR icon')
      .and('have.css', 'width', '24px')
      .and('have.css', 'height', '36px');
    cy.contains('button', 'QR icon').click();
    cy.get('[data-testid="qr-main"] .sd-qr-code-icon')
      .should('have.text', 'Custom icon')
      .find('img')
      .should('not.exist');
    cy.contains('button', 'QR icon').click();
    cy.get('[data-testid="qr-main"] .sd-qr-code-icon').should('not.exist');
    cy.contains('button', /^QR status$/).click();
    cy.contains('button', 'QR custom status').click();
    cy.contains('[data-testid="qr-main"] button', 'Render expired').click();
    cy.get('[data-testid="qr-main"] .sd-qr-code-status').should('not.exist');
    cy.contains('[data-testid="qr-status-slot"] button', 'Slot expired').click();
    cy.contains('button', 'QR ref').click();
    cy.get('[data-testid="qr-events"]').should('have.text', 'refresh|slot-refresh|ref:qr-main');
    cy.contains('button', 'QR mount').click();
    cy.contains('button', 'QR ref').click();
    cy.get('[data-testid="qr-events"]').should('contain.text', 'ref:null');
  });

  it('keeps the newest QrCode SVG when earlier requests finish out of order or after remount', () => {
    cy.contains('button', 'QR defer').click();
    cy.get('[data-testid="qr-pending"]').should('contain.text', 'old');
    cy.contains('button', 'QR newer').click();
    cy.get('[data-testid="qr-pending"]').should('have.text', 'old|new');
    cy.contains('button', 'QR resolve new').click();
    cy.get('[data-testid="qr-main"] svg').should('have.attr', 'data-value', 'new');
    cy.contains('button', 'QR resolve old').click();
    cy.get('[data-testid="qr-main"] svg').should('have.attr', 'data-value', 'new');
    cy.contains('button', 'QR defer').click();
    cy.get('[data-testid="qr-pending"]').should('have.text', 'old');
    cy.get('[data-testid="qr-main"] [role="img"]').should('have.attr', 'aria-label', '二维码:old');
    cy.contains('button', 'QR mount').click();
    cy.get('[data-testid="qr-main"]').should('not.exist');
    cy.contains('button', 'QR newer').click();
    cy.contains('button', 'QR mount').click();
    cy.get('[data-testid="qr-pending"]').should('have.text', 'old|new');
    cy.contains('button', 'QR resolve new').click();
    cy.get('[data-testid="qr-main"] svg').should('have.attr', 'data-value', 'new');
    cy.contains('button', 'QR resolve old').click();
    cy.get('[data-testid="qr-pending"]').should('be.empty');
    cy.get('[data-testid="qr-main"] svg').should('have.attr', 'data-value', 'new');
  });
});
