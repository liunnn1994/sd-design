import { h } from 'vue';

import TimePicker from '../index';

describe('TimePicker custom trigger', () => {
  it('opens the panel from the trigger slot', () => {
    cy.mount(TimePicker, {
      props: { defaultValue: '09:30:00' },
      slots: {
        trigger: (scope: import('../interface').TimePickerTriggerSlotProps) =>
          h(
            'button',
            { class: 'custom-trigger' },
            `${scope.displayValue}|${scope.date instanceof Date ? scope.date.getHours() : undefined}|${scope.popupVisible}`,
          ),
      },
    });
    cy.get('.sd-picker').should('not.exist');
    cy.get('.custom-trigger')
      .should('have.text', '09:30:00|9|false')
      .and('have.attr', 'aria-haspopup', 'dialog')
      .and('have.attr', 'aria-expanded', 'false')
      .and('not.have.attr', 'aria-controls');
    cy.get('.custom-trigger').click();
    cy.get('.custom-trigger')
      .should('have.text', '09:30:00|9|true')
      .and('have.attr', 'aria-expanded', 'true')
      .and('have.attr', 'aria-controls');
    cy.get('.custom-trigger')
      .invoke('attr', 'aria-controls')
      .then((popupId) => {
        cy.get(`#${popupId}`).should('be.visible');
      });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('popup-visible-change')?.at(-1)?.[0]).to.equal(true);
    });
  });
});

describe('TimePicker locale', () => {
  it('renders the localized now label', () => {
    cy.mount(TimePicker, { props: { defaultPopupVisible: true } });
    cy.get('.sd-timepicker-footer-btn-wrapper').should('contain.text', '此刻');
    cy.get('.sd-timepicker-footer-btn-wrapper').should('not.contain.text', 'datePicker.Now');
  });
});

describe('TimePicker selection and events', () => {
  it('selects hour, minute and second, then confirms', () => {
    const onSelect = cy.spy().as('onSelect');
    const onChange = cy.spy().as('onChange');
    const onUpdateModelValue = cy.spy().as('onUpdateModelValue');
    cy.mount(TimePicker, {
      props: {
        'defaultValue': '09:30:00',
        'defaultPopupVisible': true,
        onSelect,
        onChange,
        'onUpdate:modelValue': onUpdateModelValue,
      },
    });
    cy.get('.sd-timepicker-container').should('be.visible');
    cy.get('.sd-timepicker-column').eq(0).contains('li', /^10$/).click();
    cy.get('.sd-timepicker-column').eq(1).contains('li', /^45$/).click();
    cy.get('.sd-timepicker-column').eq(2).contains('li', /^20$/).click();
    cy.get('@onSelect').should((spy: ReturnType<typeof cy.spy>) => {
      expect(spy.callCount).to.equal(3);
      expect(spy.firstCall.args[0]).to.equal('10:30:00');
      expect(spy.secondCall.args[0]).to.equal('10:45:00');
      expect(spy.thirdCall.args[0]).to.equal('10:45:20');
      expect(spy.firstCall.args[1]).to.be.instanceOf(Date);
    });
    // Confirm with Enter on the input — same confirm() path as the OK button.
    cy.get('.sd-picker input').type('{enter}');
    cy.get('@onChange').should((spy: ReturnType<typeof cy.spy>) => {
      expect(spy.callCount).to.equal(1);
      expect(spy.firstCall.args[0]).to.equal('10:45:20');
      expect(spy.firstCall.args[1]).to.be.instanceOf(Date);
    });
    cy.get('@onUpdateModelValue').should((spy: ReturnType<typeof cy.spy>) => {
      expect(spy.firstCall.args[0]).to.equal('10:45:20');
    });
    cy.get('.sd-picker input').should('have.value', '10:45:20');
    cy.get('@vue').should(({ wrapper }) => {
      const emissions = wrapper.emitted('popup-visible-change') || [];
      const last = emissions.at(-1)?.[0];
      expect(last).to.equal(false);
    });
  });

  it('confirms directly on each selection with disableConfirm', () => {
    const onChange = cy.spy().as('onChange');
    cy.mount(TimePicker, {
      props: {
        defaultValue: '09:00:00',
        disableConfirm: true,
        defaultPopupVisible: true,
        onChange,
      },
    });
    cy.get('.sd-timepicker-column').eq(0).contains('li', /^10$/).click();
    cy.get('@onChange').should((spy: ReturnType<typeof cy.spy>) => {
      expect(spy.callCount).to.equal(1);
      expect(spy.firstCall.args[0]).to.equal('10:00:00');
    });
    cy.get('.sd-timepicker-column').eq(1).contains('li', /^30$/).click();
    cy.get('@onChange').should((spy: ReturnType<typeof cy.spy>) => {
      expect(spy.callCount).to.equal(2);
      expect(spy.secondCall.args[0]).to.equal('10:30:00');
    });
    cy.get('.sd-picker input').should('have.value', '10:30:00');
  });

  it('supports 12-hour columns via use12Hours and keeps the 24h output format', () => {
    const onChange = cy.spy().as('onChange');
    cy.mount(TimePicker, {
      props: { defaultValue: '13:30:00', use12Hours: true, defaultPopupVisible: true, onChange },
    });
    cy.get('.sd-timepicker-column').should('have.length', 4);
    // 13:30 renders as hour 01 with pm selected in the 12-hour columns.
    cy.get('.sd-timepicker-column')
      .eq(0)
      .contains('li', /^01$/)
      .should('have.class', 'sd-timepicker-cell-selected');
    cy.get('.sd-timepicker-column')
      .eq(3)
      .contains('li', /^pm$/)
      .should('have.class', 'sd-timepicker-cell-selected');
    // Confirming the unchanged value emits nothing (change fires only when the
    // value differs), so select minute 45 first — 13:30 stays pm -> 13:45.
    cy.get('.sd-timepicker-column').eq(1).contains('li', /^45$/).click();
    cy.get('.sd-timepicker-footer-btn-wrapper').contains('button', '确定').click();
    cy.get('@onChange').should((spy: ReturnType<typeof cy.spy>) => {
      expect(spy.callCount).to.equal(1);
      expect(spy.firstCall.args[0]).to.equal('13:45:00');
    });
    cy.get('.sd-picker input').should('have.value', '13:45:00');
  });

  it('switches am/pm with a format-implied 12-hour clock', () => {
    const onChange = cy.spy().as('onChange');
    cy.mount(TimePicker, {
      props: {
        format: 'hh:mm:ss a',
        defaultValue: '01:30:00 pm',
        defaultPopupVisible: true,
        onChange,
      },
    });
    cy.get('.sd-timepicker-column').should('have.length', 4);
    cy.get('.sd-timepicker-column').eq(3).contains('li', /^am$/).click();
    cy.get('.sd-timepicker-footer-btn-wrapper').contains('button', '确定').click();
    cy.get('@onChange').should((spy: ReturnType<typeof cy.spy>) => {
      expect(spy.firstCall.args[0]).to.equal('01:30:00 am');
    });
    cy.get('.sd-picker input').should('have.value', '01:30:00 am');
  });

  for (const hideDisabledOptions of [false, true]) {
    it(`uses 24-hour values for disabled hours in 12-hour mode (hide=${hideDisabledOptions})`, () => {
      cy.mount(TimePicker, {
        props: {
          defaultValue: '13:30:00',
          use12Hours: true,
          defaultPopupVisible: true,
          disabledHours: () => [0, 12, 14],
          hideDisabledOptions,
        },
      });
      if (hideDisabledOptions) {
        cy.get('.sd-timepicker-column').eq(0).contains('li', /^02$/).should('not.exist');
        cy.get('.sd-timepicker-column').eq(0).contains('li', /^12$/).should('not.exist');
      } else {
        cy.get('.sd-timepicker-column')
          .eq(0)
          .contains('li', /^02$/)
          .should('have.class', 'sd-timepicker-cell-disabled')
          .click({ force: true });
        cy.get('@vue').should(({ wrapper }) =>
          expect(wrapper.emitted('select')).to.equal(undefined),
        );
        cy.get('.sd-timepicker-column')
          .eq(0)
          .contains('li', /^12$/)
          .should('have.class', 'sd-timepicker-cell-disabled');
      }
      cy.get('.sd-timepicker-column').eq(3).contains('li', /^am$/).click();
      cy.get('.sd-timepicker-column')
        .eq(0)
        .contains('li', /^02$/)
        .should('not.have.class', 'sd-timepicker-cell-disabled');
      if (hideDisabledOptions) {
        cy.get('.sd-timepicker-column').eq(0).contains('li', /^12$/).should('not.exist');
      } else {
        cy.get('.sd-timepicker-column')
          .eq(0)
          .contains('li', /^12$/)
          .should('have.class', 'sd-timepicker-cell-disabled');
      }
    });
  }

  it('passes the 24-hour selection to disabled minute and second callbacks', () => {
    cy.mount(TimePicker, {
      props: {
        defaultValue: '13:30:00',
        use12Hours: true,
        defaultPopupVisible: true,
        disabledMinutes: (hour) => (hour === 13 ? [45] : []),
        disabledSeconds: (hour, minute) => (hour === 13 && minute === 30 ? [20] : []),
      },
    });
    cy.get('.sd-timepicker-column')
      .eq(1)
      .contains('li', /^45$/)
      .should('have.class', 'sd-timepicker-cell-disabled');
    cy.get('.sd-timepicker-column')
      .eq(2)
      .contains('li', /^20$/)
      .should('have.class', 'sd-timepicker-cell-disabled');
    cy.get('.sd-timepicker-column').eq(3).contains('li', /^am$/).click();
    cy.get('.sd-timepicker-column')
      .eq(1)
      .contains('li', /^45$/)
      .should('not.have.class', 'sd-timepicker-cell-disabled');
    cy.get('.sd-timepicker-column')
      .eq(2)
      .contains('li', /^20$/)
      .should('not.have.class', 'sd-timepicker-cell-disabled');
  });

  it('ignores bracketed literal text when choosing time columns', () => {
    cy.mount(TimePicker, {
      props: {
        format: 'HH:mm [seconds]',
        defaultValue: '13:30 seconds',
        defaultPopupVisible: true,
      },
    });
    cy.get('.sd-timepicker-column').should('have.length', 2);
    cy.get('.sd-timepicker-column').first().find('li').should('have.length', 24);
    cy.get('.sd-picker input').should('have.value', '13:30 seconds');
  });

  it('applies step intervals to the hour, minute and second columns', () => {
    cy.mount(TimePicker, {
      props: { step: { hour: 2, minute: 10, second: 15 }, defaultPopupVisible: true },
    });
    cy.get('.sd-timepicker-column').should('have.length', 3);
    cy.get('.sd-timepicker-column').eq(0).find('li').should('have.length', 12);
    cy.get('.sd-timepicker-column').eq(1).find('li').should('have.length', 6);
    cy.get('.sd-timepicker-column').eq(2).find('li').should('have.length', 4);
    cy.get('.sd-timepicker-column').eq(1).find('li').eq(3).should('have.text', '30');
  });

  it('marks disabled options and blocks their selection', () => {
    const onSelect = cy.spy().as('onSelect');
    cy.mount(TimePicker, {
      props: {
        defaultValue: '09:30:00',
        defaultPopupVisible: true,
        disabledHours: () => [9, 10, 11],
        onSelect,
      },
    });
    cy.get('.sd-timepicker-column')
      .eq(0)
      .contains('li', /^09$/)
      .should('have.class', 'sd-timepicker-cell-disabled')
      .and('have.attr', 'aria-disabled', 'true');
    cy.get('.sd-timepicker-column').eq(0).contains('li', /^09$/).click();
    cy.get('@onSelect').should((spy: ReturnType<typeof cy.spy>) => {
      expect(spy.callCount).to.equal(0);
    });
    // The OK button stays disabled while the selected time is disabled.
    cy.get('.sd-timepicker-footer-btn-wrapper').contains('button', '确定').should('be.disabled');
    cy.get('.sd-timepicker-column').eq(0).contains('li', /^12$/).click();
    cy.get('@onSelect').should((spy: ReturnType<typeof cy.spy>) => {
      expect(spy.callCount).to.equal(1);
      expect(spy.firstCall.args[0]).to.equal('12:30:00');
    });
    cy.get('.sd-timepicker-footer-btn-wrapper')
      .contains('button', '确定')
      .should('not.be.disabled');
  });
});

describe('TimePicker input and clear', () => {
  it('updates the panel while typing and confirms on Enter', () => {
    const onChange = cy.spy().as('onChange');
    cy.mount(TimePicker, { props: { onChange } });
    cy.get('.sd-picker input').click();
    cy.get('.sd-timepicker-container').should('be.visible');
    cy.get('@vue').should(({ wrapper }) => {
      const emissions = wrapper.emitted('popup-visible-change') || [];
      const last = emissions.at(-1)?.[0];
      expect(last).to.equal(true);
    });
    cy.get('.sd-picker input').type('10:30:00{enter}');
    cy.get('@onChange').should((spy: ReturnType<typeof cy.spy>) => {
      expect(spy.callCount).to.equal(1);
      expect(spy.firstCall.args[0]).to.equal('10:30:00');
    });
    cy.get('.sd-picker input').should('have.value', '10:30:00');
  });

  it('clears the value from the clear icon', () => {
    const onChange = cy.spy().as('onChange');
    const onUpdateModelValue = cy.spy().as('onUpdateModelValue');
    cy.mount(TimePicker, {
      props: { 'defaultValue': '09:30:00', onChange, 'onUpdate:modelValue': onUpdateModelValue },
    });
    // 清除图标依赖 CSS :hover 显示（合成事件无法触发），使用 force click
    cy.get('.sd-picker-clear-icon').click({ force: true });
    cy.get('@vue').should(({ wrapper }) => expect(wrapper.emitted('clear')).to.deep.equal([[]]));
    cy.get('@onChange').should((spy: ReturnType<typeof cy.spy>) => {
      expect(spy.callCount).to.equal(1);
      expect(spy.lastCall.args[0]).to.equal(undefined);
      expect(spy.lastCall.args[1]).to.equal(undefined);
    });
    cy.get('@onUpdateModelValue').should((spy: ReturnType<typeof cy.spy>) => {
      expect(spy.lastCall.args[0]).to.equal(undefined);
    });
    cy.get('.sd-picker input').should('have.value', '');
  });

  it('sorts range values ascending on confirm', () => {
    const onChange = cy.spy().as('onChange');
    cy.mount(TimePicker, {
      props: {
        type: 'time-range',
        defaultValue: ['18:45:00', '09:30:00'],
        defaultPopupVisible: true,
        onChange,
      },
    });
    cy.get('.sd-picker input').should('have.length', 2);
    cy.get('.sd-picker input').eq(0).should('have.value', '18:45:00');
    cy.get('.sd-picker input').eq(1).should('have.value', '09:30:00');
    cy.get('.sd-timepicker-footer-btn-wrapper').contains('button', '确定').click();
    cy.get('@onChange').should((spy: ReturnType<typeof cy.spy>) => {
      expect(spy.callCount).to.equal(1);
      expect(spy.firstCall.args[0]).to.deep.equal(['09:30:00', '18:45:00']);
      expect(spy.firstCall.args[1]).to.have.length(2);
      expect(spy.firstCall.args[1][0]).to.be.instanceOf(Date);
    });
    // The range footer has no "now" button, only OK.
    cy.get('.sd-timepicker-footer-btn-wrapper').find('button').should('have.length', 1);
  });

  it('hides disabled options with hideDisabledOptions', () => {
    cy.mount(TimePicker, {
      props: { defaultPopupVisible: true, hideDisabledOptions: true, disabledHours: () => [1, 2] },
    });
    cy.get('.sd-timepicker-column')
      .eq(0)
      .find('li')
      .should(($lis) => {
        const texts = $lis.toArray().map((li) => li.textContent);
        expect(texts).to.have.length(22);
        expect(texts).to.not.include('01');
        expect(texts).to.not.include('02');
      });
  });
});
