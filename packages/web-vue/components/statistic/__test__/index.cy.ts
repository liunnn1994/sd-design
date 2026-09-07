import Statistic, { Countdown } from '../index';

describe('Statistic', () => {
  it('renders numeric values with NumberFlow and enables animation by default', () => {
    cy.mount(Statistic, { props: { value: 1234.5, precision: 1, showGroupSeparator: true } });
    cy.get('.sd-statistic-value .sd-number-flow')
      .should('have.class', 'sd-number-flow-animated')
      .and('have.attr', 'aria-label', '1,234.5');
  });

  it('can disable numeric animation', () => {
    cy.mount(Statistic, { props: { value: 42, animation: false } });
    cy.get('.sd-statistic-value .sd-number-flow').should(
      'not.have.class',
      'sd-number-flow-animated',
    );
  });

  it('renders the placeholder when value is undefined', () => {
    cy.mount(Statistic, { props: { placeholder: 'No data' } });
    cy.get('.sd-statistic-value').should('contain.text', 'No data');
    cy.get('.sd-statistic-value .sd-number-flow').should('not.exist');
  });

  it('formats a Date value with the dayjs format instead of NumberFlow', () => {
    cy.mount(Statistic, {
      props: { value: new Date(2020, 0, 1, 12, 30, 45), format: 'HH:mm:ss' },
    });
    cy.get('.sd-statistic-value').should('have.text', '12:30:45');
    // 日期模式不走 NumberFlow
    cy.get('.sd-statistic-value .sd-number-flow').should('not.exist');
  });

  it('formats numbers with precision and group separator', () => {
    cy.mount(Statistic, {
      props: { value: 1234567.891, precision: 2, showGroupSeparator: true, animation: false },
    });
    cy.get('.sd-statistic-value .sd-number-flow').should('have.attr', 'aria-label', '1,234,567.89');
  });

  it('starts from valueFrom and reaches value only after start becomes true', () => {
    cy.mount(Statistic, { props: { value: 100, valueFrom: 0, start: false } });
    cy.get('.sd-statistic-value .sd-number-flow').should('have.attr', 'aria-label', '0');
    cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.setProps({ start: true })));
    cy.get('.sd-statistic-value .sd-number-flow').should('have.attr', 'aria-label', '100');
  });

  it('updates the displayed value when the value prop changes', () => {
    cy.mount(Statistic, { props: { value: 5, animation: false } });
    cy.get('.sd-statistic-value .sd-number-flow').should('have.attr', 'aria-label', '5');
    cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.setProps({ value: 8 })));
    cy.get('.sd-statistic-value .sd-number-flow').should('have.attr', 'aria-label', '8');
  });

  it('renders title/extra props and prefix/suffix slots', () => {
    cy.mount(Statistic, {
      props: { value: 36, title: 'Users', extra: '+5%' },
      slots: { prefix: '<span>~</span>', suffix: '<span>人</span>' },
    });
    cy.get('.sd-statistic-title').should('have.text', 'Users');
    cy.get('.sd-statistic-extra').should('have.text', '+5%');
    cy.get('.sd-statistic-prefix').should('have.text', '~');
    cy.get('.sd-statistic-suffix').should('have.text', '人');
  });

  it('applies valueStyle to the value element', () => {
    cy.mount(Statistic, { props: { value: 1, valueStyle: { color: 'rgb(255, 0, 0)' } } });
    cy.get('.sd-statistic-value').should('have.css', 'color', 'rgb(255, 0, 0)');
  });
});

describe('Countdown', () => {
  it('renders numeric parts with NumberFlow and can disable animation', () => {
    const now = Date.now();
    cy.mount(Countdown, {
      props: {
        value: now + 5000,
        now,
        start: false,
        animation: false,
        format: 'mm:ss.SSS',
      },
    });

    cy.get('.sd-statistic-value .sd-number-flow').should('have.length.greaterThan', 0);
    cy.get('.sd-statistic-value .sd-number-flow-animated').should('not.exist');
  });

  it('counts down and emits finish exactly once when the deadline passes', () => {
    const now = Date.now();
    cy.clock(now);
    cy.mount(Countdown, {
      props: { value: now + 1000, now, start: true, animation: false, format: 'mm:ss' },
    });
    cy.get('.sd-statistic-value .sd-number-flow').eq(0).should('have.attr', 'aria-label', '00');
    cy.get('.sd-statistic-value .sd-number-flow').eq(1).should('have.attr', 'aria-label', '01');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('finish')).to.equal(undefined);
    });
    cy.tick(1100);
    cy.get('.sd-statistic-value .sd-number-flow').eq(0).should('have.attr', 'aria-label', '00');
    cy.get('.sd-statistic-value .sd-number-flow').eq(1).should('have.attr', 'aria-label', '00');
    cy.get('@vue').should(({ wrapper }) => {
      const finish = wrapper.emitted('finish');
      expect(finish).to.not.equal(undefined);
      expect(finish!.length).to.equal(1);
    });
  });

  it('does not tick while start is false and starts when it becomes true', () => {
    const now = Date.now();
    cy.clock(now);
    cy.mount(Countdown, {
      props: { value: now + 5000, now, start: false, animation: false, format: 'mm:ss' },
    });
    cy.get('.sd-statistic-value .sd-number-flow').eq(1).should('have.attr', 'aria-label', '05');
    cy.tick(2000);
    cy.get('.sd-statistic-value .sd-number-flow').eq(1).should('have.attr', 'aria-label', '05');
    cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.setProps({ start: true })));
    cy.tick(6000);
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('finish')).to.not.equal(undefined);
    });
  });
});
