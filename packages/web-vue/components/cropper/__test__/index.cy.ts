import type { VueWrapper } from '@vue/test-utils';

import Cropper from '../index';

const imageSrc =
  "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='640' height='360'%3E%3Crect width='640' height='360' fill='%23165dff'/%3E%3C/svg%3E";
const nextImageSrc =
  "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='320' height='240'%3E%3Crect width='320' height='240' fill='%2300b42a'/%3E%3C/svg%3E";

const getWrapper = () => cy.get('@vue').its('wrapper') as Cypress.Chainable<VueWrapper>;

describe('Cropper', () => {
  it('renders the source image, dimensions, and fallthrough attributes', () => {
    cy.mount(Cropper, {
      props: { src: imageSrc, width: 320, height: '240px' },
      attrs: { 'id': 'avatar-cropper', 'aria-label': '头像裁剪器' },
    });

    cy.get('.sd-cropper')
      .should('have.attr', 'id', 'avatar-cropper')
      .and('have.attr', 'aria-label', '头像裁剪器')
      .and('have.attr', 'style')
      .and('contain', '--sd-cropper-width: 320px')
      .and('contain', '--sd-cropper-height: 240px');
    cy.get('.sd-cropper-source-image').should('have.attr', 'src', imageSrc);
  });

  it('initializes cropperjs and forwards child element props', () => {
    cy.mount(Cropper, {
      props: {
        src: imageSrc,
        fitSelectionToImage: false,
        canvasProps: {
          background: true,
          disabled: false,
          scaleStep: 0.2,
          themeColor: '#165dff',
        },
        imageProps: {
          initialCenterSize: 'cover',
          rotatable: true,
          translatable: false,
        },
        selectionProps: {
          aspectRatio: 1,
          initialCoverage: 0.6,
          movable: true,
          resizable: false,
        },
      },
    });

    cy.get('cropper-canvas').should(($canvas) => {
      const canvas = $canvas[0] as HTMLElement & {
        background: boolean;
        disabled: boolean;
        scaleStep: number;
        themeColor: string;
      };
      expect(canvas.background).to.equal(true);
      expect(canvas.disabled).to.equal(false);
      expect(canvas.scaleStep).to.equal(0.2);
      expect(canvas.themeColor).to.equal('#165dff');
    });
    cy.get('cropper-image').should(($image) => {
      const image = $image[0] as HTMLElement & {
        initialCenterSize: string;
        rotatable: boolean;
        translatable: boolean;
      };
      expect(image.initialCenterSize).to.equal('cover');
      expect(image.rotatable).to.equal(true);
      expect(image.translatable).to.equal(false);
    });
    cy.get('cropper-selection').should(($selection) => {
      const selection = $selection[0] as HTMLElement & {
        aspectRatio: number;
        initialCoverage: number;
        movable: boolean;
        resizable: boolean;
      };
      expect(selection.aspectRatio).to.equal(1);
      expect(selection.initialCoverage).to.equal(0.6);
      expect(selection.movable).to.equal(true);
      expect(selection.resizable).to.equal(false);
    });
  });

  it('passes a custom template to cropperjs', () => {
    const template =
      '<cropper-canvas data-template="custom"><cropper-image></cropper-image><cropper-selection data-selection="custom"></cropper-selection></cropper-canvas>';

    cy.mount(Cropper, { props: { src: imageSrc, template, fitSelectionToImage: false } });

    cy.get('cropper-canvas').should('have.attr', 'data-template', 'custom');
    cy.get('cropper-selection').should('have.attr', 'data-selection', 'custom');
  });

  it('reacts to source and child prop changes', () => {
    cy.mount(Cropper, {
      props: {
        src: imageSrc,
        fitSelectionToImage: false,
        canvasProps: { background: true },
        imageProps: { rotatable: true },
        selectionProps: { movable: true },
      },
    });
    cy.get('cropper-selection').should('exist');

    getWrapper().then((wrapper) =>
      wrapper.setProps({
        src: nextImageSrc,
        canvasProps: { background: false, disabled: true },
        imageProps: { rotatable: false, scalable: true },
        selectionProps: { movable: false, resizable: true },
      }),
    );

    cy.get('cropper-image').should('have.prop', 'src', nextImageSrc);
    cy.get('cropper-canvas').should(($canvas) => {
      const canvas = $canvas[0] as HTMLElement & { background: boolean; disabled: boolean };
      expect(canvas.background).to.equal(false);
      expect(canvas.disabled).to.equal(true);
    });
    cy.get('cropper-image').should(($image) => {
      const image = $image[0] as HTMLElement & { rotatable: boolean; scalable: boolean };
      expect(image.rotatable).to.equal(false);
      expect(image.scalable).to.equal(true);
    });
    cy.get('cropper-selection').should(($selection) => {
      const selection = $selection[0] as HTMLElement & { movable: boolean; resizable: boolean };
      expect(selection.movable).to.equal(false);
      expect(selection.resizable).to.equal(true);
    });
  });

  it('emits selection, canvas, and image events with their detail payloads', () => {
    const selectionDetail = { x: 12, y: 24, width: 160, height: 90 };
    const canvasDetails = {
      action: { action: '', stage: 'action' },
      actionstart: { action: '', stage: 'start' },
      actionmove: { action: '', stage: 'move' },
      actionend: { action: '', stage: 'end' },
    };
    const transformDetail = { matrix: [1, 0, 0, 1, 10, 20], oldMatrix: [1, 0, 0, 1, 0, 0] };

    cy.mount(Cropper, { props: { src: imageSrc, fitSelectionToImage: false } });

    cy.get('cropper-selection').then(($selection) => {
      $selection[0].dispatchEvent(new CustomEvent('change', { detail: selectionDetail }));
    });
    cy.get('cropper-canvas').then(($canvas) => {
      for (const [eventName, detail] of Object.entries(canvasDetails)) {
        $canvas[0].dispatchEvent(new CustomEvent(eventName, { detail }));
      }
    });
    cy.get('cropper-image').then(($image) => {
      $image[0].dispatchEvent(new CustomEvent('transform', { detail: transformDetail }));
    });

    getWrapper().should((wrapper) => {
      expect(wrapper.emitted('selection:change')?.at(-1)).to.deep.equal([selectionDetail]);
      expect(wrapper.emitted('update:selectionX')?.at(-1)).to.deep.equal([selectionDetail.x]);
      expect(wrapper.emitted('update:selectionY')?.at(-1)).to.deep.equal([selectionDetail.y]);
      expect(wrapper.emitted('update:selectionWidth')?.at(-1)).to.deep.equal([
        selectionDetail.width,
      ]);
      expect(wrapper.emitted('update:selectionHeight')?.at(-1)).to.deep.equal([
        selectionDetail.height,
      ]);
      expect(wrapper.emitted('canvas:action')?.at(-1)).to.deep.equal([canvasDetails.action]);
      expect(wrapper.emitted('canvas:actionstart')?.at(-1)).to.deep.equal([
        canvasDetails.actionstart,
      ]);
      expect(wrapper.emitted('canvas:actionmove')?.at(-1)).to.deep.equal([
        canvasDetails.actionmove,
      ]);
      expect(wrapper.emitted('canvas:actionend')?.at(-1)).to.deep.equal([canvasDetails.actionend]);
      expect(wrapper.emitted('image:transform')?.at(-1)).to.deep.equal([transformDetail]);
    });
  });

  it('applies initial and updated controlled selection geometry', () => {
    cy.mount(Cropper, {
      props: {
        src: imageSrc,
        fitSelectionToImage: false,
        selectionX: 10,
        selectionY: 20,
        selectionWidth: 120,
        selectionHeight: 80,
      },
    });

    cy.get('cropper-selection').should(($selection) => {
      const selection = $selection[0] as HTMLElement & {
        x: number;
        y: number;
        width: number;
        height: number;
      };
      expect(selection.x).to.equal(10);
      expect(selection.y).to.equal(20);
      expect(selection.width).to.equal(120);
      expect(selection.height).to.equal(80);
    });

    getWrapper().then((wrapper) =>
      wrapper.setProps({
        selectionX: 30,
        selectionY: 40,
        selectionWidth: 180,
        selectionHeight: 100,
      }),
    );
    cy.get('cropper-selection').should(($selection) => {
      const selection = $selection[0] as HTMLElement & {
        x: number;
        y: number;
        width: number;
        height: number;
      };
      expect(selection.x).to.equal(30);
      expect(selection.y).to.equal(40);
      expect(selection.width).to.equal(180);
      expect(selection.height).to.equal(100);
    });
  });

  it('fits the selection to the loaded image when enabled', () => {
    cy.mount(Cropper);
    cy.get('cropper-selection').then(($selection) => {
      cy.spy($selection[0], '$change').as('selectionChange');
    });
    cy.get('cropper-image').then(($image) => {
      cy.stub($image[0], '$getTransform').returns([2, 0, 0, 2, 0, 0]);
    });
    cy.get('.sd-cropper-source-image').then(($image) => {
      Object.defineProperties($image[0], {
        naturalWidth: { configurable: true, value: 100 },
        naturalHeight: { configurable: true, value: 50 },
      });
      $image[0].dispatchEvent(new Event('load'));
    });

    cy.get('@selectionChange').should('have.been.calledWith', 1, 1, 198, 98);
  });

  it('exposes cropperjs elements and removes listeners when destroyed', () => {
    cy.mount(Cropper, { props: { src: imageSrc, fitSelectionToImage: false } });
    cy.get('cropper-selection').should('exist');

    getWrapper().then((wrapper) => {
      const exposed = wrapper.vm as unknown as {
        destroy(): void;
        getInstance(): unknown;
        getCropperCanvas(): Element | null;
        getCropperImage(): Element | null;
        getCropperSelection(): Element | null;
        getCropperSelections(): NodeListOf<Element> | Element[] | null;
      };

      expect(exposed.getInstance()).not.to.equal(null);
      expect(exposed.getCropperCanvas()?.localName).to.equal('cropper-canvas');
      expect(exposed.getCropperImage()?.localName).to.equal('cropper-image');
      expect(exposed.getCropperSelection()?.localName).to.equal('cropper-selection');
      expect(exposed.getCropperSelections()).to.have.length(1);

      const selection = exposed.getCropperSelection()!;
      exposed.destroy();
      selection.dispatchEvent(
        new CustomEvent('change', { detail: { x: 1, y: 2, width: 3, height: 4 } }),
      );

      expect(exposed.getInstance()).to.equal(null);
      expect(exposed.getCropperCanvas()).to.equal(null);
      expect(wrapper.emitted('selection:change')).to.equal(undefined);
    });
  });
});
