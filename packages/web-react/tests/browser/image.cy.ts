import { checkComponentDocs } from './docs-contract';

const imageSrc = (color = 'red') =>
  `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480"><rect width="640" height="480" fill="${color}"/></svg>`)}`;

const fixture = '[data-testid="image-fixture"]';

const control = (name = '') => cy.get(fixture).contains('button', name).click({ force: true });

const preview = () => cy.get('.sd-image-preview-wrapper');

const action = (name = '') =>
  cy
    .get(`.sd-image-preview-toolbar .sd-icon-${name}`)
    .closest('.sd-image-preview-toolbar-action')
    .click();

const openImage = () => {
  cy.get('[data-testid="image-main"]').should(($img) =>
    expect(($img[0] as HTMLImageElement).naturalWidth).to.equal(640),
  );
  cy.get('[data-testid="image-main"]').click(8, 8);
  preview().should('be.visible');
  cy.get('.sd-image-preview-toolbar').should('be.visible');
};

describe('React Image', () => {
  beforeEach(() => cy.visit('/'));
  it('loads image, updates footer and opens with native ref commands', () => {
    cy.get('.sd-image-with-footer-inner').should('exist');
    cy.get('.sd-image-img')
      .should('have.attr', 'alt', 'Caption')
      .and('have.css', 'object-fit', 'cover');
    control('Image custom slots');
    cy.get('.sd-image-footer-extra').should('contain', 'Extra download');
    control('Image footer position');
    cy.get('.sd-image-with-footer-outer').should('exist');
    control('Image footer visibility');
    cy.get('.sd-image-footer').should('not.exist');
    control('Image ref open');
    preview().should('be.visible');
    control('Image ref close');
    preview().should('not.exist');
  });
  it('zooms, rotates, resets on source updates and cancels scale timers', () => {
    openImage();
    action('zoom-in');
    cy.get('.sd-image-preview-img-container').should(
      'have.css',
      'transform',
      'matrix(1.1, 0, 0, 1.1, 0, 0)',
    );
    action('rotate-right');
    cy.get('.sd-image-preview-img').should('have.attr', 'style').and('include', 'rotate(90deg)');
    control('Image replace');
    cy.get('[data-testid="image-main"]').should('have.attr', 'src', imageSrc('purple'));
    cy.get('.sd-image-preview-img').should('have.attr', 'src', imageSrc('purple'));
    cy.get('.sd-image-preview-img-container').should(
      'have.css',
      'transform',
      'matrix(1, 0, 0, 1, 0, 0)',
    );
    cy.get('.sd-image-preview-img').should('have.attr', 'style').and('include', 'rotate(0deg)');
    control('Image mount');
    preview().should('not.exist');
    cy.get('body').should('not.have.css', 'overflow', 'hidden');
  });
  it('keeps controlled visibility until accepted and preserves close event order', () => {
    cy.get('[aria-label="Image mode"]').select('preview');
    control('Image visible');
    preview().should('be.visible');
    control('Image accept');
    cy.get('.sd-image-preview-close-btn').click();
    preview().should('be.visible');
    cy.get('[data-testid="image-events"]')
      .invoke('text')
      .should((value) =>
        expect(value.split('|').filter((event) => event !== 'load')).to.deep.equal([
          'close',
          'visible:false',
        ]),
      );
    control('Image accept');
    cy.get('.sd-image-preview-close-btn').click();
    preview().should('not.exist');
    cy.get('[data-testid="image-events"]')
      .invoke('text')
      .should((value) =>
        expect(value.split('|').filter((event) => event !== 'load')).to.deep.equal([
          'close',
          'visible:false',
          'close',
          'visible:false',
        ]),
      );
  });
  it('suppresses disabled actions and does not intercept editable shortcuts', () => {
    openImage();
    control('Image disable');
    // Disabling thumbnail preview unmounts its standalone popup.
    preview().should('not.exist');
    cy.get('[aria-label="Image mode"]').select('preview');
    control('Image visible');
    cy.get('[data-testid="image-custom-action"]').click();
    cy.get('[data-testid="image-events"]').should('not.contain', 'custom');
    cy.get('[data-testid="image-editable"]').type('note{uparrow}');
    cy.get('.sd-image-preview-img-container').should(
      'have.css',
      'transform',
      'matrix(1, 0, 0, 1, 0, 0)',
    );
    preview().trigger('keydown', { key: 'ArrowUp' });
    cy.get('.sd-image-preview-img-container').should(
      'have.css',
      'transform',
      'matrix(1.1, 0, 0, 1.1, 0, 0)',
    );
    control('Image keyboard');
    preview().trigger('keydown', { key: 'ArrowUp' });
    cy.get('.sd-image-preview-img-container').should(
      'have.css',
      'transform',
      'matrix(1.1, 0, 0, 1.1, 0, 0)',
    );
  });
  it('navigates registered image identity after source updates and removal', () => {
    cy.get('[aria-label="Image mode"]').select('group');
    cy.get('.sd-image-overlay').should('not.exist');
    cy.get('[data-image-id="0"]').click();
    cy.get('.sd-image-preview-img').should('have.attr', 'src', imageSrc('red'));
    cy.get('.sd-image-preview-arrow-right').click();
    cy.get('.sd-image-preview-img').should('have.attr', 'src', imageSrc('blue'));
    cy.get('.sd-image-preview-close-btn').click();
    control('Image replace');
    control('Image remove middle');
    cy.get('[data-image-id="0"]').click();
    cy.get('.sd-image-preview-img').should('have.attr', 'src', imageSrc('purple'));
    cy.get('.sd-image-preview-arrow-right').click();
    cy.get('.sd-image-preview-img').should('have.attr', 'src', imageSrc('green'));
    cy.get('.sd-image-preview-arrow-right').should('have.class', 'sd-image-preview-arrow-disabled');
  });
  it('honors explicit lists, disabled children and infinite wrap', () => {
    cy.get('[aria-label="Image mode"]').select('group');
    cy.get('.sd-image-overlay').should('not.exist');
    control('Image disable');
    control('Image infinite');
    cy.get('[data-image-id="0"]').click();
    cy.get('.sd-image-preview-arrow-right').click();
    cy.get('.sd-image-preview-img').should('have.attr', 'src', imageSrc('green'));
    cy.get('.sd-image-preview-arrow-right').click();
    cy.get('.sd-image-preview-img').should('have.attr', 'src', imageSrc('red'));
    control('Image source list');
    cy.get('.sd-image-preview-img').should('have.attr', 'src', imageSrc('purple'));
    cy.get('.sd-image-preview-arrow-right').click();
    cy.get('.sd-image-preview-img').should('have.attr', 'src', imageSrc('blue'));
    control('Image empty list');
    cy.get('.sd-image-preview-img').should('not.have.attr', 'src');
    cy.get('.sd-image-preview-arrow-right').should('have.class', 'sd-image-preview-arrow-disabled');
  });
  it('moves a live popup between containers and inline without remounting custom content', () => {
    openImage();
    cy.get('[data-testid="image-editable"]').type('keep me');
    control('Image container');
    cy.get('#image-container-a .sd-image-preview-wrapper').should('be.visible');
    cy.get('[data-testid="image-editable"]').should('have.value', 'keep me');
    cy.get('body').should('not.have.css', 'overflow', 'hidden');
    cy.get('#image-container-a').should('have.css', 'overflow', 'hidden');
    control('Image container');
    cy.get('#image-container-b .sd-image-preview-wrapper').should('be.visible');
    cy.get('#image-container-a').should('not.have.css', 'overflow', 'hidden');
    control('Image portal');
    cy.get(fixture).find('.sd-image .sd-image-preview-wrapper').should('exist');
    cy.get('[data-testid="image-editable"]').should('have.value', 'keep me');
    control('Image mount');
    cy.get('#image-container-b').should('not.have.css', 'overflow', 'hidden');
  });
  it('closes only the top dialog and releases stack entries on unmount', () => {
    cy.get('[aria-label="Image mode"]').select('stack');
    cy.get('.image-stack-first .sd-image-preview-wrapper').should('be.visible');
    control('Image visible');
    cy.get('.image-stack-second .sd-image-preview-wrapper')
      .should('be.visible')
      .trigger('keydown', { key: 'Escape' });
    cy.get('.image-stack-second .sd-image-preview-wrapper').should('not.exist');
    cy.get('.image-stack-first .sd-image-preview-wrapper')
      .should('be.visible')
      .trigger('keydown', { key: 'Escape' });
    preview().should('not.exist');
    cy.get('body').should('not.have.css', 'overflow', 'hidden');
  });
});

describe('React Image lifecycle', () => {
  beforeEach(() => cy.visit('/'));
  it('renders custom loading and error states and clears an empty source', () => {
    cy.intercept('/image-missing.png', { statusCode: 404, body: '', delay: 500 });
    control('Image custom slots');
    control('Image fail');
    cy.get('.sd-image-loading').should('contain', 'Custom loading');
    cy.get('.sd-image-loading-error').should('contain', 'Custom error');
    cy.get('[data-testid="image-events"]').should('contain', 'error');
    control('Image empty');
    cy.get('.sd-image-loading-error').should('not.exist');
    cy.get('.sd-image-img').should('not.have.attr', 'src');
    cy.get('.sd-image-overlay').should('exist').and('not.contain', 'Custom error');
    control('Image footer visibility');
    control('Image footer visibility');
    cy.get('.sd-image-footer').should('contain', 'Caption');
    control('Image replace');
    cy.get('.sd-image-overlay').should('not.exist');
  });
  it('honors wheel rate, zoom bounds and action layout filtering', () => {
    openImage();
    preview().trigger('wheel', { deltaY: -10 });
    cy.get('.sd-image-preview-img-container').should(
      'have.css',
      'transform',
      'matrix(1.1, 0, 0, 1.1, 0, 0)',
    );
    control('Image wheel');
    preview().trigger('wheel', { deltaY: -10 });
    cy.get('.sd-image-preview-img-container').should(
      'have.css',
      'transform',
      'matrix(1.1, 0, 0, 1.1, 0, 0)',
    );
    action('original-size');
    cy.get('.sd-image-preview-img-container').should(
      'have.css',
      'transform',
      'matrix(1, 0, 0, 1, 0, 0)',
    );
    for (let i = 0; i < 15; i++) action('zoom-in');
    cy.get('.sd-image-preview-img-container').should(
      'have.css',
      'transform',
      'matrix(5, 0, 0, 5, 0, 0)',
    );
    cy.get('.sd-icon-zoom-in')
      .closest('.sd-image-preview-toolbar-action')
      .should('have.class', 'sd-image-preview-toolbar-action-disabled');
    control('Image layout');
    cy.get('.sd-image-preview-toolbar .sd-icon-zoom-in').should('not.exist');
    cy.get('.sd-image-preview-toolbar .sd-icon-zoom-out').should('exist');
    cy.get('.sd-image-preview-toolbar .sd-icon-rotate-left').should('exist');
    cy.get('[data-testid="image-custom-action"]').should('exist');
    preview().trigger('keydown', { key: ' ' });
    cy.get('.sd-image-preview-img-container').should(
      'have.css',
      'transform',
      'matrix(5, 0, 0, 5, 0, 0)',
    );
  });
  it('keeps previews open when mask or escape closing is disabled', () => {
    openImage();
    control('Image mask');
    cy.get('.sd-image-preview-img-container').click(8, 8);
    preview().should('exist');
    control('Image escape');
    preview().trigger('keydown', { key: 'Escape' });
    preview().should('exist');
    control('Image escape');
    preview().trigger('keydown', { key: 'Escape' });
    preview().should('not.exist');
    control('Image ref open');
    preview().should('be.visible');
    control('Image mask');
    cy.get('.sd-image-preview-img-container').click(8, 8);
    preview().should('not.exist');
  });
  it('drags enlarged images and disconnects window listeners when the source is replaced', () => {
    openImage();
    for (let i = 0; i < 4; i++) action('zoom-in');
    cy.get('.sd-image-preview-img-container').should(
      'have.css',
      'transform',
      'matrix(1.75, 0, 0, 1.75, 0, 0)',
    );
    cy.get('.sd-image-preview-img').then(($image) => {
      const win = $image[0].ownerDocument.defaultView as Window & typeof globalThis;
      $image[0].dispatchEvent(
        new win.MouseEvent('mousedown', { button: 0, clientX: 100, clientY: 100, bubbles: true }),
      );
    });
    cy.window().then((win) =>
      win.dispatchEvent(new win.MouseEvent('mousemove', { clientX: 170, clientY: 135 })),
    );
    cy.get('.sd-image-preview-img-moving')
      .should('have.attr', 'style')
      .and('include', 'translate(40px, 20px)');
    control('Image replace');
    cy.get('.sd-image-preview-img').should('have.attr', 'src', imageSrc('purple'));
    cy.window().then((win) =>
      win.dispatchEvent(new win.MouseEvent('mousemove', { clientX: 300, clientY: 300 })),
    );
    cy.get('.sd-image-preview-img-moving').should('not.exist');
    cy.get('.sd-image-preview-img')
      .should('have.attr', 'style')
      .and('include', 'translate(0px, 0px)');
    control('Image mount');
    cy.window().then((win) => {
      win.dispatchEvent(new win.MouseEvent('mousemove', { clientX: 400, clientY: 400 }));
      win.dispatchEvent(new win.MouseEvent('mouseup'));
    });
    preview().should('not.exist');
  });
  it('preserves registration order after keyed reorder and refreshes a group source in place', () => {
    cy.get('[aria-label="Image mode"]').select('group');
    cy.get('.sd-image-overlay').should('not.exist');
    control('Image reorder');
    cy.get('[data-image-id="0"]').click();
    cy.get('.sd-image-preview-img').should('have.attr', 'src', imageSrc('red'));
    cy.get('.sd-image-preview-arrow-right').click();
    cy.get('.sd-image-preview-img').should('have.attr', 'src', imageSrc('blue'));
    cy.get('.sd-image-preview-arrow-left').click();
    control('Image replace');
    cy.get('.sd-image-preview-img').should('have.attr', 'src', imageSrc('purple'));
    cy.get('[data-testid="image-group-url"]').should('have.text', imageSrc('purple'));
  });
  it('waits for controlled group index updates and reflects custom class prefixes', () => {
    cy.get('[aria-label="Image mode"]').select('group');
    control('Image controlled');
    cy.get('.sd-image-overlay').should('not.exist');
    cy.get('[data-image-id="0"]').click();
    control('Image accept');
    cy.get('.sd-image-preview-arrow-right').click();
    cy.get('.sd-image-preview-img').should('have.attr', 'src', imageSrc('red'));
    cy.get('[data-testid="image-current"]').should('have.text', '0');
    control('Image accept');
    cy.get('.sd-image-preview-arrow-right').click();
    cy.get('.sd-image-preview-img').should('have.attr', 'src', imageSrc('blue'));
    control('Image prefix');
    cy.get('.custom-image-preview-img').should('have.attr', 'src', imageSrc('blue'));
    cy.get('.sd-image-preview-wrapper').should('not.exist');
    control('Image prefix');
    cy.get('.sd-image-preview-close-btn').click();
    cy.get('.sd-image-preview-wrapper').should('not.exist');
  });
});

describe('React Image documentation', () => {
  it('documents shared image scenes and framework navigation', () => checkComponentDocs('image'));
});
