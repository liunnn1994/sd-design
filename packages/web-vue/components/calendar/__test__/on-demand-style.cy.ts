import { mount } from 'cypress/vue';

import Calendar from '../index';
import '../style';

describe('Calendar on-demand styles', () => {
  let disabledSheets: CSSStyleSheet[] = [];

  afterEach(() => {
    for (const sheet of disabledSheets) sheet.disabled = false;
    disabledSheets = [];
  });

  it('styles schedule labels with only the component style entry', () => {
    cy.document().then((doc) => {
      for (const sheet of Array.from(doc.styleSheets)) {
        const id = (sheet.ownerNode as HTMLElement | null)?.getAttribute('data-vite-dev-id');
        if (id?.endsWith('/components/index.scss') && !sheet.disabled) {
          sheet.disabled = true;
          disabledSheets.push(sheet);
        }
      }
    });
    mount(Calendar, {
      props: {
        view: 'day',
        viewDate: '2026-10-05',
        schedules: [{ id: 1, label: 'Schedule' }],
      },
    });
    cy.get('.sd-calendar__schedule--heading .sd-ellipsis').should('have.css', 'max-width', '100%');
  });
});
