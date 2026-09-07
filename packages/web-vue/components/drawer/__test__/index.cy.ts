import { defineComponent, ref } from 'vue';

import ConfigProvider from '../../config-provider';
import Ellipsis from '../../ellipsis';
import Drawer from '../drawer.vue';

const baseSlots = { default: '<div>Drawer Body</div>' };

describe('Drawer', () => {
  it('renders with title, body and an ellipsis tooltip on the title', () => {
    cy.mount(Drawer, {
      props: { title: 'Title', defaultVisible: true, renderToBody: false },
      slots: baseSlots,
    });
    cy.get('.sd-drawer').should('exist');
    cy.contains('Drawer Body').should('exist');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.findComponent(Ellipsis).props('tooltip')).to.equal(true);
    });
  });

  it('emits cancel then ok on footer button clicks', () => {
    cy.mount(Drawer, {
      props: { title: 'Title', defaultVisible: true, renderToBody: false },
      slots: baseSlots,
    });
    cy.get('.sd-btn').eq(0).click({ force: true });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('cancel')).to.have.length(1);
    });
    cy.get('.sd-btn').eq(1).click({ force: true });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('ok')).to.have.length(1);
    });
  });

  it('uses drawer defaults from the config-provider', () => {
    cy.mount(
      defineComponent({
        components: { ConfigProvider, Drawer },
        template: `
          <config-provider
            :drawer="{
              closable: false,
              okText: '全局确认',
              height: 360,
              mask: false,
              hideCancel: true,
              placement: 'bottom',
              escToClose: false,
              titleEllipsisTooltip: false,
            }"
          >
            <drawer title="Title" default-visible :render-to-body="false">
              <div>Drawer Body</div>
            </drawer>
          </config-provider>
        `,
      }),
    );
    cy.get('.sd-drawer-mask').should('not.exist');
    cy.get('.sd-drawer-close-btn').should('not.exist');
    cy.contains('全局确认').should('exist');
    cy.get('.sd-drawer')
      .invoke('attr', 'style')
      .should('contain', 'height: 360px')
      .and('contain', 'bottom: 0px');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.findComponent(Ellipsis).props('tooltip')).to.equal(false);
    });
    cy.document().trigger('keydown', { key: 'Escape' });
    cy.get('.sd-drawer').should('exist');
  });

  it('prefers explicit drawer props over config-provider defaults', () => {
    cy.mount(
      defineComponent({
        components: { ConfigProvider, Drawer },
        template: `
          <config-provider :drawer="{ closable: false, okText: '全局确认', titleEllipsisTooltip: false }">
            <drawer
              title="Title"
              default-visible
              :render-to-body="false"
              closable
              ok-text="本地确认"
              :title-ellipsis-tooltip="true"
            >
              <div>Drawer Body</div>
            </drawer>
          </config-provider>
        `,
      }),
    );
    cy.get('.sd-drawer-close-btn').should('exist');
    cy.contains('本地确认').should('exist');
    cy.contains('全局确认').should('not.exist');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.findComponent(Ellipsis).props('tooltip')).to.equal(true);
    });
  });

  it('exposes dialog role with aria-labelledby / aria-describedby', () => {
    cy.mount(Drawer, {
      props: { title: 'My Title', defaultVisible: true, renderToBody: false },
      slots: baseSlots,
    });
    cy.get('.sd-drawer').should('have.attr', 'role', 'dialog');
    cy.get('.sd-drawer').should('have.attr', 'aria-modal', 'true');
    cy.get('.sd-drawer-title').then(($title) => {
      cy.get('.sd-drawer').should('have.attr', 'aria-labelledby', $title.attr('id'));
    });
    cy.get('.sd-drawer-body').then(($body) => {
      cy.get('.sd-drawer').should('have.attr', 'aria-describedby', $body.attr('id'));
    });
  });

  it('moves focus into the drawer on open and releases it on ESC close', () => {
    // drawer 的 `visible` 默认 false（非 modal 的 undefined），defaultVisible 无效，
    // 故用受控 visible 起始 true 来让抽屉真正显示，v-model 处理 ESC 关闭。
    const Outer = defineComponent({
      components: { Drawer },
      data: () => ({ visible: true }),
      template: `
        <drawer
          v-model:visible="visible"
          :render-to-body="false"
          title="Title"
        ><div>Drawer Body</div></drawer>
      `,
    });
    cy.mount(Outer);
    // 打开后焦点进入抽屉（焦点陷阱激活）
    cy.wrap(null).should(() => {
      expect(document.activeElement?.closest('.sd-drawer')).to.not.equal(null);
    });
    // ESC 关闭后焦点离开抽屉（陷阱失活）
    cy.get('.sd-drawer').trigger('keydown', { key: 'Escape' });
    cy.get('.sd-drawer').should('not.be.visible');
    cy.wrap(null).should(() => {
      expect(document.activeElement?.closest('.sd-drawer')).to.equal(null);
    });
  });

  it('closes via mask click and emits cancel / update:visible', () => {
    // harness 显式转发 drawer 事件：wrapper.emitted() 只记录根组件自身发出的事件
    cy.mount(
      defineComponent({
        components: { Drawer },
        data: () => ({ visible: true }),
        methods: {
          onUpdateVisible(visible: boolean) {
            this.visible = visible;
            this.$emit('update:visible', visible);
          },
        },
        template: `
          <drawer
            :visible="visible"
            :render-to-body="false"
            title="Title"
            @update:visible="onUpdateVisible"
            @cancel="$emit('cancel')"
          >
            <div>Drawer Body</div>
          </drawer>
        `,
      }),
    );
    cy.get('.sd-drawer').should('be.visible');
    // 点击坐标避开右侧抽屉面板（force 点击中心会落在面板上而不是遮罩）
    cy.get('.sd-drawer-mask').click(10, 10, { force: true });
    cy.get('.sd-drawer').should('not.be.visible');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('cancel')).to.have.length(1);
      const events = wrapper.emitted('update:visible') ?? [];
      expect(events[0]).to.deep.equal([false]);
    });
  });

  it('keeps the drawer open when maskClosable is false', () => {
    cy.mount(
      defineComponent({
        components: { Drawer },
        data: () => ({ visible: true }),
        template: `
          <drawer
            v-model:visible="visible"
            :render-to-body="false"
            title="Title"
            :mask-closable="false"
            @cancel="$emit('cancel')"
          >
            <div>Drawer Body</div>
          </drawer>
        `,
      }),
    );
    cy.get('.sd-drawer').should('be.visible');
    // 点击坐标避开右侧抽屉面板（force 点击中心会落在面板上而不是遮罩）
    cy.get('.sd-drawer-mask').click(10, 10, { force: true });
    cy.get('.sd-drawer').should('be.visible');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('cancel')).to.equal(undefined);
    });
  });

  it('blocks ok when onBeforeOk returns false', () => {
    cy.mount(
      defineComponent({
        components: { Drawer },
        data: () => ({ visible: true }),
        methods: {
          onBeforeOk: () => false,
        },
        template: `
          <drawer
            v-model:visible="visible"
            :render-to-body="false"
            title="Title"
            :on-before-ok="onBeforeOk"
            @ok="$emit('ok')"
          >
            <div>Drawer Body</div>
          </drawer>
        `,
      }),
    );
    cy.get('.sd-btn').eq(1).click();
    cy.get('.sd-drawer').should('be.visible');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('ok')).to.equal(undefined);
      expect(wrapper.emitted('update:visible')).to.equal(undefined);
    });
  });

  it('shows loading while onBeforeOk is pending and closes after done(true)', () => {
    let capturedDone: ((closed: boolean) => void) | undefined;
    cy.mount(
      defineComponent({
        components: { Drawer },
        setup() {
          const visible = ref(true);
          const onBeforeOk = (done: (closed: boolean) => void) => {
            capturedDone = done;
          };
          return { visible, onBeforeOk };
        },
        template: `
          <drawer
            v-model:visible="visible"
            :render-to-body="false"
            title="Title"
            :on-before-ok="onBeforeOk"
            @ok="$emit('ok')"
          >
            <div>Drawer Body</div>
          </drawer>
        `,
      }),
    );
    cy.get('.sd-btn').eq(1).click();
    // onBeforeOk 未返回布尔值时进入 loading，等待 done 回调
    cy.get('.sd-btn').eq(1).should('have.class', 'sd-btn-loading');
    cy.wrap(null).should(() => {
      expect(capturedDone).to.not.equal(undefined);
    });
    cy.then(() => {
      capturedDone!(true);
    });
    cy.get('.sd-btn').eq(1).should('not.have.class', 'sd-btn-loading');
    cy.get('.sd-drawer').should('not.be.visible');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('ok')).to.have.length(1);
    });
  });

  it('blocks cancel when onBeforeCancel returns false', () => {
    cy.mount(
      defineComponent({
        components: { Drawer },
        data: () => ({ visible: true }),
        methods: {
          onBeforeCancel: () => false,
        },
        template: `
          <drawer
            v-model:visible="visible"
            :render-to-body="false"
            title="Title"
            :on-before-cancel="onBeforeCancel"
            @cancel="$emit('cancel')"
          >
            <div>Drawer Body</div>
          </drawer>
        `,
      }),
    );
    cy.get('.sd-drawer-close-btn').click();
    cy.get('.sd-drawer').should('be.visible');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('cancel')).to.equal(undefined);
      expect(wrapper.emitted('update:visible')).to.equal(undefined);
    });
  });

  it('hides header and footer when header/footer are false', () => {
    cy.mount(Drawer, {
      props: { visible: true, renderToBody: false, header: false, footer: false, title: 'Title' },
      slots: baseSlots,
    });
    cy.get('.sd-drawer-header').should('not.exist');
    cy.get('.sd-drawer-footer').should('not.exist');
    cy.get('.sd-drawer-body').should('exist');
  });

  it('hides the cancel button when hideCancel is true', () => {
    cy.mount(Drawer, {
      props: {
        visible: true,
        renderToBody: false,
        hideCancel: true,
        okText: 'Save',
        title: 'Title',
      },
      slots: baseSlots,
    });
    cy.get('.sd-drawer-footer .sd-btn').should('have.length', 1);
    cy.get('.sd-drawer-footer .sd-btn').eq(0).should('have.text', 'Save');
  });

  it('applies okLoading, okButtonProps and cancelButtonProps to footer buttons', () => {
    cy.mount(Drawer, {
      props: {
        visible: true,
        renderToBody: false,
        title: 'Title',
        okLoading: true,
        okButtonProps: { status: 'danger' },
        cancelButtonProps: { status: 'warning' },
      },
      slots: baseSlots,
    });
    cy.get('.sd-drawer-footer .sd-btn').should('have.length', 2);
    cy.get('.sd-drawer-footer .sd-btn')
      .eq(1)
      .should('have.class', 'sd-btn-loading')
      .and('have.class', 'sd-btn-status-danger');
    cy.get('.sd-drawer-footer .sd-btn').eq(0).should('have.class', 'sd-btn-status-warning');
  });

  it('applies okText and cancelText props to footer buttons', () => {
    cy.mount(Drawer, {
      props: {
        visible: true,
        renderToBody: false,
        title: 'Title',
        okText: 'Apply',
        cancelText: 'Discard',
      },
      slots: baseSlots,
    });
    cy.get('.sd-drawer-footer .sd-btn').eq(0).should('have.text', 'Discard');
    cy.get('.sd-drawer-footer .sd-btn').eq(1).should('have.text', 'Apply');
  });

  it('applies placement, width and height via direct props', () => {
    cy.mount(Drawer, {
      props: { visible: true, renderToBody: false, placement: 'top', height: 300 },
      slots: baseSlots,
    });
    cy.get('.sd-drawer')
      .invoke('attr', 'style')
      .should('contain', 'top: 0px')
      .and('contain', 'height: 300px');

    cy.mount(Drawer, {
      props: { visible: true, renderToBody: false, placement: 'left', width: '50%' },
      slots: baseSlots,
    });
    cy.get('.sd-drawer')
      .invoke('attr', 'style')
      .should('contain', 'left: 0px')
      .and('contain', 'width: 50%');

    cy.mount(Drawer, {
      props: { visible: true, renderToBody: false, width: 400 },
      slots: baseSlots,
    });
    cy.get('.sd-drawer').invoke('attr', 'style').should('contain', 'width: 400px');
  });

  it('applies drawerStyle, bodyClass and bodyStyle', () => {
    cy.mount(Drawer, {
      props: {
        visible: true,
        renderToBody: false,
        title: 'Title',
        drawerStyle: { background: 'rgb(1, 2, 3)' },
        bodyClass: 'custom-body',
        bodyStyle: { padding: '24px' },
      },
      slots: baseSlots,
    });
    cy.get('.sd-drawer').invoke('attr', 'style').should('contain', 'background: rgb(1, 2, 3)');
    cy.get('.sd-drawer-body').should('have.class', 'custom-body');
    cy.get('.sd-drawer-body').invoke('attr', 'style').should('contain', 'padding: 24px');
  });

  it('emits beforeOpen on open and beforeClose when closing starts', () => {
    // harness 显式转发 drawer 事件：wrapper.emitted() 只记录根组件自身发出的事件
    cy.mount(
      defineComponent({
        components: { Drawer },
        data: () => ({ visible: false }),
        template: `
          <button class="open-drawer" @click="visible = true">open</button>
          <drawer
            v-model:visible="visible"
            :render-to-body="false"
            title="Title"
            @before-open="$emit('beforeOpen')"
            @before-close="$emit('beforeClose')"
          >
            <div>Drawer Body</div>
          </drawer>
        `,
      }),
    );
    // 用类名限定触发按钮：抽屉隐藏的 footer 里也有 button 元素
    cy.get('.open-drawer').click();
    cy.get('.sd-drawer').should('be.visible');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('beforeOpen')).to.have.length(1);
    });
    cy.get('.sd-drawer').trigger('keydown', { key: 'Escape' });
    cy.get('.sd-drawer').should('not.be.visible');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('beforeClose')).to.have.length(1);
    });
  });

  it('supports custom title and footer slots', () => {
    cy.mount(Drawer, {
      props: { visible: true, renderToBody: false, title: 'Default Title' },
      slots: {
        default: '<div>Drawer Body</div>',
        title: '<span class="custom-title">Custom Title</span>',
        footer: '<div class="custom-footer">Custom Footer</div>',
      },
    });
    // Ellipsis 会把触发器 innerHTML 克隆进隐藏测量节点，标题出现两次，取第一个断言
    cy.get('.sd-drawer-title .custom-title').first().should('have.text', 'Custom Title');
    cy.get('.sd-drawer-footer .custom-footer').should('have.text', 'Custom Footer');
    cy.get('.sd-drawer-footer .sd-btn').should('not.exist');
    cy.get('.sd-drawer-close-btn').should('exist');
  });

  it('replaces the whole header via the header slot', () => {
    cy.mount(Drawer, {
      props: { visible: true, renderToBody: false },
      slots: {
        default: '<div>Drawer Body</div>',
        header: '<div class="custom-header">Custom Header</div>',
      },
    });
    cy.get('.sd-drawer-header .custom-header').should('have.text', 'Custom Header');
    cy.get('.sd-drawer-title').should('not.exist');
    cy.get('.sd-drawer-close-btn').should('not.exist');
  });

  it('teleports into a custom popupContainer', () => {
    cy.mount(
      defineComponent({
        components: { Drawer },
        template: `
          <div>
            <div id="drawer-target"></div>
            <drawer :visible="true" popup-container="#drawer-target" title="Title">
              <div>Drawer Body</div>
            </drawer>
          </div>
        `,
      }),
    );
    cy.get('#drawer-target .sd-drawer-container').should('exist');
    cy.get('#drawer-target .sd-drawer').should('exist');
    // 非 body 容器：容器使用 absolute 定位而非 fixed + zIndex
    cy.get('#drawer-target .sd-drawer-container')
      .invoke('attr', 'style')
      .should('contain', 'position: absolute');
  });
});
