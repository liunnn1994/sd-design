describe('React watermark', () => {
  beforeEach(() => cy.visit('/watermark.html'));

  it('renders a single Watermark layer in StrictMode and updates props, body theme and child content', () => {
    cy.contains('button', 'Mount Watermark').click();
    cy.get('[data-testid="watermark"]').should('have.css', 'position', 'relative');
    cy.get('[data-testid="watermark"] > div')
      .should('have.length', 1)
      .and('have.css', 'pointer-events', 'none')
      .and('have.css', 'z-index', '9');
    cy.get('[data-testid="watermark"] > div').should('have.css', 'background-size', '200px auto');
    cy.get('[data-testid="watermark"] > div')
      .invoke('css', 'background-image')
      .then((initial) => {
        cy.contains('button', 'Update Watermark text').click();
        cy.get('[data-testid="watermark"] > div')
          .should('have.css', 'background-image')
          .and('not.equal', initial);
      });
    cy.get('[data-testid="watermark"] > div')
      .invoke('css', 'background-image')
      .then((initial) => {
        cy.document().then((doc) => doc.body.setAttribute('sd-theme', 'dark'));
        cy.get('[data-testid="watermark"] > div')
          .should('have.css', 'background-image')
          .and('not.equal', initial);
      });
    cy.get('[data-testid="watermark"] > div').then(($layer) => {
      cy.contains('button', 'Watermark child 0').click();
      cy.contains('button', 'Watermark child 1').should('exist');
      cy.get('[data-testid="watermark"] > div').should(($nextLayer) => {
        expect($nextLayer).to.have.length(1);
        expect($nextLayer[0]).to.equal($layer[0]);
      });
    });
    cy.contains('button', 'Toggle Watermark offset').click();
    cy.get('[data-testid="watermark"] > div')
      .should('have.css', 'left', '30px')
      .and('have.css', 'top', '35px');
    cy.contains('button', 'Toggle Watermark repeat').click();
    cy.get('[data-testid="watermark"] > div')
      .should('have.css', 'background-repeat', 'no-repeat')
      .and('have.css', 'background-size', '100px auto');
    cy.contains('button', 'Read Watermark ref').click();
    cy.get('[data-testid="watermark-ref"]').should('have.text', 'DIV');
  });

  it('restores tampered Watermark layers, allows protection opt-out and removes owned nodes on unmount', () => {
    cy.contains('button', 'Mount Watermark').click();
    cy.get('[data-testid="watermark"] > div').then(($layer) => {
      $layer[0].remove();
    });
    cy.get('[data-testid="watermark"] > div').should('have.length', 1);
    cy.get('[data-testid="watermark"] > div').then(($layer) => {
      $layer[0].style.opacity = '0';
    });
    cy.get('[data-testid="watermark"] > div').should('have.css', 'opacity', '1');
    cy.contains('button', 'Toggle Watermark protection').click();
    cy.get('[data-testid="watermark"] > div').then(($layer) => {
      $layer[0].remove();
    });
    cy.contains('button', 'Watermark child 0').click();
    cy.get('[data-testid="watermark"] > div').should('not.exist');
    cy.contains('button', 'Toggle Watermark protection').click();
    cy.get('[data-testid="watermark"]').then(($root) => {
      cy.get('[data-testid="watermark"] > div').should('have.length', 1);
      cy.contains('button', 'Unmount Watermark').click();
      cy.then(() => expect($root[0].querySelectorAll('div')).to.have.length(0));
      cy.contains('button', 'Read Watermark ref').click();
      cy.get('[data-testid="watermark-ref"]').should('be.empty');
    });
  });

  it('keeps the newer text layer when a pending image finishes decoding', () => {
    const pending: Array<() => Promise<void>> = [];
    const layer = () => cy.get<HTMLDivElement>('[data-testid="watermark"] > div');
    cy.window().then((win) => {
      const NativeImage = win.Image;
      const setSource = Object.getOwnPropertyDescriptor(NativeImage.prototype, 'src')!.set!;
      cy.stub(win, 'Image').callsFake(() => {
        const image = new NativeImage();
        Object.defineProperty(image, 'src', {
          set(value: string) {
            pending.push(
              () =>
                new Cypress.Promise<void>((resolve, reject) => {
                  image.addEventListener('load', () => resolve(), { once: true });
                  image.addEventListener('error', reject, { once: true });
                  setSource.call(image, value);
                }),
            );
          },
        });
        return image;
      });
    });
    cy.contains('button', 'Toggle Watermark image').click();
    cy.contains('button', 'Mount Watermark').click();
    cy.wrap(pending).should('not.be.empty');
    cy.contains('button', 'Toggle Watermark image').click();
    layer().should('have.css', 'background-image').and('contain', 'data:image/png');
    layer().then(([$current]) => {
      const background = $current.style.backgroundImage;
      cy.then(() => Cypress.Promise.all(pending.map((load) => load())));
      layer().should(([$layer]) => {
        expect($layer).to.equal($current);
        expect($layer.style.backgroundImage).to.equal(background);
      });
    });
  });

  it('draws image Watermarks with equal staggered alpha and converts the real canvas to grayscale', () => {
    cy.contains('button', 'Toggle Watermark image').click();
    cy.contains('button', 'Mount Watermark').click();
    const pixels = (gray: boolean) =>
      cy
        .get('[data-testid="watermark"] > div')
        .should('have.css', 'background-image')
        .then((background) => {
          cy.window().then(
            (win) =>
              new Cypress.Promise<void>((resolve, reject) => {
                const img = new win.Image();
                img.onerror = reject;
                img.onload = () => {
                  const canvas = win.document.createElement('canvas');
                  canvas.width = img.width;
                  canvas.height = img.height;
                  const ctx = canvas.getContext('2d')!;
                  ctx.drawImage(img, 0, 0);
                  const ratio = win.devicePixelRatio || 1;
                  const first = ctx.getImageData(30 * ratio, 25 * ratio, 1, 1).data;
                  const second = ctx.getImageData(130 * ratio, 85 * ratio, 1, 1).data;
                  expect(first[3]).to.be.within(126, 129);
                  expect(second[3]).to.equal(first[3]);
                  if (gray) {
                    expect(first[0]).to.equal(first[1]);
                    expect(first[1]).to.equal(first[2]);
                  } else {
                    expect(first[0]).to.equal(255);
                    expect(first[1]).to.equal(0);
                  }
                  resolve();
                };
                img.src = String(background).slice(5, -2);
              }),
          );
        });
    pixels(false);
    cy.contains('button', 'Toggle Watermark grayscale').click();
    pixels(true);
    cy.contains('button', 'Toggle Watermark grayscale').click();
    cy.window().then((win) => {
      const context = win.CanvasRenderingContext2D.prototype;
      const read = context.getImageData;
      cy.stub(context, 'getImageData')
        .callsFake(function (this: CanvasRenderingContext2D, x, y, width, height) {
          if (x === 0 && y === 0)
            throw new win.DOMException('Pixel access denied', 'SecurityError');
          return read.call(this, x, y, width, height);
        })
        .as('readPixels');
    });
    cy.contains('button', 'Toggle Watermark grayscale').click();
    cy.get('@readPixels').should('have.been.called');
    pixels(false);
  });
});
