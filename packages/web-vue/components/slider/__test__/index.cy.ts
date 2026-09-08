import Slider from '../index';

describe('Slider', () => {
  it('renders repeating-decimal percentages without precision boundary warnings', () => {
    cy.window().then((win) => {
      cy.spy(win.console, 'warn').as('consoleWarn');
    });
    cy.mount(Slider, {
      props: {
        min: 0,
        max: 3,
        modelValue: 2,
        marks: { 1: 'one', 2: 'two' },
      },
    });
    cy.get('.sd-slider-bar').should('have.attr', 'style').and('contain', 'right: 33.33%');
    cy.get('.sd-slider-dot-wrapper').eq(0).should('have.attr', 'style').and('contain', '33.33%');
    cy.get('.sd-slider-mark').eq(1).should('have.attr', 'style').and('contain', '66.67%');
    cy.get('@consoleWarn').should((consoleWarn) => {
      expect(consoleWarn).not.to.have.been.calledWithMatch(
        Cypress.sinon.match('is beyond boundary when transfer to integer'),
      );
    });
  });

  it('renders a draggable handle', () => {
    cy.mount(Slider);
    cy.get('.sd-slider-btn').should('exist');
  });

  it('keeps the tooltip anchored to the handle while dragging', () => {
    cy.mount(Slider, {
      props: { defaultValue: 20 },
      attrs: { style: 'width: 400px; margin: 100px;' },
    });

    cy.get('.sd-slider-track').then(($track) => {
      const trackRect = $track[0].getBoundingClientRect();
      cy.get('.sd-slider-btn').trigger('mousedown');
      cy.get('.sd-slider-btn').should('have.attr', 'aria-describedby');
      cy.window().then((win) => {
        win.dispatchEvent(
          new MouseEvent('mousemove', {
            clientX: trackRect.left + trackRect.width * 0.8,
            clientY: trackRect.top + trackRect.height / 2,
          }),
        );
      });
    });

    cy.get('[role="tooltip"]').should(($popup) => {
      expect($popup.is(':visible')).to.equal(true);
      expect($popup[0].parentElement).to.equal(document.body);
      expect($popup.find('.sd-tooltip-content')[0].style.translate).to.equal('');
      expect($popup.find('.sd-tooltip-popup-arrow')[0].style.translate).to.equal('');
      expect($popup.attr('style')).not.to.contain('left: 80%');
    });
    cy.get('.sd-slider-btn').then(($button) => {
      cy.get('[role="tooltip"]').should(($popup) => {
        const buttonRect = $button[0].getBoundingClientRect();
        const popupRect = $popup[0].getBoundingClientRect();
        expect(popupRect.left + popupRect.width / 2).to.be.closeTo(
          buttonRect.left + buttonRect.width / 2,
          1,
        );
      });
    });
  });

  it('handle has slider role with aria-value* and moves via arrow keys', () => {
    cy.mount(Slider, { props: { min: 0, max: 100, step: 10, modelValue: 20 } });
    cy.get('.sd-slider-btn').should('have.attr', 'role', 'slider');
    cy.get('.sd-slider-btn').should('have.attr', 'aria-valuemin', '0');
    cy.get('.sd-slider-btn').should('have.attr', 'aria-valuemax', '100');
    cy.get('.sd-slider-btn').should('have.attr', 'aria-valuenow', '20');
    // ArrowRight 按 step(10) 增加
    cy.get('.sd-slider-btn').trigger('keydown', { key: 'ArrowRight' });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')?.[0]?.[0]).to.equal(30);
    });
  });

  it('sets the value from a track click and emits update:modelValue and change', () => {
    cy.mount(Slider, {
      props: { min: 0, max: 100 },
      attrs: { style: 'width: 400px; margin: 100px;' },
    });

    // 点击轨道 40% 处：diff=160px，stepLength=4px → 40
    cy.get('.sd-slider-track').trigger('click', 160, 5);
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('update:modelValue')?.[0]?.[0]).to.equal(40);
      expect(wrapper.emitted('change')?.[0]?.[0]).to.equal(40);
    });
    cy.get('.sd-slider-btn').should('have.attr', 'aria-valuenow', '40');
    // 单值模式 bar 从最小值填充到当前值（0% → 40%）
    cy.get('.sd-slider-bar')
      .should('have.attr', 'style')
      .and('contain', 'left: 0%')
      .and('contain', 'right: 60%');
  });

  it('ignores track clicks while disabled', () => {
    cy.mount(Slider, { props: { disabled: true } });

    cy.get('.sd-slider-track').should('have.class', 'sd-slider-track-disabled');
    cy.get('.sd-slider-track').trigger('click', 100, 5);
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')).to.equal(undefined);
    });
  });

  it('moves to min with Home and to max with End', () => {
    cy.mount(Slider, { props: { min: 0, max: 100, step: 10, defaultValue: 50 } });

    cy.get('.sd-slider-btn').trigger('keydown', { key: 'Home' });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')?.[0]?.[0]).to.equal(0);
    });
    cy.get('.sd-slider-btn').should('have.attr', 'aria-valuenow', '0');

    cy.get('.sd-slider-btn').trigger('keydown', { key: 'End' });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')?.[1]?.[0]).to.equal(100);
    });
    cy.get('.sd-slider-btn').should('have.attr', 'aria-valuenow', '100');
  });

  it('supports ArrowUp and ArrowDown keys', () => {
    cy.mount(Slider, { props: { min: 0, max: 100, step: 10, defaultValue: 50 } });

    cy.get('.sd-slider-btn').trigger('keydown', { key: 'ArrowUp' });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')?.[0]?.[0]).to.equal(60);
    });
    cy.get('.sd-slider-btn').trigger('keydown', { key: 'ArrowDown' });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')?.[1]?.[0]).to.equal(50);
    });
  });

  it('clamps keyboard steps to min and max in single-value mode', () => {
    cy.mount(Slider, { props: { min: 0, max: 100, step: 10, defaultValue: 95 } });

    cy.get('.sd-slider-btn').trigger('keydown', { key: 'ArrowRight' });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')?.[0]?.[0]).to.equal(100);
    });
    cy.get('.sd-slider-btn').trigger('keydown', { key: 'ArrowLeft' });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')?.[1]?.[0]).to.equal(90);
    });
  });

  it('renders two handles with separate aria values in range mode', () => {
    cy.mount(Slider, { props: { range: true, defaultValue: [20, 60] } });

    cy.get('.sd-slider-btn').should('have.length', 2);
    cy.get('.sd-slider-btn').eq(0).should('have.attr', 'aria-valuenow', '20');
    cy.get('.sd-slider-btn').eq(1).should('have.attr', 'aria-valuenow', '60');
  });

  it('clamps the range start handle to end - step with the End key', () => {
    cy.mount(Slider, { props: { range: true, step: 10, defaultValue: [20, 60] } });

    cy.get('.sd-slider-btn').eq(0).trigger('keydown', { key: 'End' });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')?.[0]?.[0]).to.deep.equal([50, 60]);
    });
    cy.get('.sd-slider-btn').eq(0).should('have.attr', 'aria-valuenow', '50');
    cy.get('.sd-slider-btn').eq(1).should('have.attr', 'aria-valuenow', '60');
  });

  it('clamps the range end handle to start + step with the Home key', () => {
    cy.mount(Slider, { props: { range: true, step: 10, defaultValue: [20, 90] } });

    cy.get('.sd-slider-btn').eq(1).trigger('keydown', { key: 'Home' });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')?.[0]?.[0]).to.deep.equal([20, 30]);
    });
    cy.get('.sd-slider-btn').eq(1).should('have.attr', 'aria-valuenow', '30');
  });

  it('syncs the handle when the controlled modelValue changes', () => {
    cy.mount(Slider, { props: { modelValue: 20 } });
    cy.get('.sd-slider-btn').should('have.attr', 'aria-valuenow', '20');

    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ modelValue: 60 }));
    cy.get('.sd-slider-btn').should('have.attr', 'aria-valuenow', '60');
  });

  it('syncs both handles when the controlled range modelValue changes', () => {
    cy.mount(Slider, { props: { range: true, modelValue: [20, 60] } });
    cy.get('.sd-slider-btn').eq(0).should('have.attr', 'aria-valuenow', '20');
    cy.get('.sd-slider-btn').eq(1).should('have.attr', 'aria-valuenow', '60');

    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ modelValue: [40, 80] }));
    cy.get('.sd-slider-btn').eq(0).should('have.attr', 'aria-valuenow', '40');
    cy.get('.sd-slider-btn').eq(1).should('have.attr', 'aria-valuenow', '80');
  });

  it('applies formatTooltip to aria-valuetext', () => {
    cy.mount(Slider, { props: { modelValue: 50, formatTooltip: (v: number) => `${v}%` } });
    cy.get('.sd-slider-btn').should('have.attr', 'aria-valuetext', '50%');
  });

  it('renders interior ticks with active state', () => {
    cy.mount(Slider, { props: { showTicks: true, step: 25, defaultValue: 50 } });
    cy.get('.sd-slider-tick').should('have.length', 3);
    cy.get('.sd-slider-tick-active').should('have.length', 2);
  });

  it('activates marks and dots inside the selected range', () => {
    cy.mount(Slider, { props: { marks: { 0: 'a', 50: 'b', 100: 'c' }, defaultValue: 50 } });

    cy.get('.sd-slider-dot').should('have.length', 3);
    cy.get('.sd-slider-dot').eq(0).should('have.class', 'sd-slider-dot-active');
    cy.get('.sd-slider-dot').eq(1).should('have.class', 'sd-slider-dot-active');
    cy.get('.sd-slider-dot').eq(2).should('not.have.class', 'sd-slider-dot-active');
    cy.get('.sd-slider-mark').should('have.length', 3);
  });

  it('applies vertical direction classes and bottom positioning', () => {
    cy.mount(Slider, { props: { direction: 'vertical', defaultValue: 50 } });

    cy.get('.sd-slider').should('have.class', 'sd-slider-vertical');
    cy.get('.sd-slider-track').should('have.class', 'sd-slider-track-vertical');
    cy.get('.sd-slider-btn').should('have.attr', 'style').and('contain', 'bottom: 50%');
  });

  it('updates the value through the input field (showInput)', () => {
    cy.mount(Slider, { props: { showInput: true, min: 0, max: 100, defaultValue: 20 } });

    cy.get('.sd-slider-input input').clear().type('80{enter}');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')?.at(-1)?.[0]).to.equal(80);
    });
    cy.get('.sd-slider-btn').should('have.attr', 'aria-valuenow', '80');
  });

  it('updates both handles through the range input fields', () => {
    cy.mount(Slider, { props: { showInput: true, range: true, defaultValue: [10, 50] } });

    cy.get('.sd-slider-input input').eq(0).clear().type('30{enter}');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')?.at(-1)?.[0]).to.deep.equal([30, 50]);
    });
    cy.get('.sd-slider-input input').eq(1).clear().type('80{enter}');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')?.at(-1)?.[0]).to.deep.equal([30, 80]);
    });
    cy.get('.sd-slider-btn').eq(1).should('have.attr', 'aria-valuenow', '80');
  });

  it('moves the nearest handle on range track clicks', () => {
    cy.mount(Slider, {
      props: { range: true, defaultValue: [20, 60] },
      attrs: { style: 'width: 400px; margin: 100px;' },
    });

    // 点击 5% 处：距 start(20) 15、距 end(60) 55 → 移动 start
    cy.get('.sd-slider-track').trigger('click', 20, 5);
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')?.[0]?.[0]).to.deep.equal([5, 60]);
    });

    // 点击 95% 处：距 start(5) 90、距 end(60) 35 → 移动 end
    cy.get('.sd-slider-track').trigger('click', 380, 5);
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')?.at(-1)?.[0]).to.deep.equal([5, 95]);
    });
  });

  it('sorts the range instead of emitting inverted values when start input exceeds end', () => {
    cy.mount(Slider, { props: { showInput: true, range: true, defaultValue: [30, 50] } });

    cy.get('.sd-slider-input input').eq(0).clear().type('80{enter}');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')?.at(-1)?.[0]).to.deep.equal([50, 80]);
    });
    cy.get('.sd-slider-btn').eq(0).should('have.attr', 'aria-valuenow', '50');
    cy.get('.sd-slider-btn').eq(1).should('have.attr', 'aria-valuenow', '80');
  });

  it('uses modelValue[0] when a non-range slider receives an array modelValue', () => {
    cy.mount(Slider, { props: { modelValue: [50, 60] } });
    cy.get('.sd-slider-btn').should('have.attr', 'aria-valuenow', '50');
  });

  it('clamps handle position at 100% for values beyond max', () => {
    cy.mount(Slider, { props: { modelValue: 120 } });
    cy.get('.sd-slider-btn').should('have.attr', 'style').and('contain', 'left: 100%');
  });
});
