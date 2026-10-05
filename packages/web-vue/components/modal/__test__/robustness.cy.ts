import Modal from '../index';
import ModalComponent from '../modal.vue';

describe('Modal robustness', () => {
  afterEach(() => Modal.destroyAll());

  it('applies a numeric zero top offset', () => {
    cy.mount(ModalComponent, {
      props: { defaultVisible: true, renderToBody: false, alignCenter: false, top: 0 },
    });
    cy.get('.sd-modal').should('have.css', 'top', '0px');
  });

  it('ignores a close handle after destroyAll', () => {
    const onClose = cy.spy().as('staleClose');
    let close: () => void;
    cy.then(() => {
      ({ close } = Modal.open({ content: 'Destroyed', onClose }));
    });
    cy.get('.sd-modal').should('be.visible');
    cy.then(() => Modal.destroyAll());
    cy.get('.sd-modal').should('not.exist');
    cy.then(() => close());
    cy.get('@staleClose').should('not.have.been.called');
  });
});
