import { h, provide, ref } from 'vue';

import { MARKSTREAM_NODE_LIFECYCLE_KEY } from 'markstream-vue';

import ImageNode from '../nodes/image.vue';

describe('Markdown image lifecycle', () => {
  it('settles the pending image when streaming finishes', () => {
    const loading = ref(true);
    let pending = 0;
    const load = cy.spy().as('load');
    cy.mount({
      setup() {
        provide(MARKSTREAM_NODE_LIFECYCLE_KEY, {
          markPending: () => {
            pending += 1;
          },
          markSettled: () => {
            pending -= 1;
          },
          reportHeight: () => {},
        });
        return () =>
          h(ImageNode, {
            node: {
              type: 'image',
              src: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==',
              alt: 'image',
              title: null,
              raw: '',
              loading: loading.value,
            },
            indexKey: '0',
            onLoad: load,
          });
      },
    });
    cy.then(() => {
      expect(pending).to.equal(1);
      loading.value = false;
    });
    cy.get('@load').should('have.been.calledOnce');
    cy.then(() => expect(pending).to.equal(0));
    cy.get('@vue').then(({ wrapper }) => wrapper.unmount());
    cy.then(() => expect(pending).to.equal(0));
  });
});
