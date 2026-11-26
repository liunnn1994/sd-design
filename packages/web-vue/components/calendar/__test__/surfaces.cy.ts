import './real-transitions';
import Calendar from '../index';

describe('Calendar surface adapters', () => {
  for (const horizontal of [false, true]) {
    for (const release of ['pointerup', 'pointercancel']) {
      it(`resizes the all-day bar in ${horizontal ? 'horizontal' : 'vertical'} layout and stops on ${release}`, () => {
        cy.mount(Calendar, {
          props: { view: 'day', viewDate: '2026-10-19', allDayEvents: true, horizontal },
          attrs: { style: 'height:600px;--sd-calendar-all-day-bar-size:2rem' },
        });
        let initial: number;
        cy.document().then((doc) => {
          initial =
            Number.parseFloat(doc.defaultView!.getComputedStyle(doc.documentElement).fontSize) * 2;
        });
        const handle = () => cy.get('.sd-calendar__all-day-resizer');
        const pointer = {
          eventConstructor: 'PointerEvent',
          force: true,
          pointerType: release === 'pointerup' ? 'mouse' : 'touch',
        };
        handle().trigger('pointerdown', {
          isPrimary: true,
          ...pointer,
          buttons: 1,
          clientX: 100,
          clientY: 100,
        });
        handle().trigger('pointermove', {
          ...pointer,
          buttons: 1,
          clientX: horizontal ? 145 : 100,
          clientY: horizontal ? 100 : 145,
        });
        cy.get('.sd-calendar').should(($root) =>
          expect(
            ($root[0] as HTMLElement).style.getPropertyValue('--sd-calendar-all-day-bar-size'),
          ).to.equal(`${initial + 45}px`),
        );
        handle().trigger(release, pointer);
        handle().trigger('pointermove', { ...pointer, clientX: 200, clientY: 200 });
        cy.get('.sd-calendar').should(($root) =>
          expect(
            ($root[0] as HTMLElement).style.getPropertyValue('--sd-calendar-all-day-bar-size'),
          ).to.equal(`${initial + 45}px`),
        );
      });
    }
  }

  it('tracks the body cursor and removes its label on leave', () => {
    cy.mount(Calendar, {
      props: {
        view: 'day',
        viewDate: '2026-10-19',
        timeFrom: 480,
        timeTo: 840,
        timeAtCursor: true,
      },
      attrs: { style: 'height:600px' },
    });
    cy.get('.sd-calendar__body').then(($body) => {
      const rect = $body[0].getBoundingClientRect();
      cy.wrap($body).trigger('pointermove', {
        eventConstructor: 'PointerEvent',
        clientX: rect.left + rect.width / 2,
        clientY: rect.top + rect.height / 2,
        force: true,
      });
    });
    cy.get('.sd-calendar__time-at-cursor').should('have.text', '11:00');
    cy.get('.sd-calendar__body').trigger('pointerleave', { eventConstructor: 'PointerEvent' });
    cy.get('.sd-calendar__time-at-cursor').should('not.exist');
  });

  it('removes active all-day resize handle listeners on unmount', () => {
    cy.mount(Calendar, {
      props: { view: 'day', viewDate: '2026-10-19', allDayEvents: true },
      attrs: { style: 'height:600px' },
    });
    cy.get('.sd-calendar__all-day-resizer').then(([handle]) => {
      cy.spy(handle, 'addEventListener').as('surfaceAdded');
      cy.spy(handle, 'removeEventListener').as('surfaceRemoved');
    });
    cy.get('.sd-calendar__all-day-resizer').trigger('pointerdown', {
      isPrimary: true,
      eventConstructor: 'PointerEvent',
      clientX: 100,
      clientY: 100,
      force: true,
    });
    cy.get('@vue').then(({ wrapper }) => wrapper.unmount());
    cy.get('@surfaceAdded').then((added: ReturnType<typeof cy.spy>) => {
      for (const type of ['pointermove', 'pointerup', 'pointercancel', 'lostpointercapture']) {
        const registrations = added.getCalls().filter((call) => call.args[0] === type);
        expect(registrations.length, type).to.be.greaterThan(0);
        for (const registration of registrations)
          cy.get('@surfaceRemoved').should('have.been.calledWith', type, registration.args[1]);
      }
    });
  });
});
