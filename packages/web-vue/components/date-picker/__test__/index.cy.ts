import { h } from 'vue';

import { dayjs, initializeDateLocale } from '../../_utils/date';
import { DEFAULT_LOCALE_KEY } from '../../locale/constant';
import DatePicker, {
  MonthPicker,
  QuarterPicker,
  RangePicker,
  WeekPicker,
  YearPicker,
} from '../index';

describe('DatePicker locale', () => {
  it('falls back unsupported locales to zh-cn', () => {
    cy.then(async () => {
      await initializeDateLocale('ja-JP', 1);

      expect(dayjs.locale()).to.equal(DEFAULT_LOCALE_KEY);
      expect(dayjs.Ls[DEFAULT_LOCALE_KEY].weekStart).to.equal(1);
    });
  });
});

describe('DatePicker custom trigger', () => {
  it('opens DatePicker from the named trigger slot', () => {
    cy.mount(DatePicker, {
      props: { defaultValue: '2026-07-28' },
      slots: {
        trigger: (scope: any) =>
          h(
            'button',
            { class: 'custom-date-trigger' },
            `${scope.displayValue}|${scope.date?.getFullYear()}|${scope.popupVisible}`,
          ),
      },
    });
    cy.get('.sd-picker').should('not.exist');
    cy.get('.custom-date-trigger').should('have.text', '2026-07-28|2026|false');
    cy.get('.custom-date-trigger').click();
    cy.get('.custom-date-trigger').should('have.text', '2026-07-28|2026|true');
    cy.get('.sd-picker-container').should('be.visible');
  });

  it('opens RangePicker from the named trigger slot', () => {
    cy.mount(RangePicker, {
      props: { defaultValue: ['2026-07-01', '2026-07-28'] },
      slots: {
        trigger: (scope: any) =>
          h(
            'button',
            { class: 'custom-range-trigger' },
            `${scope.displayValue.join('~')}|${scope.popupVisible}`,
          ),
      },
    });
    cy.get('.sd-picker').should('not.exist');
    cy.get('.custom-range-trigger').should('have.text', '2026-07-01~2026-07-28|false');
    cy.get('.custom-range-trigger').click();
    cy.get('.custom-range-trigger').should('have.text', '2026-07-01~2026-07-28|true');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('popup-visible-change')?.at(-1)?.[0]).to.equal(true);
    });
  });

  it('keeps the default slot as a compatible trigger', () => {
    cy.mount(DatePicker, {
      slots: {
        default: () => h('button', { class: 'legacy-trigger' }, '兼容触发器'),
      },
    });
    cy.get('.legacy-trigger').click();
    cy.get('.sd-picker-container').should('be.visible');
  });
});

describe('DatePicker selection and events', () => {
  it('emits change and update:modelValue when a date cell is clicked', () => {
    cy.mount(DatePicker, {
      props: {
        'popupVisible': true,
        'defaultPickerValue': '2026-07-05',
        'onChange': cy.spy().as('onChange'),
        'onUpdate:modelValue': cy.spy().as('onUpdateModelValue'),
      },
    });
    cy.get('.sd-picker-cell[aria-label="2026-07-15"]').click();
    cy.get('@onChange').should((spy: any) => {
      expect(spy.callCount).to.equal(1);
      expect(spy.firstCall.args[0]).to.equal('2026-07-15');
      expect(spy.firstCall.args[1]).to.be.instanceOf(Date);
      expect(spy.firstCall.args[2]).to.equal('2026-07-15');
    });
    cy.get('@onUpdateModelValue').should((spy: any) => {
      expect(spy.firstCall.args[0]).to.equal('2026-07-15');
    });
    cy.get('.sd-picker input').should('have.value', '2026-07-15');
    // controlled popupVisible keeps the panel open after selection
    cy.get('.sd-picker-container').should('be.visible');
  });

  it('closes the popup after selecting a date', () => {
    cy.mount(DatePicker, {
      props: {
        'defaultPickerValue': '2026-07-05',
        'unmountOnClose': true,
        'onChange': cy.spy().as('onChange'),
        'onPopupVisibleChange': cy.spy().as('onPopupVisibleChange'),
        'onUpdate:popupVisible': cy.spy().as('onUpdatePopupVisible'),
      },
    });
    cy.get('.sd-picker input').click();
    cy.get('.sd-picker-container').should('be.visible');
    cy.get('.sd-picker-cell[aria-label="2026-07-15"]').click();
    cy.get('@onChange').should((spy: any) => {
      expect(spy.firstCall.args[0]).to.equal('2026-07-15');
    });
    cy.get('@onPopupVisibleChange').should((spy: any) => {
      expect(spy.lastCall.args[0]).to.equal(false);
    });
    cy.get('@onUpdatePopupVisible').should((spy: any) => {
      expect(spy.lastCall.args[0]).to.equal(false);
    });
    cy.get('.sd-picker-container').should('not.be.visible');
  });

  it('emits clear and change with undefined when the clear icon is clicked', () => {
    cy.mount(DatePicker, {
      props: {
        'defaultValue': '2026-07-10',
        'onClear': cy.spy().as('onClear'),
        'onChange': cy.spy().as('onChange'),
        'onUpdate:modelValue': cy.spy().as('onUpdateModelValue'),
      },
    });
    // 清除按钮依赖 CSS :hover 显示（合成事件无法触发），使用 force click
    cy.get('.sd-picker-clear-icon').click({ force: true });
    cy.get('@onClear').should((spy: any) => {
      expect(spy.callCount).to.equal(1);
    });
    cy.get('@onChange').should((spy: any) => {
      expect(spy.callCount).to.equal(1);
      expect(spy.lastCall.args[0]).to.equal(undefined);
      expect(spy.lastCall.args[1]).to.equal(undefined);
      expect(spy.lastCall.args[2]).to.equal(undefined);
    });
    cy.get('@onUpdateModelValue').should((spy: any) => {
      expect(spy.lastCall.args[0]).to.equal(undefined);
    });
    cy.get('.sd-picker input').should('have.value', '');
  });

  it('applies custom format to display and parses typed input', () => {
    cy.mount(DatePicker, {
      props: {
        format: 'YYYY/MM/DD',
        defaultValue: '2026-07-10',
        onChange: cy.spy().as('onChange'),
      },
    });
    cy.get('.sd-picker input').should('have.value', '2026/07/10');
    cy.get('.sd-picker input').clear().type('2026/07/20{enter}');
    cy.get('@onChange').should((spy: any) => {
      expect(spy.callCount).to.equal(1);
      expect(spy.firstCall.args[0]).to.equal('2026-07-20');
    });
    cy.get('.sd-picker input').should('have.value', '2026/07/20');
  });

  it('ignores invalid keyboard input and commits a valid date on Enter', () => {
    cy.mount(DatePicker, {
      props: { onChange: cy.spy().as('onChange') },
    });
    cy.get('.sd-picker input').type('abc');
    cy.get('@onChange').should((spy: any) => {
      expect(spy.callCount).to.equal(0);
    });
    cy.get('.sd-picker input').clear().type('2026-07-15{enter}');
    cy.get('@onChange').should((spy: any) => {
      expect(spy.callCount).to.equal(1);
      expect(spy.firstCall.args[0]).to.equal('2026-07-15');
    });
    cy.get('.sd-picker input').should('have.value', '2026-07-15');
  });

  it('emits timestamp values when valueFormat is timestamp', () => {
    cy.mount(DatePicker, {
      props: {
        valueFormat: 'timestamp',
        defaultValue: dayjs('2026-07-10').valueOf(),
        popupVisible: true,
        defaultPickerValue: '2026-07-05',
        onChange: cy.spy().as('onChange'),
      },
    });
    cy.get('.sd-picker input').should('have.value', '2026-07-10');
    cy.get('.sd-picker-cell[aria-label="2026-07-15"]').click();
    cy.get('@onChange').should((spy: any) => {
      expect(spy.firstCall.args[0]).to.equal(dayjs('2026-07-15').valueOf());
    });
  });

  it('emits Date objects when valueFormat is Date', () => {
    cy.mount(DatePicker, {
      props: {
        valueFormat: 'Date',
        defaultValue: dayjs('2026-07-10').toDate(),
        popupVisible: true,
        defaultPickerValue: '2026-07-05',
        onChange: cy.spy().as('onChange'),
      },
    });
    cy.get('.sd-picker-cell[aria-label="2026-07-15"]').click();
    cy.get('@onChange').should((spy: any) => {
      const value = spy.firstCall.args[0];
      expect(value).to.be.instanceOf(Date);
      expect(value.getTime()).to.equal(dayjs('2026-07-15').valueOf());
    });
  });

  it('emits picker-value-change when navigating to the next month', () => {
    cy.mount(DatePicker, {
      props: {
        'popupVisible': true,
        'defaultPickerValue': '2026-07-05',
        'onPickerValueChange': cy.spy().as('onPickerValueChange'),
        'onUpdate:pickerValue': cy.spy().as('onUpdatePickerValue'),
      },
    });
    cy.get('.sd-picker-header-icon').eq(2).click();
    cy.get('@onPickerValueChange').should((spy: any) => {
      expect(spy.lastCall.args[0]).to.equal('2026-08-05');
    });
    cy.get('@onUpdatePickerValue').should((spy: any) => {
      expect(spy.lastCall.args[0]).to.equal('2026-08-05');
    });
    cy.get('.sd-picker-header-title').should('contain.text', '2026-08');
  });

  it('keeps the panel month fixed when pickerValue is controlled', () => {
    cy.mount(DatePicker, {
      props: {
        'popupVisible': true,
        'pickerValue': '2026-07-05',
        'onUpdate:pickerValue': cy.spy().as('onUpdatePickerValue'),
      },
    });
    cy.get('.sd-picker-header-icon').eq(2).click();
    cy.get('@onUpdatePickerValue').should((spy: any) => {
      expect(spy.lastCall.args[0]).to.equal('2026-08-05');
    });
    cy.get('.sd-picker-header-title').should('contain.text', '2026-07');
  });

  it('drills down through year and month header panels', () => {
    cy.mount(DatePicker, {
      props: { popupVisible: true, defaultPickerValue: '2026-07-05' },
    });
    cy.get('.sd-picker-header-label').eq(0).click();
    cy.get('.sd-panel-year').should('exist');
    cy.get('.sd-panel-date').should('not.exist');
    cy.get('.sd-panel-year .sd-picker-cell[aria-label="2027-01-01"]').click();
    cy.get('.sd-panel-month').should('exist');
    cy.get('.sd-panel-month .sd-picker-cell[aria-label="2027-03-01"]').click();
    cy.get('.sd-panel-date').should('exist');
    cy.get('.sd-picker-header-title').should('contain.text', '2027-03');
  });

  it('selects a shortcut and emits select-shortcut', () => {
    cy.mount(DatePicker, {
      props: {
        popupVisible: true,
        defaultPickerValue: '2026-07-05',
        shortcuts: [{ label: '前一周', value: '2026-07-03' }],
        onChange: cy.spy().as('onChange'),
        onSelectShortcut: cy.spy().as('onSelectShortcut'),
      },
    });
    cy.get('.sd-picker-shortcuts').contains('button', '前一周').click();
    cy.get('@onChange').should((spy: any) => {
      expect(spy.firstCall.args[0]).to.equal('2026-07-03');
    });
    cy.get('@onSelectShortcut').should((spy: any) => {
      expect(spy.firstCall.args[0].label).to.equal('前一周');
    });
    cy.get('.sd-picker input').should('have.value', '2026-07-03');
  });

  it('previews a shortcut value on hover without emitting events', () => {
    cy.mount(DatePicker, {
      props: {
        popupVisible: true,
        showConfirmBtn: true,
        shortcuts: [{ label: '前一周', value: '2026-07-03' }],
        onChange: cy.spy().as('onChange'),
        onSelect: cy.spy().as('onSelect'),
      },
    });
    cy.get('.sd-picker-shortcuts').contains('button', '前一周').trigger('mouseenter');
    cy.get('.sd-picker input').should('have.value', '2026-07-03');
    cy.get('@onChange').should((spy: any) => {
      expect(spy.callCount).to.equal(0);
    });
    cy.get('@onSelect').should((spy: any) => {
      expect(spy.callCount).to.equal(0);
    });
  });
});

describe('DatePicker disabled dates and confirm flow', () => {
  it('marks disabled dates and ignores clicks on them', () => {
    cy.mount(DatePicker, {
      props: {
        popupVisible: true,
        defaultPickerValue: '2026-07-05',
        disabledDate: (current: Date) => dayjs(current).isSame('2026-07-15', 'day'),
        onChange: cy.spy().as('onChange'),
      },
    });
    cy.get('.sd-picker-cell[aria-label="2026-07-15"]')
      .should('have.class', 'sd-picker-cell-disabled')
      .and('have.attr', 'aria-disabled', 'true')
      .click();
    cy.get('@onChange').should((spy: any) => {
      expect(spy.callCount).to.equal(0);
    });
    cy.get('.sd-picker-cell[aria-label="2026-07-16"]').click();
    cy.get('@onChange').should((spy: any) => {
      expect(spy.firstCall.args[0]).to.equal('2026-07-16');
    });
  });

  it('requires confirmation when showConfirmBtn is set', () => {
    cy.mount(DatePicker, {
      props: {
        popupVisible: true,
        defaultPickerValue: '2026-07-05',
        showConfirmBtn: true,
        onSelect: cy.spy().as('onSelect'),
        onOk: cy.spy().as('onOk'),
        onChange: cy.spy().as('onChange'),
      },
    });
    cy.get('.sd-picker-btn-confirm').should('have.attr', 'disabled');
    cy.get('.sd-picker-cell[aria-label="2026-07-15"]').click();
    cy.get('@onSelect').should((spy: any) => {
      expect(spy.firstCall.args[0]).to.equal('2026-07-15');
    });
    cy.get('@onChange').should((spy: any) => {
      expect(spy.callCount).to.equal(0);
    });
    cy.get('.sd-picker input').should('have.value', '2026-07-15');
    cy.get('.sd-picker-btn-confirm').should('not.have.attr', 'disabled');
    cy.get('.sd-picker-btn-confirm').click();
    cy.get('@onOk').should((spy: any) => {
      expect(spy.firstCall.args[0]).to.equal('2026-07-15');
    });
    cy.get('@onChange').should((spy: any) => {
      expect(spy.firstCall.args[0]).to.equal('2026-07-15');
    });
  });

  it('selects then confirms with showTime, keeping the selected time', () => {
    cy.mount(DatePicker, {
      props: {
        showTime: true,
        defaultValue: '2026-07-10 08:30:00',
        popupVisible: true,
        onSelect: cy.spy().as('onSelect'),
        onOk: cy.spy().as('onOk'),
        onChange: cy.spy().as('onChange'),
      },
    });
    cy.get('.sd-picker-cell[aria-label="2026-07-15"]').click();
    cy.get('@onSelect').should((spy: any) => {
      expect(spy.firstCall.args[0]).to.equal('2026-07-15 08:30:00');
    });
    cy.get('@onChange').should((spy: any) => {
      expect(spy.callCount).to.equal(0);
    });
    cy.get('.sd-picker-btn-confirm').should('not.have.attr', 'disabled');
    cy.get('.sd-picker-btn-confirm').click();
    cy.get('@onOk').should((spy: any) => {
      expect(spy.firstCall.args[0]).to.equal('2026-07-15 08:30:00');
    });
    cy.get('@onChange').should((spy: any) => {
      expect(spy.firstCall.args[0]).to.equal('2026-07-15 08:30:00');
    });
  });
});

describe('DatePicker mode pickers', () => {
  it('MonthPicker emits YYYY-MM values', () => {
    cy.mount(MonthPicker, {
      props: {
        defaultValue: '2026-03',
        popupVisible: true,
        onChange: cy.spy().as('onChange'),
      },
    });
    cy.get('.sd-picker input').should('have.value', '2026-03');
    cy.get('.sd-panel-month .sd-picker-cell[aria-label="2026-07-01"]').click();
    cy.get('@onChange').should((spy: any) => {
      expect(spy.firstCall.args[0]).to.equal('2026-07');
    });
    cy.get('.sd-picker input').should('have.value', '2026-07');
  });

  it('YearPicker emits YYYY values', () => {
    cy.mount(YearPicker, {
      props: {
        defaultValue: '2026',
        popupVisible: true,
        onChange: cy.spy().as('onChange'),
      },
    });
    cy.get('.sd-panel-year .sd-picker-cell[aria-label="2028-01-01"]').click();
    cy.get('@onChange').should((spy: any) => {
      expect(spy.firstCall.args[0]).to.equal('2028');
    });
    cy.get('.sd-picker input').should('have.value', '2028');
  });

  it('QuarterPicker displays Q format and emits YYYY-MM values', () => {
    cy.mount(QuarterPicker, {
      props: {
        defaultValue: '2026-04',
        popupVisible: true,
        onChange: cy.spy().as('onChange'),
      },
    });
    cy.get('.sd-picker input').should('have.value', '2026-Q2');
    cy.get('.sd-panel-quarter .sd-picker-cell[aria-label="2026-10-01"]').click();
    cy.get('@onChange').should((spy: any) => {
      expect(spy.firstCall.args[0]).to.equal('2026-10');
    });
    cy.get('.sd-picker input').should('have.value', '2026-Q4');
  });

  it('WeekPicker emits the clicked date with the default valueFormat', () => {
    cy.mount(WeekPicker, {
      props: {
        defaultValue: '2026-07-10',
        popupVisible: true,
        onChange: cy.spy().as('onChange'),
      },
    });
    cy.get('.sd-panel-week .sd-picker-cell[aria-label="2026-07-15"]').click();
    cy.get('@onChange').should((spy: any) => {
      // 周模式归一化到当周第一天（默认周日开始 → 2026-07-12）
      expect(spy.firstCall.args[0]).to.equal('2026-07-12');
    });
  });
});

describe('DatePicker states', () => {
  it('disables interaction when disabled', () => {
    cy.mount(DatePicker, { props: { disabled: true } });
    cy.get('.sd-picker').should('have.class', 'sd-picker-disabled');
    cy.get('.sd-picker input').should('be.disabled');
    cy.get('.sd-picker').click();
    cy.get('.sd-picker-container').should('not.be.visible');
  });

  it('prevents the popup from opening when readonly', () => {
    cy.mount(DatePicker, { props: { readonly: true } });
    cy.get('.sd-picker input').click();
    cy.get('.sd-picker-container').should('not.be.visible');
  });

  it('renders error and size classes', () => {
    cy.mount(DatePicker, { props: { error: true, size: 'small' } });
    cy.get('.sd-picker').should('have.class', 'sd-picker-error');
    cy.get('.sd-picker').should('have.class', 'sd-picker-size-small');
  });

  it('supports a custom placeholder', () => {
    cy.mount(DatePicker, { props: { placeholder: '请选择出生日期' } });
    cy.get('.sd-picker input').should('have.attr', 'placeholder', '请选择出生日期');
  });

  it('opens by default with defaultPopupVisible', () => {
    cy.mount(DatePicker, { props: { defaultPopupVisible: true } });
    cy.get('.sd-picker-container').should('be.visible');
  });

  it('renders a panel only with hideTrigger', () => {
    cy.mount(DatePicker, {
      props: {
        hideTrigger: true,
        defaultPickerValue: '2026-07-05',
        onChange: cy.spy().as('onChange'),
      },
    });
    cy.get('.sd-picker input').should('not.exist');
    cy.get('.sd-picker-container-panel-only').should('be.visible');
    cy.get('.sd-picker-cell[aria-label="2026-07-15"]').click();
    cy.get('@onChange').should((spy: any) => {
      expect(spy.firstCall.args[0]).to.equal('2026-07-15');
    });
  });

  it('starts the week on Monday with dayStartOfWeek 1', () => {
    cy.mount(DatePicker, { props: { dayStartOfWeek: 1, popupVisible: true } });
    cy.get('.sd-picker-week-list-item').first().should('have.text', '一');
    cy.get('.sd-picker-week-list-item').last().should('have.text', '日');
  });

  it('hides dates outside the current month with hideNotInViewDates', () => {
    cy.mount(DatePicker, {
      props: { hideNotInViewDates: true, popupVisible: true, defaultPickerValue: '2026-07-05' },
    });
    cy.get('.sd-picker-cell[aria-label="2026-06-30"]').should(
      'have.class',
      'sd-picker-cell-hidden',
    );
  });

  it('marks keyboard input as readonly with disabledInput', () => {
    cy.mount(DatePicker, { props: { disabledInput: true } });
    cy.get('.sd-picker input').should('have.attr', 'readonly');
  });
});

describe('DatePicker slots', () => {
  it('customizes cell content via the cell slot', () => {
    cy.mount(DatePicker, {
      props: { popupVisible: true, defaultPickerValue: '2026-07-05' },
      slots: {
        cell: ({ date }: any) => h('em', { class: 'custom-cell' }, String(date.getDate())),
      },
    });
    cy.get('.custom-cell').should('have.length', 42);
    cy.get('.custom-cell').contains('15').should('exist');
  });

  it('renders extra footer content', () => {
    cy.mount(DatePicker, {
      props: { popupVisible: true },
      slots: {
        extra: () => h('span', { class: 'custom-extra' }, '额外内容'),
      },
    });
    cy.get('.sd-picker-footer-extra-wrapper').should('contain.text', '额外内容');
  });

  it('renders prefix and suffix-icon slots', () => {
    cy.mount(DatePicker, {
      slots: {
        'prefix': () => h('span', { class: 'custom-prefix' }, '前缀'),
        'suffix-icon': () => h('i', { class: 'custom-suffix-icon' }),
      },
    });
    cy.get('.sd-picker-prefix').should('contain.text', '前缀');
    cy.get('.custom-suffix-icon').should('exist');
  });

  it('supports the panelRender slot', () => {
    cy.mount(DatePicker, {
      props: {
        popupVisible: true,
        defaultPickerValue: '2026-07-05',
        onChange: cy.spy().as('onChange'),
      },
      slots: {
        panelRender: (scope: any) =>
          h('div', { class: 'custom-panel-render' }, [h(scope.component, scope.props)]),
      },
    });
    cy.get('.custom-panel-render .sd-picker-cell').should('exist');
    cy.get('.custom-panel-render .sd-picker-cell[aria-label="2026-07-15"]').click();
    cy.get('@onChange').should((spy: any) => {
      expect(spy.firstCall.args[0]).to.equal('2026-07-15');
    });
  });
});

describe('RangePicker', () => {
  it('selects a complete range and emits change with sorted values', () => {
    cy.mount(RangePicker, {
      props: {
        'popupVisible': true,
        'defaultPickerValue': ['2026-07-01', '2026-08-01'],
        'onChange': cy.spy().as('onChange'),
        'onUpdate:modelValue': cy.spy().as('onUpdateModelValue'),
        'onPopupVisibleChange': cy.spy().as('onPopupVisibleChange'),
      },
    });
    // CI 上第二个 cell 可能仍处于面板动画中，用 force 规避 animating 检查
    cy.get('.sd-picker-cell[aria-label="2026-07-10"]').click();
    cy.get('.sd-picker-cell[aria-label="2026-08-15"]').click({ force: true });
    cy.get('@onChange').should((spy: any) => {
      expect(spy.callCount).to.equal(1);
      expect(spy.firstCall.args[0]).to.deep.equal(['2026-07-10', '2026-08-15']);
    });
    cy.get('@onUpdateModelValue').should((spy: any) => {
      expect(spy.firstCall.args[0]).to.deep.equal(['2026-07-10', '2026-08-15']);
    });
    cy.get('@onPopupVisibleChange').should((spy: any) => {
      expect(spy.lastCall.args[0]).to.equal(false);
    });
    cy.get('.sd-picker input').eq(0).should('have.value', '2026-07-10');
    cy.get('.sd-picker input').eq(1).should('have.value', '2026-08-15');
  });

  it('emits select with an incomplete range after the first click', () => {
    cy.mount(RangePicker, {
      props: {
        popupVisible: true,
        defaultPickerValue: ['2026-07-01', '2026-08-01'],
        onSelect: cy.spy().as('onSelect'),
      },
    });
    cy.get('.sd-picker-cell[aria-label="2026-07-10"]').click();
    cy.get('@onSelect').should((spy: any) => {
      expect(spy.callCount).to.equal(1);
      expect(spy.firstCall.args[0]).to.deep.equal(['2026-07-10']);
      expect(spy.firstCall.args[1][0]).to.be.instanceOf(Date);
      expect(spy.firstCall.args[2]).to.deep.equal(['2026-07-10']);
    });
  });

  it('marks range cells with start/end/in-range classes', () => {
    cy.mount(RangePicker, {
      props: {
        defaultValue: ['2026-07-10', '2026-07-20'],
        defaultPickerValue: ['2026-07-01', '2026-08-01'],
        popupVisible: true,
      },
    });
    cy.get('.sd-picker-cell[aria-label="2026-07-10"]').should(
      'have.class',
      'sd-picker-cell-range-start',
    );
    cy.get('.sd-picker-cell[aria-label="2026-07-20"]').should(
      'have.class',
      'sd-picker-cell-range-end',
    );
    cy.get('.sd-picker-cell[aria-label="2026-07-15"]').should(
      'have.class',
      'sd-picker-cell-in-range',
    );
  });

  it('disables individual inputs with array disabled', () => {
    cy.mount(RangePicker, { props: { disabled: [true, false] } });
    cy.get('.sd-picker input').eq(0).should('be.disabled');
    cy.get('.sd-picker input').eq(1).should('not.be.disabled');
  });

  it('renders a custom separator', () => {
    cy.mount(RangePicker, { props: { separator: '至' } });
    cy.get('.sd-picker-separator').should('have.text', '至');
  });

  it('clears the previous range on reselect when clearRangeOnReselect is set', () => {
    cy.mount(RangePicker, {
      props: {
        defaultValue: ['2026-07-10', '2026-07-20'],
        defaultPickerValue: ['2026-07-01', '2026-08-01'],
        popupVisible: true,
        clearRangeOnReselect: true,
        onChange: cy.spy().as('onChange'),
        onSelect: cy.spy().as('onSelect'),
      },
    });
    cy.get('.sd-picker-cell[aria-label="2026-07-12"]').click();
    cy.get('@onSelect').should((spy: any) => {
      expect(spy.lastCall.args[0]).to.deep.equal(['2026-07-12']);
    });
    cy.get('@onChange').should((spy: any) => {
      expect(spy.callCount).to.equal(0);
    });
  });

  it('selects a shortcut range and emits select-shortcut', () => {
    cy.mount(RangePicker, {
      props: {
        popupVisible: true,
        shortcuts: [{ label: '七月', value: ['2026-07-01', '2026-07-31'] }],
        onChange: cy.spy().as('onChange'),
        onSelectShortcut: cy.spy().as('onSelectShortcut'),
      },
    });
    cy.get('.sd-picker-shortcuts').contains('button', '七月').click();
    cy.get('@onChange').should((spy: any) => {
      expect(spy.firstCall.args[0]).to.deep.equal(['2026-07-01', '2026-07-31']);
    });
    cy.get('@onSelectShortcut').should((spy: any) => {
      expect(spy.firstCall.args[0].label).to.equal('七月');
    });
  });
});
