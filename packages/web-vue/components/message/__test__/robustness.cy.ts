import Message from '../index';

describe('Message robustness', () => {
  beforeEach(() => {
    cy.then(() => Message.clear());
    cy.get('.sd-message').should('not.exist');
  });
  afterEach(() => Message.clear());

  it('unmounts a detached container before creating its replacement', () => {
    let close: () => void;
    cy.then(() => {
      ({ close } = Message.info({ content: 'Detached', duration: 0 }));
    });
    cy.get('.sd-overlay-message').then(($overlay) => {
      const overlay = $overlay[0];
      overlay.remove();
      Message.info({ content: 'Replacement', duration: 0 });
      close();
      cy.wrap({ overlay }).should(({ overlay: oldContainer }) => {
        expect(oldContainer.querySelector('.sd-message-list')).to.equal(null);
      });
    });
    cy.then(() => Message.info({ content: 'Additional', duration: 0 }));
    cy.get('.sd-message-list-top')
      .should('have.length', 1)
      .and('contain.text', 'Replacement')
      .and('contain.text', 'Additional');
  });

  it('does not update a custom id when generating a new message id', () => {
    cy.then(() => {
      Message.info({ id: '__arco_message_2', content: 'Custom', position: 'bottom', duration: 0 });
      Message.info({ content: 'Generated', position: 'bottom', duration: 0 });
    });
    cy.get('.sd-message-list-bottom .sd-message').should('have.length', 2);
    cy.get('.sd-message-list-bottom')
      .should('contain.text', 'Custom')
      .and('contain.text', 'Generated');
  });

  it('honors showIcon in the imperative API', () => {
    cy.then(() => Message.info({ content: 'No icon', showIcon: false, duration: 0 }));
    cy.get('.sd-message').should('contain.text', 'No icon');
    cy.get('.sd-message-icon').should('not.exist');
  });

  it('closes a message whose config explicitly has an undefined id', () => {
    let close: () => void;
    cy.then(() => {
      ({ close } = Message.info({ id: undefined, content: 'Message', duration: 0 }));
    });
    cy.get('.sd-message').should('exist');
    cy.then(() => close());
    cy.get('.sd-message').should('not.exist');
  });

  it('allows onClose to recreate a message with the same id', () => {
    let close: () => void;
    cy.then(() => {
      ({ close } = Message.info({
        id: 'reentrant',
        content: 'Old',
        duration: 0,
        onClose: () => Message.info({ id: 'reentrant', content: 'New', duration: 0 }),
      }));
    });
    cy.get('.sd-message').should('have.text', 'Old');
    cy.then(() => close());
    cy.get('.sd-message').should('have.length', 1).and('have.text', 'New');
  });

  it('keeps an updated message paused while hovered', () => {
    cy.clock();
    const onClose = cy.spy().as('hoverClose');
    cy.then(() => Message.info({ id: 'hovered', content: 'Old', duration: 100, onClose }));
    cy.get('.sd-message').trigger('mouseenter');
    cy.then(() => Message.info({ id: 'hovered', content: 'New', duration: 100 }));
    cy.get('.sd-message').should('have.text', 'New');
    cy.tick(1000);
    cy.get('@hoverClose').should('not.have.been.called');
    cy.get('.sd-message').trigger('mouseleave');
    cy.tick(100);
    cy.get('@hoverClose').should('have.been.calledOnce');
  });
});
