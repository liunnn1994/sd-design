import type { CropperExpose } from '@sdata/web-react/cropper';
type CropperImage = NonNullable<ReturnType<CropperExpose['getCropperImage']>>;
type CropperSelection = NonNullable<ReturnType<CropperExpose['getCropperSelection']>>;

describe('React Cropper adapter', () => {
  it('initializes one real engine in StrictMode and forwards root and child props', () => {
    cy.visit('/cropper.html');
    cy.get('#avatar')
      .should('have.attr', 'aria-label', 'Avatar cropper')
      .and('have.css', 'width', '400px')
      .and('have.css', 'height', '300px');
    cy.get('cropper-canvas').should('have.length', 1).and('have.prop', 'scaleStep', 0.2);
    cy.get<CropperImage>('cropper-image').should('have.prop', 'rotatable', true);
    cy.get<CropperSelection>('cropper-selection').should('have.prop', 'movable', true);
    cy.contains('button', 'Inspect').click();
    cy.get('[data-testid="status"]').should('have.text', 'true:1');
  });
  it('fits the loaded image and realigns after replacing its aspect ratio', () => {
    cy.visit('/cropper.html');
    cy.get<CropperSelection>('cropper-selection').should(($selection) => {
      expect($selection[0].width).to.be.closeTo(398, 1);
      expect($selection[0].height).to.be.closeTo(223, 1);
    });
    cy.contains('button', 'Replace image').click();
    cy.get('.sd-cropper-source-image').should('have.prop', 'naturalWidth', 320);
    cy.get<CropperImage>('cropper-image')
      .then(($image) => $image[0].$ready())
      .should('have.prop', 'naturalWidth', 320);
    cy.get<CropperSelection>('cropper-selection').should(($selection) => {
      const image = $selection[0].parentElement!.querySelector('cropper-image') as CropperImage;
      const bounds = image.getBoundingClientRect();
      expect($selection[0].width).to.be.closeTo(398, 1);
      expect(
        $selection[0].height,
        JSON.stringify({
          width: bounds.width,
          height: bounds.height,
          matrix: image.$getTransform(),
        }),
      ).to.be.closeTo(298, 1);
    });
  });
  it('applies initial and changed controlled geometry', () => {
    cy.visit('/cropper.html?controlled&nofit');
    cy.get<CropperSelection>('cropper-selection')
      .should('have.prop', 'x', 20)
      .and('have.prop', 'y', 30)
      .and('have.prop', 'width', 100)
      .and('have.prop', 'height', 80);
    cy.contains('button', 'Geometry').click();
    cy.get<CropperSelection>('cropper-selection')
      .should('have.prop', 'x', 40)
      .and('have.prop', 'y', 50)
      .and('have.prop', 'width', 120)
      .and('have.prop', 'height', 90);
  });
  it('forwards real selection events and geometry notifications', () => {
    cy.visit('/cropper.html?nofit');
    cy.get<CropperSelection>('cropper-selection').should('exist');
    cy.contains('button', 'Move selection').click();
    cy.get('[data-testid="events"]')
      .should('contain.text', 'selection')
      .and('contain.text', 'x:50')
      .and('contain.text', 'y:60')
      .and('contain.text', 'width:140')
      .and('contain.text', 'height:100');
  });
  it('restores defaults when child props are removed', () => {
    cy.visit('/cropper.html');
    cy.get('cropper-canvas').should('have.prop', 'scaleStep', 0.2);
    cy.contains('button', 'Child props').click();
    cy.get('cropper-canvas').should('have.prop', 'scaleStep', 0.1);
    cy.contains('button', 'Child props').click();
    cy.get('cropper-canvas').should('have.prop', 'scaleStep', 0.2);
  });
  it('keeps explicit destruction terminal across prop changes and remounts cleanly', () => {
    cy.visit('/cropper.html');
    cy.get('cropper-canvas').should('exist');
    cy.contains('button', 'Destroy').click();
    cy.contains('button', 'Replace image').click();
    cy.contains('button', 'Fit').click();
    cy.contains('button', 'Child props').click();
    cy.get('cropper-canvas').should('not.exist');
    cy.contains('button', 'Inspect').click();
    cy.get('[data-testid="status"]').should('have.text', 'false:undefined');
    cy.contains('button', 'Mount').click();
    cy.contains('button', 'Mount').click();
    cy.get('cropper-canvas').should('have.length', 1);
  });
  it('cancels lazy initialization after an immediate destroy', () => {
    cy.visit('/cropper.html?early');
    cy.contains('button', 'Load engine').click();
    cy.get('[data-testid="status"]').should('have.text', 'loaded');
    cy.contains('button', 'Inspect').click();
    cy.get('[data-testid="status"]').should('have.text', 'false:undefined');
    cy.get('cropper-canvas').should('not.exist');
  });
});
for (const action of ['move', 'se-resize']) {
  for (const disabled of [false, true]) {
    it(`React Cropper ${action} pointer interaction with disabled=${disabled}`, () => {
      cy.visit(`/cropper.html?nofit${disabled ? '&disabled' : ''}`);
      cy.get('cropper-canvas')
        .should('have.prop', 'scaleStep', 0.2)
        .and('have.prop', 'disabled', disabled);
      cy.get<CropperImage>('cropper-image').then(($image) => $image[0].$ready());
      cy.get<CropperSelection>('cropper-selection').then(($selection) =>
        $selection[0].$change(30, 40, 100, 80),
      );
      cy.get(`cropper-selection cropper-handle[action="${action}"]`).then(($handle) => {
        const handle = $handle[0];
        const Pointer = handle.ownerDocument.defaultView!.PointerEvent;
        const bounds = handle.getBoundingClientRect();
        const options = {
          bubbles: true,
          cancelable: true,
          pointerId: 1,
          pointerType: 'mouse',
          button: 0,
          buttons: 1,
          clientX: bounds.left + bounds.width / 2,
          clientY: bounds.top + bounds.height / 2,
        };
        handle.dispatchEvent(new Pointer('pointerdown', options));
        handle.dispatchEvent(
          new Pointer('pointermove', {
            ...options,
            clientX: options.clientX + 25,
            clientY: options.clientY + 15,
          }),
        );
        handle.dispatchEvent(
          new Pointer('pointerup', {
            ...options,
            buttons: 0,
            clientX: options.clientX + 25,
            clientY: options.clientY + 15,
          }),
        );
      });
      cy.get<CropperSelection>('cropper-selection').should(($selection) => {
        const { x, y, width, height } = $selection[0];
        expect({ x, y, width, height }).to.deep.equal(
          disabled
            ? { x: 30, y: 40, width: 100, height: 80 }
            : action === 'move'
              ? { x: 55, y: 55, width: 100, height: 80 }
              : { x: 30, y: 40, width: 125, height: 95 },
        );
      });
      if (!disabled)
        cy.get('[data-testid="events"]')
          .should('contain.text', 'start')
          .and('contain.text', 'action')
          .and('contain.text', 'move')
          .and('contain.text', 'end');
    });
  }
}

describe('React Cropper lifecycle boundaries', () => {
  it('preserves a manual selection with fitting off and aligns after enabling fitting', () => {
    cy.visit('/cropper.html?nofit');
    cy.get<CropperImage>('cropper-image').then(($image) => $image[0].$ready());
    cy.contains('button', 'Move selection').click();
    cy.contains('button', 'Replace image').click();
    cy.get<CropperImage>('cropper-image')
      .then(($image) => $image[0].$ready())
      .should('have.prop', 'naturalWidth', 320);
    cy.get<CropperSelection>('cropper-selection')
      .should('have.prop', 'x', 50)
      .and('have.prop', 'y', 60)
      .and('have.prop', 'width', 140)
      .and('have.prop', 'height', 100);
    cy.contains('button', 'Fit').click();
    cy.get<CropperSelection>('cropper-selection')
      .should('have.prop', 'x', 1)
      .and('have.prop', 'y', 1)
      .and('have.prop', 'width', 398)
      .and('have.prop', 'height', 298);
  });
  it('preserves initial parent feedback and publishes subsequent changes', () => {
    cy.visit('/cropper.html?controlled&accept&nofit');
    cy.get<CropperImage>('cropper-image').then(($image) => $image[0].$ready());
    cy.get<CropperSelection>('cropper-selection')
      .should('have.prop', 'x', 20)
      .and('have.prop', 'y', 30);
    cy.contains('button', 'Move selection').click();
    cy.get<CropperSelection>('cropper-selection').should('have.prop', 'x', 50);
    cy.get('[data-testid="events"]').should('contain.text', 'x:50');
  });
  for (const fit of [false, true]) {
    it(`uses the latest controlled geometry after delayed image loading with fit=${fit}`, () => {
      cy.intercept('/delayed-cropper.svg', {
        headers: { 'content-type': 'image/svg+xml', 'cache-control': 'no-store' },
        body: '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="240"/>',
        delay: 200,
      });
      cy.visit(`/cropper.html?controlled&src=/delayed-cropper.svg${fit ? '' : '&nofit'}`);
      cy.get<CropperSelection>('cropper-selection').should('exist');
      cy.contains('button', 'Geometry').click();
      cy.get<CropperImage>('cropper-image').then(($image) => $image[0].$ready());
      cy.get<CropperSelection>('cropper-selection')
        .should('have.prop', 'x', 40)
        .and('have.prop', 'y', 50)
        .and('have.prop', 'width', 120)
        .and('have.prop', 'height', 90);
    });
  }
  it('continues publishing geometry after an image load error', () => {
    cy.visit('/cropper.html?controlled&invalid&nofit');
    cy.get('.sd-cropper-source-image')
      .should('have.prop', 'complete', true)
      .and('have.prop', 'naturalWidth', 0);
    cy.get<CropperSelection>('cropper-selection').should('exist');
    cy.contains('button', 'Move selection').click();
    cy.get('[data-testid="events"]')
      .should('contain.text', 'x:50')
      .and('contain.text', 'width:140');
  });
  it('initializes a custom template and exposes its real selection', () => {
    cy.visit('/cropper.html?template');
    cy.get('cropper-canvas').should('have.attr', 'data-custom', 'true');
    cy.get<CropperSelection>('cropper-selection').should('have.length', 1);
    cy.contains('button', 'Inspect').click();
    cy.get('[data-testid="status"]').should('have.text', 'true:1');
  });
});
