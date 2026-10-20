import { h, ref } from 'vue';

import Modal from '../modal.vue';

describe('Modal footer tooltip', () => {
  it('does not show an ellipsis tooltip for a footer label that fits after opening', () => {
    const visible = ref(false);
    cy.mount(() => [
      h('button', { onClick: () => (visible.value = true) }, 'Open Modal'),
      h(
        Modal,
        {
          visible: visible.value,
          title: 'Title',
          cancelText: '取消',
          okText: '确定',
          modalStyle: { transform: 'scale(0.94)' },
        },
        () => 'Body',
      ),
    ]);
    cy.contains('button', 'Open Modal').click();
    cy.get('.sd-modal-footer .sd-btn').first().should('be.focused');
    cy.wait(600);
    cy.get('[role="tooltip"]').should('not.exist');
    cy.get('.sd-modal-footer .sd-btn-content').first().trigger('mouseenter');
    cy.wait(250);
    cy.get('[role="tooltip"]').should('not.exist');
  });
});
