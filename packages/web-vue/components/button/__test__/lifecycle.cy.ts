import { defineComponent, ref } from 'vue';

describe('Button lifecycle', () => {
  it('adds and removes a tooltip slot dynamically', () => {
    cy.mount(
      defineComponent({
        setup: () => ({ tooltip: ref(false) }),
        template:
          '<button @click="tooltip = !tooltip">Toggle</button><sd-button id="target"><template v-if="tooltip" #tooltip>Dynamic help</template>Action</sd-button>',
      }),
    );
    cy.contains('button', 'Toggle').click();
    cy.get('#target').trigger('mouseenter');
    cy.contains('.sd-tooltip-content', 'Dynamic help').should('be.visible');
    cy.contains('button', 'Toggle').click();
    cy.get('.sd-tooltip-content:visible').should('not.exist');
    cy.get('#target').should('have.prop', 'tagName', 'BUTTON');
  });

  it('blocks form submission while loading and restores submission afterward', () => {
    const submit = cy.spy();
    cy.mount(
      defineComponent({
        setup: () => ({ loading: ref(true), submit }),
        template:
          '<button @click="loading = false">Ready</button><form @submit.prevent="submit"><sd-button html-type="submit" :loading="loading">Submit</sd-button></form>',
      }),
    );
    cy.contains('button', 'Submit').click();
    cy.wrap(submit).should('not.have.been.called');
    cy.contains('button', 'Ready').click();
    cy.contains('button', 'Submit').click();
    cy.wrap(submit).should('have.been.calledOnce');
  });
});
