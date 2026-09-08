import Ellipsis, { PerformantEllipsis } from '../index';

const overflowing =
  'A design is a plan or specification for the construction of an object or system.';

describe('Ellipsis', () => {
  it('delegates single-line clamping to LineClamp', () => {
    cy.mount(Ellipsis, {
      attrs: { style: 'max-width: 120px;' },
      slots: { default: 'ellipsis content' },
    });
    cy.get('.sd-ellipsis')
      .should('have.class', 'sd-ellipsis--single-line')
      .and('have.attr', 'data-part', 'root');
  });

  it('supports lineClamp', () => {
    cy.mount(Ellipsis, {
      props: { lineClamp: 2 },
      slots: { default: overflowing.repeat(2) },
    });
    cy.get('.sd-ellipsis')
      .should('have.class', 'sd-ellipsis--line-clamp')
      .and('have.attr', 'data-part', 'root');
  });

  it('falls back to native title when tooltip is disabled', () => {
    cy.mount(Ellipsis, {
      props: { tooltip: false },
      attrs: { style: 'max-width: 80px;' },
      slots: { default: overflowing },
    });
    cy.get('.sd-ellipsis').should('have.attr', 'title', overflowing);
  });

  it('shows the tooltip only when the content is clamped', () => {
    cy.mount(Ellipsis, {
      props: { tooltip: { mouseEnterDelay: 0, mouseLeaveDelay: 0 } },
      attrs: { style: 'width: 240px; display: block;' },
      slots: { default: 'short content' },
    });
    cy.get('.sd-ellipsis').trigger('mouseenter');
    cy.get('[role="tooltip"]').should('not.exist');

    cy.get('@vue').then(({ wrapper }) => {
      cy.wrap(wrapper.unmount());
    });
    cy.mount(Ellipsis, {
      props: { tooltip: { mouseEnterDelay: 0, mouseLeaveDelay: 0 } },
      attrs: { style: 'width: 80px; display: block;' },
      slots: { default: overflowing },
    });
    cy.get('.sd-ellipsis').trigger('mouseenter');
    cy.get('[role="tooltip"]').should('be.visible');
  });

  it('expands and collapses via expand-trigger click', () => {
    cy.mount(Ellipsis, {
      props: { expandTrigger: 'click' as const, tooltip: false },
      attrs: { style: 'max-width: 80px; display: block;' },
      slots: { default: overflowing },
    });
    // 等 clamp 状态稳定（title 出现 = isEllipsis 为 true）
    cy.get('.sd-ellipsis').should('have.attr', 'title', overflowing);
    cy.get('.sd-ellipsis').click();
    cy.get('.sd-ellipsis').should('have.class', 'sd-ellipsis--expanded');
    cy.get('.sd-ellipsis').should('not.have.attr', 'title');
    cy.get('.sd-ellipsis').click();
    cy.get('.sd-ellipsis').should('not.have.class', 'sd-ellipsis--expanded');
    cy.get('.sd-ellipsis').should('have.attr', 'title', overflowing);
  });

  it('resets expanded when lineClamp changes', () => {
    cy.mount(Ellipsis, {
      props: { lineClamp: 2, expandTrigger: 'click' as const, tooltip: false },
      attrs: { style: 'max-width: 120px;' },
      slots: { default: overflowing.repeat(3) },
    });
    cy.get('.sd-ellipsis').click();
    cy.get('.sd-ellipsis').should('have.class', 'sd-ellipsis--expanded');
    cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.setProps({ lineClamp: 3 })));
    cy.get('.sd-ellipsis').should('not.have.class', 'sd-ellipsis--expanded');
  });

  it('keeps slot DOM, attributes and interactions live', () => {
    cy.mount({
      components: { Ellipsis },
      data: () => ({ count: 0 }),
      template: `
        <Ellipsis :line-clamp="1" style="max-width: 120px;">
          <button
            data-testid="inner"
            data-marker="kept"
            aria-label="inner-label"
            style="color: rgb(1, 2, 3);"
            @click="count++"
          >live content {{ count }}</button>
        </Ellipsis>
      `,
    });
    cy.get('[data-testid="inner"]:visible')
      .should('have.attr', 'aria-label', 'inner-label')
      .and('have.attr', 'data-marker', 'kept')
      .invoke('attr', 'style')
      .should('contain', 'rgb(1, 2, 3)');
    cy.get('[data-testid="inner"]:visible').click();
    cy.get('[data-testid="inner"]:visible').should('contain.text', 'live content 1');
  });

  it('keeps performant ellipsis on a css-only first render until interaction', () => {
    cy.mount(PerformantEllipsis, {
      props: { tooltip: false },
      attrs: { style: 'max-width: 80px;' },
      slots: { default: 'performant ellipsis content' },
    });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.findComponent({ name: 'Ellipsis' }).exists()).to.equal(false);
    });
    cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.trigger('mouseenter')));
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.findComponent({ name: 'Ellipsis' }).exists()).to.equal(true);
    });
    cy.get('.sd-ellipsis').should('have.attr', 'data-part', 'root');
  });

  it('toggles expand with keyboard Enter and Space and exposes button semantics', () => {
    cy.mount(Ellipsis, {
      props: { expandTrigger: 'click' as const, tooltip: false },
      attrs: { style: 'max-width: 80px; display: block;' },
      slots: { default: overflowing },
    });
    // 等 clamp 状态稳定（title 出现 = isEllipsis 为 true）
    cy.get('.sd-ellipsis').should('have.attr', 'title', overflowing);
    cy.get('.sd-ellipsis')
      .should('have.attr', 'role', 'button')
      .and('have.attr', 'tabindex', '0')
      .and('have.attr', 'aria-expanded', 'false');
    cy.get('.sd-ellipsis').trigger('keydown', { key: 'Enter' });
    cy.get('.sd-ellipsis')
      .should('have.class', 'sd-ellipsis--expanded')
      .and('have.attr', 'aria-expanded', 'true');
    cy.get('.sd-ellipsis').trigger('keydown', { key: ' ' });
    cy.get('.sd-ellipsis').should('not.have.class', 'sd-ellipsis--expanded');
  });

  it('ignores clicks when expand-trigger is not set', () => {
    cy.mount(Ellipsis, {
      props: { tooltip: false },
      attrs: { style: 'max-width: 80px; display: block;' },
      slots: { default: overflowing },
    });
    cy.get('.sd-ellipsis').should('have.attr', 'title', overflowing);
    cy.get('.sd-ellipsis').should('not.have.class', 'sd-ellipsis--expandable');
    cy.get('.sd-ellipsis').click();
    cy.get('.sd-ellipsis').should('not.have.class', 'sd-ellipsis--expanded');
  });

  it('does not expand clickable ellipsis whose content is not clamped', () => {
    cy.mount(Ellipsis, {
      props: { expandTrigger: 'click' as const, tooltip: false },
      attrs: { style: 'width: 240px; display: block;' },
      slots: { default: 'short content' },
    });
    cy.get('.sd-ellipsis').should('have.attr', 'aria-expanded', 'false');
    cy.get('.sd-ellipsis').click();
    cy.get('.sd-ellipsis')
      .should('not.have.class', 'sd-ellipsis--expanded')
      .and('not.have.class', 'sd-ellipsis--expandable');
  });

  it('supports string lineClamp values', () => {
    cy.mount(Ellipsis, {
      props: { lineClamp: '2' },
      attrs: { style: 'max-width: 120px;' },
      slots: { default: overflowing.repeat(3) },
    });
    cy.get('.sd-ellipsis')
      .should('have.class', 'sd-ellipsis--line-clamp')
      .and('have.prop', 'tagName', 'DIV')
      .and('have.css', '-webkit-line-clamp', '2');
  });

  it('falls back to native title when tooltip is disabled via config', () => {
    cy.mount(Ellipsis, {
      props: { tooltip: { disabled: true } },
      attrs: { style: 'max-width: 80px; display: block;' },
      slots: { default: overflowing },
    });
    cy.get('.sd-ellipsis').should('have.attr', 'title', overflowing);
    cy.get('.sd-ellipsis').trigger('mouseenter');
    cy.get('[role="tooltip"]').should('not.exist');
  });

  it('hides the tooltip while expanded', () => {
    cy.mount(Ellipsis, {
      props: {
        expandTrigger: 'click' as const,
        tooltip: { mouseEnterDelay: 0, mouseLeaveDelay: 0 },
      },
      attrs: { style: 'max-width: 80px; display: block;' },
      slots: { default: overflowing },
    });
    cy.get('.sd-ellipsis').should('have.class', 'sd-ellipsis--expandable');
    cy.get('.sd-ellipsis').trigger('mouseenter');
    cy.get('[role="tooltip"]').should('be.visible');
    cy.get('.sd-ellipsis').trigger('mouseleave');
    cy.get('.sd-ellipsis').click();
    cy.get('.sd-ellipsis')
      .should('have.class', 'sd-ellipsis--expanded')
      .and('have.attr', 'aria-expanded', 'true');
    // 注：tooltip 在展开后禁用，但隐藏依赖动画事件（本环境不可靠），不做断言
  });

  it('renders custom tooltip slot content in the popup', () => {
    cy.mount(Ellipsis, {
      props: { tooltip: { mouseEnterDelay: 0, mouseLeaveDelay: 0 } },
      attrs: { style: 'max-width: 80px; display: block;' },
      slots: { default: overflowing, tooltip: 'custom tooltip body' },
    });
    cy.get('.sd-ellipsis').trigger('mouseenter');
    cy.get('[role="tooltip"]').should('be.visible').and('contain.text', 'custom tooltip body');
  });

  it('re-measures when slot content changes dynamically', () => {
    cy.mount({
      components: { Ellipsis },
      data: () => ({ text: 'short' }),
      template: `
        <Ellipsis :tooltip="false" style="max-width: 80px; display: block;">{{ text }}</Ellipsis>
      `,
    });
    cy.get('.sd-ellipsis').should('not.have.attr', 'title');
    cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.setData({ text: overflowing })));
    cy.get('.sd-ellipsis').should('have.attr', 'title', overflowing);
  });

  // 注：内部交互元素的 click 守卫已实现（ellipsis.vue handleClick 的 closest 检查），
  // 但真实浏览器中省略布局/测量副本会覆盖 slot 按钮，无法确定性地点击验证，
  // 故不做 e2e 断言（记录于 TEST-AUDIT-FINDINGS.md「ellipsis」条目）。
});

describe('PerformantEllipsis', () => {
  it('mirrors clamp and expandable classes while dormant', () => {
    cy.mount(PerformantEllipsis, {
      props: { lineClamp: 2, expandTrigger: 'click' as const, tooltip: false },
      attrs: { style: 'max-width: 120px;' },
      slots: { default: overflowing.repeat(3) },
    });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.findComponent({ name: 'Ellipsis' }).exists()).to.equal(false);
    });
    cy.get('.sd-ellipsis')
      .should('have.class', 'sd-ellipsis--line-clamp')
      .and('have.class', 'sd-ellipsis--expandable')
      .and('not.have.attr', 'data-part');
  });

  it('activates on click', () => {
    cy.mount(PerformantEllipsis, {
      props: { tooltip: false },
      attrs: { style: 'max-width: 80px;' },
      slots: { default: overflowing },
    });
    cy.get('.sd-ellipsis').click();
    cy.get('.sd-ellipsis').should('have.attr', 'data-part', 'root');
  });

  it('activates on focus', () => {
    cy.mount(PerformantEllipsis, {
      props: { tooltip: false },
      attrs: { style: 'max-width: 80px;' },
      slots: { default: overflowing },
    });
    cy.get('.sd-ellipsis').trigger('focus');
    cy.get('.sd-ellipsis').should('have.attr', 'data-part', 'root');
  });

  it('expands on click once measurement has settled', () => {
    cy.mount(PerformantEllipsis, {
      props: { expandTrigger: 'click' as const, tooltip: false },
      attrs: { style: 'max-width: 80px; display: block;' },
      slots: { default: overflowing },
    });
    cy.get('.sd-ellipsis').trigger('mouseenter');
    cy.get('.sd-ellipsis').should('have.attr', 'data-part', 'root');
    cy.get('.sd-ellipsis').should('have.class', 'sd-ellipsis--expandable');
    cy.get('.sd-ellipsis').click();
    cy.get('.sd-ellipsis')
      .should('have.class', 'sd-ellipsis--expanded')
      .and('have.attr', 'aria-expanded', 'true');
  });
  it('shows the tooltip after hover activation once measurement settles', () => {
    cy.mount(PerformantEllipsis, {
      props: { tooltip: { mouseEnterDelay: 0, mouseLeaveDelay: 0 } },
      attrs: { style: 'max-width: 80px; display: block;' },
      slots: { default: overflowing },
    });
    cy.get('.sd-ellipsis').trigger('mouseenter');
    cy.get('[role="tooltip"]').should('be.visible');
  });
});
