import './real-transitions';
import { defineComponent } from 'vue';

import Calendar from '../index';

describe('Calendar navigation in forms', () => {
  for (const customTitle of [false, true]) {
    it(`navigates without submitting its parent form with ${customTitle ? 'custom' : 'default'} title`, () => {
      const onSubmit = cy.stub();
      cy.mount(
        defineComponent({
          components: { Calendar },
          setup: () => ({ onSubmit }),
          template: `<form @submit.prevent="onSubmit"><Calendar view="day" view-date="2025-01-08" :click-to-navigate="true">${customTitle ? '<template #title>Custom title</template>' : ''}</Calendar></form>`,
        }),
      );
      cy.get('button.sd-calendar__title').click();
      cy.get('.sd-calendar').should('not.have.class', 'sd-calendar--day-view');
      cy.wrap(onSubmit).should('not.have.been.called');
    });
  }
});
