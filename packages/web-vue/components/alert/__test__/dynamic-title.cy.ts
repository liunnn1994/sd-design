import { defineComponent, ref } from 'vue';

import Alert from '../index';

describe('Alert dynamic title slot', () => {
  it('updates title layout when the title slot is added and removed without changing props', () => {
    cy.mount(
      defineComponent({
        components: { Alert },
        setup() {
          return { showTitle: ref(false) };
        },
        template: `
          <button data-test="toggle-title" @click="showTitle = !showTitle">Toggle title</button>
          <Alert>
            <template v-if="showTitle" #title>Dynamic title</template>
            Content
          </Alert>
        `,
      }),
    );
    cy.get('.sd-alert').should('not.have.class', 'sd-alert-with-title');
    cy.get('[data-test="toggle-title"]').click();
    cy.get('.sd-alert-title').should('have.text', 'Dynamic title');
    cy.get('.sd-alert').should('have.class', 'sd-alert-with-title');
    cy.get('[data-test="toggle-title"]').click();
    cy.get('.sd-alert-title').should('not.exist');
    cy.get('.sd-alert').should('not.have.class', 'sd-alert-with-title');
  });
});
