import Notification from '../index';

describe('Notification robustness', () => {
  beforeEach(() => {
    cy.then(() => Notification.clear());
    cy.get('.sd-notification').should('not.exist');
  });
  afterEach(() => Notification.clear());

  it('unmounts a detached container before creating its replacement', () => {
    let close: () => void;
    cy.then(() => {
      ({ close } = Notification.info({ content: 'Detached', duration: 0 }));
    });
    cy.get('.sd-overlay-notification').then(($overlay) => {
      const overlay = $overlay[0];
      overlay.remove();
      Notification.info({ content: 'Replacement', duration: 0 });
      close();
      cy.wrap({ overlay }).should(({ overlay: oldContainer }) => {
        expect(oldContainer.querySelector('.sd-notification-list')).to.equal(null);
      });
    });
    cy.then(() => Notification.info({ content: 'Additional', duration: 0 }));
    cy.get('.sd-notification-list-top-right')
      .should('have.length', 1)
      .and('contain.text', 'Replacement')
      .and('contain.text', 'Additional');
  });

  it('does not update a custom id when generating a new notification id', () => {
    cy.then(() => {
      Notification.info({
        id: '__sd_notification_2',
        content: 'Custom',
        position: 'bottomLeft',
        duration: 0,
      });
      Notification.info({ content: 'Generated', position: 'bottomLeft', duration: 0 });
    });
    cy.get('.sd-notification-list-bottom-left .sd-notification').should('have.length', 2);
    cy.get('.sd-notification-list-bottom-left')
      .should('contain.text', 'Custom')
      .and('contain.text', 'Generated');
  });

  it('closes a notification whose config explicitly has an undefined id', () => {
    let close: () => void;
    cy.then(() => {
      ({ close } = Notification.info({ id: undefined, content: 'Notification', duration: 0 }));
    });
    cy.get('.sd-notification').should('exist');
    cy.then(() => close());
    cy.get('.sd-notification').should('not.exist');
  });

  it('allows onClose to recreate a notification with the same id', () => {
    let close: () => void;
    cy.then(() => {
      ({ close } = Notification.info({
        id: 'reentrant',
        content: 'Old',
        duration: 0,
        onClose: () => Notification.info({ id: 'reentrant', content: 'New', duration: 0 }),
      }));
    });
    cy.get('.sd-notification').should('contain.text', 'Old');
    cy.then(() => close());
    cy.get('.sd-notification').should('have.length', 1).and('contain.text', 'New');
  });

  it('removes a notification with an empty string id', () => {
    cy.then(() => Notification.info({ id: '', content: 'Empty id', duration: 0 }));
    cy.get('.sd-notification').should('exist');
    cy.then(() => Notification.remove(''));
    cy.get('.sd-notification').should('not.exist');
  });
});
