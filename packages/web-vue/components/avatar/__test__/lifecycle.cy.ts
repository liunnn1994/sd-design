import { defineComponent, h, ref } from 'vue';

import Avatar from '../index';

const imageUrl =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

describe('Avatar lifecycle', () => {
  it('recognizes an image rendered by a slotted component', () => {
    const UserImage = defineComponent({
      setup: () => () => h('img', { src: imageUrl, alt: 'User' }),
    });
    cy.mount(Avatar, { slots: { default: () => h(UserImage) } });
    cy.get('.sd-avatar-image img').should('be.visible');
    cy.get('.sd-avatar-text').should('not.exist');
  });
  it('recovers from a failed image when imageUrl changes', () => {
    cy.mount(Avatar, { props: { imageUrl: 'data:image/png;base64,INVALID' } });
    cy.get('@vue').should(({ wrapper }) => expect(wrapper.emitted('error')).to.have.length(1));
    cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.setProps({ imageUrl })));
    cy.get('.sd-avatar img').should('be.visible');
    cy.get('@vue').should(({ wrapper }) => expect(wrapper.emitted('load')).to.have.length(1));
    cy.get('.sd-avatar-image-icon').should('not.exist');
  });

  it('uses the group size for the image as well as the avatar', () => {
    cy.mount({
      components: { Avatar, AvatarGroup: Avatar.Group },
      setup: () => ({ imageUrl }),
      template: '<AvatarGroup :size="64"><Avatar :size="24" :image-url="imageUrl" /></AvatarGroup>',
    });
    cy.get('.sd-avatar').should('have.css', 'width', '64px');
    // Group members have a 2px border on each side; the image fills the content box.
    cy.get('.sd-avatar img').should('have.css', 'width', '60px').and('have.css', 'height', '60px');
  });

  it('removes stale scaling when text becomes short', () => {
    cy.mount(
      defineComponent({
        components: { Avatar },
        setup: () => ({ text: ref('LongAvatarName') }),
        template: '<button @click="text = \'A\'">Shorten</button><Avatar>{{ text }}</Avatar>',
      }),
    );
    cy.get('.sd-avatar-text').should(($el) => expect($el[0].style.transform).to.contain('scale('));
    cy.get('button').click();
    cy.get('.sd-avatar-text')
      .should('have.text', 'A')
      .and(($el) => {
        expect($el[0].style.transform).to.equal('');
      });
  });

  it('reacts when automatic text sizing is disabled and re-enabled', () => {
    cy.mount(Avatar, { slots: { default: 'LongAvatarName' } });
    cy.get('.sd-avatar-text').should(($el) => expect($el[0].style.transform).to.contain('scale('));
    cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.setProps({ autoFixFontSize: false })));
    cy.get('.sd-avatar-text').should(($el) => expect($el[0].style.transform).to.equal(''));
    cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.setProps({ autoFixFontSize: true })));
    cy.get('.sd-avatar-text').should(($el) => expect($el[0].style.transform).to.contain('scale('));
  });

  it('updates text and image classes when slot content changes', () => {
    cy.mount(
      defineComponent({
        components: { Avatar },
        setup: () => ({ showImage: ref(true), imageUrl }),
        template:
          '<button @click="showImage = !showImage">Toggle</button><Avatar><img v-if="showImage" :src="imageUrl" alt="User" /><template v-else>LongAvatarName</template></Avatar>',
      }),
    );
    cy.get('.sd-avatar-image img').should('be.visible');
    cy.get('button').click();
    cy.get('.sd-avatar-text').should('have.text', 'LongAvatarName');
    cy.get('button').click();
    cy.get('.sd-avatar-image img').should('be.visible');
  });

  it('updates group overflow as members and maxCount change', () => {
    cy.mount(
      defineComponent({
        setup: () => ({ count: ref(3), max: ref(1) }),
        template: `
        <button data-test="add" @click="count++">Add</button>
        <button data-test="all" @click="max = 0">Show all</button>
        <sd-avatar-group :max-count="max" :max-popover-trigger-props="{ trigger: 'click' }">
          <sd-avatar v-for="n in count" :key="n">{{ n }}</sd-avatar>
        </sd-avatar-group>
      `,
      }),
    );
    cy.get('.sd-avatar-group-max-count-avatar').should('contain.text', '+2');
    cy.get('[data-test="add"]').click();
    cy.get('.sd-avatar-group-max-count-avatar').should('contain.text', '+3').click();
    cy.get('.sd-avatar-group-popover .sd-avatar').should('have.length', 3);
    cy.get('[data-test="all"]').click();
    cy.get('.sd-avatar-group-max-count-avatar').should('not.exist');
    cy.get('.sd-avatar-group > .sd-avatar').should('have.length', 4);
  });

  it('overlaps the first two members in RTL groups', () => {
    cy.mount({
      template:
        '<sd-config-provider :rtl="true"><sd-avatar-group><sd-avatar>A</sd-avatar><sd-avatar>B</sd-avatar><sd-avatar>C</sd-avatar></sd-avatar-group></sd-config-provider>',
    });
    cy.get('.sd-avatar-group > .sd-avatar').should(($avatars) => {
      const first = $avatars[0].getBoundingClientRect();
      const second = $avatars[1].getBoundingClientRect();
      expect(first.left - second.left).to.be.closeTo(30, 1);
    });
  });
});
