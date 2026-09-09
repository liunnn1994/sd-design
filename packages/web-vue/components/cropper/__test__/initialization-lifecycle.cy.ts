import { defineComponent, h, onMounted, ref } from 'vue';

import type { CropperExpose } from '../interface';

import Cropper from '../index';

describe('Cropper initialization lifecycle', () => {
  it('does not initialize after destroy is called while the lazy import is pending', () => {
    let cropper: CropperExpose;
    cy.mount(
      defineComponent({
        setup() {
          const child = ref<CropperExpose>();
          onMounted(() => {
            cropper = child.value!;
            cropper.destroy();
          });
          return () => h(Cropper, { ref: child, width: 400, height: 300 });
        },
      }),
    );
    cy.then(async () => {
      await import('cropperjs');
      await Cypress.Promise.delay(0);
      expect(cropper.getInstance()).to.equal(null);
    });
    cy.get('cropper-canvas').should('not.exist');
  });
});
