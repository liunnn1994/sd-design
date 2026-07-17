import Avatar from '../index';

const { Group: AvatarGroup } = Avatar;

describe('Avatar', () => {
  it('should have the sd-avatar class', () => {
    cy.mount(Avatar);
    cy.get('.sd-avatar').should('exist');
  });

  it('image avatar has an alt', () => {
    cy.mount(Avatar, { props: { imageUrl: 'data:image/svg+xml,%3Csvg/%3E' } });
    cy.get('.sd-avatar img').should('have.attr', 'alt');
  });

  it('size should set inline width', () => {
    cy.mount(Avatar, { props: { size: 100 } });
    cy.get('.sd-avatar').invoke('attr', 'style').should('contain', 'width: 100px');
  });

  it('should emit click', () => {
    cy.mount(Avatar, { slots: { default: 'A' } });
    cy.get('.sd-avatar').click();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('click')).to.have.length(1);
    });
  });

  it('renders the trigger-icon slot', () => {
    cy.mount(Avatar, {
      slots: { 'trigger-icon': `<div id="icon">this is icon</div>` },
    });
    cy.get('#icon').should('exist');
  });

  it('trigger-type switches the trigger wrapper', () => {
    cy.mount(Avatar, {
      slots: { 'trigger-icon': '<div />' },
      props: { triggerType: 'mask' },
    });
    cy.get('.sd-avatar-trigger-icon-mask').should('exist');
    cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.setProps({ triggerType: 'button' })));
    cy.get('.sd-avatar-trigger-icon-button').should('exist');
  });

  it('avatar group renders its children', () => {
    cy.mount(AvatarGroup, { slots: { default: [Avatar, Avatar] } });
    cy.get('.sd-avatar-group').should('exist');
    cy.get('.sd-avatar').should('have.length', 2);
  });

  it('avatar group maxCount caps visible avatars', () => {
    cy.mount(AvatarGroup, {
      slots: { default: [Avatar, Avatar, Avatar] },
      props: { maxCount: 1 },
    });
    cy.get('.sd-avatar').should('have.length', 2);
  });
});
