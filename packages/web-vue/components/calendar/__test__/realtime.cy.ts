import './real-transitions';
import Calendar from '../index';

describe('Calendar realtime lifecycle', () => {
  beforeEach(() => {
    cy.clock(new Date(2025, 0, 8, 12, 0, 30).getTime(), ['Date', 'setTimeout', 'clearTimeout']);
  });

  it('stops all realtime updates when watchRealTime is disabled', () => {
    cy.mount(Calendar, { props: { viewDate: '2025-01-08', watchRealTime: true } });
    cy.get('@vue').then(async ({ wrapper }) => {
      await wrapper.setProps({ watchRealTime: false });
      cy.wrap(wrapper.vm.view.now.getTime()).as('stoppedAt');
    });
    cy.tick(90000);
    cy.get('@stoppedAt').then((stoppedAt) => {
      cy.get('@vue').should(({ wrapper }) =>
        expect(wrapper.vm.view.now.getTime()).to.equal(stoppedAt),
      );
    });
  });

  it('starts the realtime ticker when time is enabled dynamically', () => {
    cy.mount(Calendar, { props: { viewDate: '2025-01-08', watchRealTime: true, time: false } });
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ time: true }));
    cy.tick(30000);
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.vm.view.now.getMinutes()).to.equal(1);
      expect(wrapper.vm.view.now.getSeconds()).to.equal(0);
    });
  });
});
