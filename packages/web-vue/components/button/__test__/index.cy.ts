import { configProviderInjectionKey } from '../../config-provider/context';
import IconPlus from '../../icon/icon-plus';
import Button, { ButtonGroup } from '../index';

describe('Button', () => {
  it('should emit click event', () => {
    cy.mount(Button);
    cy.get('button').click();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('click')).to.have.length(1);
    });
  });

  it('should not emit click event when disabled', () => {
    cy.mount(Button, { props: { disabled: true } });
    cy.get('button').click({ force: true });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('click')).to.equal(undefined);
    });
  });

  it('should add loading fixed width class when loadingFixedWidth is true', () => {
    cy.mount(Button, { props: { loading: true, loadingFixedWidth: true } });
    cy.get('button').should('have.class', 'sd-btn-loading-fixed-width');
  });

  it('should add two chinese chars class when autoInsertSpaceInButton is enabled', () => {
    cy.mount(Button, {
      global: {
        provide: {
          [configProviderInjectionKey as symbol]: {
            autoInsertSpaceInButton: true,
          },
        },
      },
      slots: {
        default: '测试',
      },
    });
    cy.get('button').should('have.class', 'sd-btn-two-chinese-chars');
  });

  it('should render tooltip from a string prop on hover', () => {
    cy.mount(Button, { props: { tooltip: '提示内容' } });
    cy.get('button').trigger('mouseenter');
    cy.get('.sd-tooltip-content').should('contain', '提示内容');
  });

  it('should inherit Tooltip props via object tooltip', () => {
    cy.mount(Button, {
      props: {
        tooltip: {
          content: '对象内容',
          mini: true,
          defaultPopupVisible: true,
          renderToBody: false,
        },
      },
    });
    cy.get('.sd-tooltip-content').should('contain', '对象内容');
    cy.get('.sd-tooltip-content').should('have.class', 'sd-tooltip-mini');
  });

  it('should render tooltip from the tooltip slot', () => {
    cy.mount(Button, {
      props: { tooltip: { defaultPopupVisible: true, renderToBody: false } },
      slots: { tooltip: '自定义提示' },
    });
    cy.get('.sd-tooltip-content').should('contain', '自定义提示');
  });

  it('should not render a tooltip when none is provided', () => {
    cy.mount(Button);
    cy.get('button').trigger('mouseenter');
    cy.get('.sd-tooltip').should('not.exist');
  });

  it('should keep an icon centered when using the sr-only slot', () => {
    cy.mount(Button, {
      props: { size: 'small' },
      slots: {
        'icon': IconPlus,
        'sr-only': '新增',
      },
    });

    cy.get('button').should('have.class', 'sd-btn-only-icon').and('have.text', '新增');
    cy.get('button').should('have.css', 'width', '28px').and('have.css', 'padding-left', '0px');
    cy.get('.sd-btn-icon').should('have.css', 'margin-right', '0px');
  });

  it('should apply default type, size, shape, status, and htmlType', () => {
    cy.mount(Button);
    cy.get('button')
      .should('have.class', 'sd-btn-secondary')
      .and('have.class', 'sd-btn-size-medium')
      .and('have.class', 'sd-btn-shape-square')
      .and('have.class', 'sd-btn-status-normal')
      .and('have.attr', 'type', 'button');
  });

  it('should apply type, shape, and status classes', () => {
    cy.mount(Button, {
      props: { type: 'primary', shape: 'round', status: 'danger' },
    });
    cy.get('button')
      .should('have.class', 'sd-btn-primary')
      .and('have.class', 'sd-btn-shape-round')
      .and('have.class', 'sd-btn-status-danger');
  });

  it('should apply size classes for every size option', () => {
    const sizes = ['mini', 'small', 'medium', 'large'] as const;
    for (const size of sizes) {
      cy.mount(Button, { props: { size } });
      cy.get('button').should('have.class', `sd-btn-size-${size}`);
    }
  });

  it('should add long class and fill the container width when long is true', () => {
    cy.mount({
      components: { Button },
      template: `<div style="width: 300px"><Button long>按钮</Button></div>`,
    });
    cy.get('button').should('have.class', 'sd-btn-long').and('have.css', 'width', '300px');
  });

  it('should set the native type attribute from htmlType', () => {
    cy.mount(Button, { props: { htmlType: 'submit' } });
    cy.get('button').should('have.attr', 'type', 'submit');
  });

  it('should set the autofocus attribute when autofocus is true', () => {
    cy.mount(Button, { props: { autofocus: true } });
    cy.get('button').should('have.attr', 'autofocus');
  });

  it('should show a spinning loading icon and suppress click while loading', () => {
    cy.mount(Button, { props: { loading: true } });
    cy.get('button')
      .should('have.class', 'sd-btn-loading')
      .find('.sd-btn-icon .sd-icon-loading')
      .should('have.class', 'sd-icon-spin');
    cy.get('button').click({ force: true });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('click')).to.equal(undefined);
    });
  });

  it('should replace the icon slot with a loading icon when loading', () => {
    cy.mount(Button, {
      props: { loading: true },
      slots: { icon: IconPlus },
    });
    cy.get('button').find('.sd-btn-icon .sd-icon-plus').should('not.exist');
    cy.get('button').find('.sd-btn-icon .sd-icon-loading').should('exist');
  });

  it('should render an anchor that emits click when href is set', () => {
    cy.mount(Button, { props: { href: 'javascript:void 0;' } });
    cy.get('a').should('have.class', 'sd-btn-link').and('have.attr', 'href', 'javascript:void 0;');
    cy.get('a').click();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('click')).to.have.length(1);
      const ev = wrapper.emitted('click')![0][0] as MouseEvent;
      expect(ev.defaultPrevented).to.equal(false);
    });
  });

  it('should strip href and suppress click when a link button is disabled', () => {
    cy.mount(Button, { props: { href: 'https://example.com', disabled: true } });
    cy.get('a').should('not.have.attr', 'href');
    cy.get('a').click({ force: true });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('click')).to.equal(undefined);
    });
  });

  it('should fall through attrs (class, aria-label) to the button element', () => {
    cy.mount(Button, {
      attrs: {
        'class': 'custom-class',
        'aria-label': '删除',
      },
    });
    cy.get('button').should('have.class', 'custom-class').and('have.attr', 'aria-label', '删除');
  });

  it('should not add the two chinese chars class for other text lengths', () => {
    cy.mount(Button, {
      global: {
        provide: {
          [configProviderInjectionKey as symbol]: {
            autoInsertSpaceInButton: true,
          },
        },
      },
      slots: { default: '确认提交' },
    });
    cy.get('button').should('not.have.class', 'sd-btn-two-chinese-chars');
  });
});

describe('ButtonGroup', () => {
  it('should pass type, size, status, and shape down to child buttons', () => {
    cy.mount({
      components: { Button, ButtonGroup },
      template: `
        <ButtonGroup type="primary" size="small" status="danger" shape="round">
          <Button>A</Button>
          <Button>B</Button>
        </ButtonGroup>
      `,
    });
    cy.get('.sd-btn-group button')
      .eq(0)
      .should('have.class', 'sd-btn-primary')
      .and('have.class', 'sd-btn-size-small')
      .and('have.class', 'sd-btn-status-danger')
      .and('have.class', 'sd-btn-shape-round');
  });

  it('should let a child button override group type, size, status, and shape', () => {
    cy.mount({
      components: { Button, ButtonGroup },
      template: `
        <ButtonGroup type="primary" size="small" status="danger" shape="round">
          <Button type="dashed" size="large" status="warning" shape="circle">B</Button>
        </ButtonGroup>
      `,
    });
    cy.get('.sd-btn-group button')
      .should('have.class', 'sd-btn-dashed')
      .and('have.class', 'sd-btn-size-large')
      .and('have.class', 'sd-btn-status-warning')
      .and('have.class', 'sd-btn-shape-circle');
  });

  it('should disable all child buttons and suppress their click events', () => {
    const onClick = cy.spy().as('onClick');
    cy.mount({
      components: { Button, ButtonGroup },
      setup: () => ({ onClick }),
      template: `
        <ButtonGroup disabled>
          <Button @click="onClick">A</Button>
        </ButtonGroup>
      `,
    });
    cy.get('.sd-btn-group button').should('have.attr', 'disabled');
    cy.get('.sd-btn-group button').should('have.class', 'sd-btn-disabled');
    cy.get('.sd-btn-group button').click({ force: true });
    cy.get('@onClick').should('not.have.been.called');
  });
});
