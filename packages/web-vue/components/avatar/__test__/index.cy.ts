import Avatar from '../index';

const { Group: AvatarGroup } = Avatar;

describe('Avatar', () => {
  it('should have the sd-avatar class', () => {
    cy.mount(Avatar);
    cy.get('.sd-avatar').should('exist');
  });

  it('image avatar has an alt', () => {
    cy.mount(Avatar, {
      props: {
        imageUrl:
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
      },
    });
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

  it('shape defaults to circle and switches to square', () => {
    cy.mount(Avatar);
    cy.get('.sd-avatar').should('have.class', 'sd-avatar-circle');
    cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.setProps({ shape: 'square' })));
    cy.get('.sd-avatar').should('have.class', 'sd-avatar-square');
  });

  it('size sets inline font-size to half the size', () => {
    cy.mount(Avatar, { props: { size: 100 } });
    cy.get('.sd-avatar').should('have.css', 'font-size', '50px');
    cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.setProps({ size: 60 })));
    cy.get('.sd-avatar').should('have.css', 'font-size', '30px');
  });

  it('autoFixFontSize scales overflowing text', () => {
    cy.mount(Avatar, { slots: { default: 'LongText' } });
    cy.get('.sd-avatar-text').should(($el) => {
      expect($el[0].style.transform).to.contain('scale(');
      expect($el[0].style.transform).to.contain('translateX(-50%)');
    });
  });

  it('autoFixFontSize false leaves the text unscaled', () => {
    cy.mount(Avatar, { props: { autoFixFontSize: false }, slots: { default: 'LongText' } });
    cy.get('.sd-avatar-text').should(($el) => {
      expect($el[0].style.transform).to.equal('');
    });
  });

  it('emits load when the image loads', () => {
    cy.mount(Avatar, {
      props: {
        imageUrl:
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
      },
    });
    cy.get('.sd-avatar img').should('exist');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('load')).to.have.length(1);
    });
  });

  it('emits error and shows the fallback icon when the image fails', () => {
    // 用非法 data URI 触发图片加载失败，避免依赖网络层 intercept
    cy.mount(Avatar, {
      props: { imageUrl: 'data:image/png;base64,INVALIDAVATARIMAGE' },
    });
    cy.get('.sd-avatar-image-icon').should('exist');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('error')).to.have.length(1);
    });
    cy.get('.sd-avatar img').should('not.exist');
    cy.get('.sd-avatar-image-icon').should('exist');
  });

  it('renders the error slot instead of the fallback icon on image error', () => {
    cy.mount(Avatar, {
      props: { imageUrl: 'data:image/png;base64,INVALIDAVATARIMAGE' },
      slots: { error: '<div class="avatar-custom-error">failed</div>' },
    });
    cy.get('.sd-avatar .avatar-custom-error').should('exist');
    cy.get('.sd-avatar-image-icon').should('not.exist');
  });

  it('objectFit applies object-fit to the image', () => {
    cy.mount(Avatar, {
      props: {
        imageUrl:
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
        objectFit: 'contain',
      },
    });
    cy.get('.sd-avatar img').should('have.css', 'object-fit', 'contain');
  });

  it('triggerIconStyle is applied to the trigger icon wrapper', () => {
    cy.mount(Avatar, {
      slots: { 'trigger-icon': '<div class="ti">i</div>' },
      props: { triggerIconStyle: { color: 'rgb(255, 0, 0)' } },
    });
    cy.get('.sd-avatar-trigger-icon-button').should('have.css', 'color', 'rgb(255, 0, 0)');
  });

  it('button trigger icon inherits the avatar background color', () => {
    cy.mount(Avatar, {
      slots: { 'trigger-icon': '<div class="ti">i</div>' },
      attrs: { style: { backgroundColor: 'rgb(10, 20, 30)' } },
    });
    cy.get('.sd-avatar-trigger-icon-button').should('have.css', 'color', 'rgb(10, 20, 30)');
  });

  it('mask trigger icon does not inherit the avatar background color', () => {
    cy.mount(Avatar, {
      slots: { 'trigger-icon': '<div class="ti">i</div>' },
      attrs: { style: { backgroundColor: 'rgb(10, 20, 30)' } },
      props: { triggerType: 'mask' },
    });
    cy.get('.sd-avatar-trigger-icon-mask').should(($el) => {
      expect($el[0].style.color).to.equal('');
    });
  });

  it('avatar group shape and size override member props', () => {
    cy.mount(AvatarGroup, {
      slots: { default: [Avatar, Avatar] },
      props: { shape: 'square', size: 64 },
    });
    cy.get('.sd-avatar').should('have.class', 'sd-avatar-square');
    cy.get('.sd-avatar').should('have.css', 'width', '64px');
  });

  it('avatar group z-index is descending by default and ascending with zIndexAscend', () => {
    cy.mount(AvatarGroup, { slots: { default: [Avatar, Avatar, Avatar] } });
    cy.get('.sd-avatar-group > .sd-avatar').eq(0).should('have.css', 'z-index', '3');
    cy.get('.sd-avatar-group > .sd-avatar').eq(1).should('have.css', 'z-index', '2');
    cy.get('.sd-avatar-group > .sd-avatar').eq(2).should('have.css', 'z-index', '1');
    cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.setProps({ zIndexAscend: true })));
    cy.get('.sd-avatar-group > .sd-avatar').eq(0).should('have.css', 'z-index', '1');
    cy.get('.sd-avatar-group > .sd-avatar').eq(1).should('have.css', 'z-index', '2');
    cy.get('.sd-avatar-group > .sd-avatar').eq(2).should('have.css', 'z-index', '3');
  });

  it('avatar group overlaps members with negative margin-left', () => {
    cy.mount(AvatarGroup, { slots: { default: [Avatar, Avatar, Avatar] } });
    cy.get('.sd-avatar-group > .sd-avatar')
      .eq(0)
      .should(($el) => {
        expect($el[0].style.marginLeft).to.equal('0px');
      });
    cy.get('.sd-avatar-group > .sd-avatar')
      .eq(1)
      .should(($el) => {
        expect($el[0].style.marginLeft).to.equal('-10px');
      });
  });

  it('maxCount shows a +x avatar styled with maxStyle', () => {
    cy.mount(AvatarGroup, {
      slots: { default: [Avatar, Avatar, Avatar] },
      props: { maxCount: 2, maxStyle: { backgroundColor: 'rgb(0, 0, 255)' } },
    });
    // 文本带模板空白前缀，用 contain 断言
    cy.get('.sd-avatar-group-max-count-avatar').should('contain.text', '+1');
    cy.get('.sd-avatar-group-max-count-avatar').should(
      'have.css',
      'background-color',
      'rgb(0, 0, 255)',
    );
  });

  it('maxPopoverTriggerProps opens a popover listing the overflow avatars', () => {
    cy.mount(AvatarGroup, {
      slots: { default: [Avatar, Avatar, Avatar] },
      props: { maxCount: 2, maxPopoverTriggerProps: { trigger: 'click' } },
    });
    cy.get('.sd-avatar-group-max-count-avatar').click();
    cy.get('.sd-trigger-popup .sd-avatar').should('have.length', 1);
  });
});
