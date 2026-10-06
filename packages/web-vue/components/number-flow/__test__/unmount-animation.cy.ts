import { nextTick } from 'vue';

import NumberFlow from '../index';

describe('NumberFlow pending animation cleanup', () => {
  it('does not schedule an animation after unmounting during the update flush', () => {
    cy.mount(NumberFlow, {
      props: { value: 1, respectMotionPreference: false, transformTiming: { duration: 5432 } },
    });
    cy.get('@vue').then(async ({ wrapper }) => {
      const timer = cy.spy(window, 'setTimeout');
      await wrapper.setProps({ value: 2 });
      wrapper.unmount();
      timer.resetHistory();
      await nextTick();
      expect(timer.getCalls().filter((call) => call.args[1] === 5482)).to.have.length(0);
    });
  });
});
