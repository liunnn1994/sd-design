import type { CropperImage, CropperSelection } from 'cropperjs';

import { defineComponent, h, ref } from 'vue';

import Cropper from '../index';

const src =
  "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='320' height='240'%3E%3Crect width='320' height='240' fill='red'/%3E%3C/svg%3E";

describe('Cropper fitting with controlled geometry', () => {
  it('continues forwarding selection changes when the initial image cannot load', () => {
    cy.mount(Cropper, {
      props: {
        src: 'data:image/svg+xml,invalid',
        fitSelectionToImage: false,
        selectionX: 10,
      },
    });
    cy.get<HTMLImageElement>('.sd-cropper-source-image').should(($image) => {
      expect($image[0].complete).to.equal(true);
      expect($image[0].naturalWidth).to.equal(0);
    });
    cy.then(() => Cypress.Promise.delay(0));
    cy.get<CropperSelection>('cropper-selection').then(($selection) => {
      $selection[0].$change(30, 40, 60, 80);
    });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('update:selectionX')?.at(-1)).to.deep.equal([30]);
    });
  });

  it('does not replace parent v-model coordinates with asynchronous initial centering', () => {
    cy.mount(
      defineComponent({
        setup() {
          const x = ref(10);
          const y = ref(12);
          return () =>
            h(Cropper, {
              src,
              'width': 400,
              'height': 300,
              'fitSelectionToImage': false,
              'selectionX': x.value,
              'selectionY': y.value,
              'selectionWidth': 60,
              'selectionHeight': 40,
              'onUpdate:selectionX': (value) => (x.value = value),
              'onUpdate:selectionY': (value) => (y.value = value),
            });
        },
      }),
    );
    cy.get<CropperImage>('cropper-image').then(($image) => $image[0].$ready());
    cy.then(() => Cypress.Promise.delay(0));
    cy.get<CropperSelection>('cropper-selection').should(($selection) => {
      expect($selection[0].x).to.equal(10);
      expect($selection[0].y).to.equal(12);
    });
  });

  for (const fitSelectionToImage of [false, true]) {
    it(`keeps the latest controlled geometry after a delayed image load with fitting ${fitSelectionToImage}`, () => {
      const imageUrl = `/cropper-controlled-${fitSelectionToImage}.svg`;
      cy.intercept(imageUrl, {
        headers: { 'content-type': 'image/svg+xml', 'cache-control': 'no-store' },
        body: '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="240"/>',
        delay: 100,
      });
      cy.mount(Cropper, {
        props: {
          src: imageUrl,
          width: 400,
          height: 300,
          fitSelectionToImage,
          selectionX: 10,
          selectionY: 12,
          selectionWidth: 60,
          selectionHeight: 40,
        },
      });
      cy.get('cropper-selection').should('exist');
      cy.get('@vue').then(({ wrapper }) =>
        wrapper.setProps({ selectionX: 20, selectionWidth: 80 }),
      );
      cy.get<CropperImage>('cropper-image').then(($image) => $image[0].$ready());
      cy.then(() => Cypress.Promise.delay(0));
      cy.get<CropperSelection>('cropper-selection').should(($selection) => {
        const { x, y, width, height } = $selection[0];
        expect({ x, y, width, height }).to.deep.equal({ x: 20, y: 12, width: 80, height: 40 });
      });
    });
  }

  it('keeps all explicitly supplied geometry after the image loads', () => {
    cy.mount(Cropper, {
      props: {
        src,
        width: 400,
        height: 300,
        selectionX: 10,
        selectionY: 12,
        selectionWidth: 60,
        selectionHeight: 40,
      },
    });
    cy.get<CropperImage>('cropper-image').then(($image) => $image[0].$ready());
    cy.then(() => Cypress.Promise.delay(0));
    cy.get<CropperSelection>('cropper-selection').should(($selection) => {
      const { x, y, width, height } = $selection[0];
      expect({ x, y, width, height }).to.deep.equal({ x: 10, y: 12, width: 60, height: 40 });
    });
  });

  it('fits uncontrolled dimensions while preserving an explicit x coordinate', () => {
    cy.mount(Cropper, { props: { src, width: 400, height: 300, selectionX: 10 } });
    cy.get<CropperImage>('cropper-image').then(($image) => $image[0].$ready());
    cy.then(() => Cypress.Promise.delay(0));
    cy.get<CropperSelection>('cropper-selection').should(($selection) => {
      expect($selection[0].x).to.equal(10);
      expect($selection[0].y).to.equal(1);
      expect($selection[0].width).to.be.greaterThan(30);
      expect($selection[0].height).to.be.greaterThan(30);
    });
  });
});
