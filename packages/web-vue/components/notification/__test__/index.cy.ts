import { defineComponent } from 'vue';

import Notification from '../index';
import NotificationList from '../notification-list.vue';
import NotificationComponent from '../notification.vue';

describe('Notification', () => {
  afterEach(() => {
    Notification.clear();
  });

  it('renders notifications', () => {
    cy.mount(NotificationList, {
      props: {
        notifications: [
          { id: 0, content: 'Info Message', type: 'info' },
          { id: 1, content: 'Success Message', type: 'success' },
          { id: 2, content: 'Warning Message', type: 'warning' },
          { id: 3, content: 'Error Message', type: 'error' },
        ],
      },
    });
    cy.get('.sd-notification').should('have.length', 4);
  });

  it('shows & removes notifications', () => {
    cy.mount({
      template:
        '<button id="add" @click="handleAdd">Add</button>' +
        '<button id="clear" @click="handleClear">Clear</button>',
      methods: {
        handleAdd() {
          Notification.info({ content: 'Info Message', closable: true });
        },
        handleClear() {
          Notification.clear();
        },
      },
    });
    cy.get('#add').click();
    cy.get('#add').click();
    cy.get('.sd-notification').should('have.length', 2);
    cy.get('.sd-notification-close-btn').first().click({ force: true });
    cy.get('#clear').click();
    cy.get('.sd-notification').should('have.length', 0);
  });

  it('emits close event', () => {
    cy.mount(NotificationList, {
      props: {
        notifications: [{ id: 0, content: 'Info Message', type: 'info', closable: true }],
      },
    });
    cy.get('.sd-notification-close-btn').click({ force: true });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('close')).to.have.length(1);
    });
  });

  it('updates notification content', () => {
    let count = 0;
    cy.mount({
      template: '<button @click="handleClick">Click</button>',
      methods: {
        handleClick() {
          Notification.info({ id: '1', content: `Info Message ${++count}` });
        },
      },
    });
    cy.get('button').click();
    cy.get('.sd-notification').should('contain.text', 'Info Message 1');
    cy.get('button').click();
    cy.get('.sd-notification').should('contain.text', 'Info Message 2');
  });

  it('renders title, content, footer and custom icon slots', () => {
    cy.mount(NotificationComponent, {
      props: { closable: true },
      slots: {
        default: '标题内容',
        content: '正文内容',
        footer: '<button class="footer-action">重试</button>',
        icon: '<span class="custom-icon">图标</span>',
        closeIcon: '<span class="custom-close">关闭</span>',
      },
    });
    cy.get('.sd-notification').should('have.class', 'sd-notification-closable');
    cy.get('.sd-notification-title').should('contain.text', '标题内容');
    cy.get('.sd-notification-content').should('contain.text', '正文内容');
    cy.get('.sd-notification-footer').find('button').should('have.text', '重试');
    cy.get('.sd-notification-icon').find('.custom-icon').should('have.text', '图标');
    cy.get('.sd-notification-close-btn').find('.custom-close').should('have.text', '关闭');
  });

  it('applies type classes and default icons', () => {
    cy.mount(NotificationList, {
      props: {
        notifications: [
          { id: 0, content: '成功通知', type: 'success' },
          { id: 1, content: '错误通知', type: 'error' },
        ],
      },
    });
    cy.get('.sd-notification-success').should('contain.text', '成功通知');
    cy.get('.sd-notification-error').should('contain.text', '错误通知');
    cy.get('.sd-notification-icon svg').should('have.length', 2);
  });

  it('omits the icon area when showIcon is false', () => {
    cy.mount(NotificationComponent, {
      props: { showIcon: false },
      slots: { default: '无图标通知' },
    });
    cy.get('.sd-notification').should('contain.text', '无图标通知');
    cy.get('.sd-notification-left').should('not.exist');
  });

  it('closes automatically after the duration and emits close', () => {
    cy.clock();
    const onClose = cy.spy().as('onClose');
    cy.mount(NotificationComponent, { props: { duration: 1000, onClose } });

    cy.tick(999);
    cy.get('@onClose').should('not.have.been.called');
    cy.tick(1);
    cy.get('@onClose').should('have.been.calledOnce');
    cy.tick(5000);
    cy.get('@onClose').should('have.been.calledOnce');
  });

  it('does not auto-close when duration is 0', () => {
    cy.clock();
    const onClose = cy.spy().as('onClose');
    cy.mount(NotificationComponent, { props: { duration: 0, onClose } });

    cy.tick(10000);
    cy.get('@onClose').should('not.have.been.called');
  });

  it('restarts the close timer on update when resetOnUpdate is true', () => {
    cy.clock();
    const onClose = cy.spy().as('onClose');
    cy.mount(
      defineComponent({
        components: { Notification: NotificationComponent },
        emits: ['close'],
        data() {
          return { type: 'info' };
        },
        template: `
          <button id="update" @click="type = 'success'">Update</button>
          <Notification :type="type" :duration="1000" reset-on-update @close="$emit('close')" />
        `,
      }),
      { props: { onClose } },
    );

    cy.tick(800);
    cy.get('#update').click();
    cy.tick(800);
    cy.get('@onClose').should('not.have.been.called');
    cy.tick(300);
    cy.get('@onClose').should('have.been.calledOnce');
  });

  it('renders separate containers per position and clear(position) only clears that position', () => {
    cy.mount({
      template: `
        <button id="add" @click="handleAdd">Add</button>
        <button id="clear-bottom" @click="handleClearBottom">Clear Bottom</button>
      `,
      methods: {
        handleAdd() {
          Notification.info({ content: '右上角通知', position: 'topRight' });
          Notification.success({ content: '左下角通知', position: 'bottomLeft' });
        },
        handleClearBottom() {
          Notification.clear('bottomLeft');
        },
      },
    });
    cy.get('#add').click();
    cy.get('.sd-overlay-notification').should('have.length', 2);
    cy.get('.sd-notification-list-top-right').should('contain.text', '右上角通知');
    cy.get('.sd-notification-list-bottom-left').should('contain.text', '左下角通知');

    cy.get('#clear-bottom').click();
    cy.get('.sd-notification-list-bottom-left .sd-notification').should('have.length', 0);
    cy.get('.sd-notification-list-top-right').should('contain.text', '右上角通知');
  });

  it('removes a specific notification by id and via the returned close handle', () => {
    cy.mount(
      defineComponent({
        data() {
          return { handle: null as { close: () => void } | null };
        },
        template: `
          <button id="add" @click="handleAdd">Add</button>
          <button id="remove-first" @click="removeFirst">Remove First</button>
          <button id="close-handle" @click="handle?.close()">Close Handle</button>
        `,
        methods: {
          handleAdd() {
            Notification.info({ id: 'first', content: '第一条通知' });
            this.handle = Notification.info({ id: 'second', content: '第二条通知' });
          },
          removeFirst() {
            Notification.remove('first');
          },
        },
      }),
    );
    cy.get('#add').click();
    cy.get('.sd-notification').should('have.length', 2);

    cy.get('#remove-first').click();
    cy.get('.sd-notification').should('have.length', 1).and('contain.text', '第二条通知');

    cy.get('#close-handle').click();
    cy.get('.sd-notification').should('have.length', 0);
  });

  it('accepts string content and invokes onClose with the id', () => {
    const onClose = cy.spy().as('onClose');
    cy.mount({
      template: '<button id="add" @click="handleAdd">Add</button>',
      methods: {
        handleAdd() {
          Notification.warning('警告内容');
          Notification.info({
            content: '可关闭通知',
            closable: true,
            onClose: (id) => onClose(id),
          });
        },
      },
    });
    cy.get('#add').click();
    cy.get('.sd-notification').should('have.length', 2);
    cy.contains('.sd-notification', '警告内容').should('be.visible');
    cy.contains('.sd-notification', '可关闭通知').should('be.visible');

    cy.get('.sd-notification-close-btn').click({ force: true });
    cy.get('@onClose').should('have.been.calledOnce');
    cy.get('@onClose').its('firstCall.args.0').should('contain', '__arco_notification_');
  });

  it('re-adds a notification with the same id after clear()', () => {
    cy.mount({
      template:
        '<button id="add" @click="handleAdd">Add</button>' +
        '<button id="clear" @click="handleClear">Clear</button>',
      methods: {
        handleAdd() {
          Notification.info({ id: 'reusable', content: '可复用 ID 通知' });
        },
        handleClear() {
          Notification.clear();
        },
      },
    });
    cy.get('#add').click();
    cy.get('.sd-notification').should('have.length', 1);
    cy.get('#clear').click();
    cy.get('.sd-notification').should('have.length', 0);
    // clear 后 notificationIds 未清理会导致同 id 重新 add 静默失败
    cy.get('#add').click();
    cy.get('.sd-notification').should('have.length', 1).and('contain.text', '可复用 ID 通知');
  });

  it('keeps a user-set resetOnUpdate when the update config has no duration', () => {
    cy.clock();
    cy.mount({
      template:
        '<button id="add" @click="handleAdd">Add</button>' +
        '<button id="update" @click="handleUpdate">Update</button>',
      methods: {
        handleAdd() {
          Notification.info({ id: 'keep', content: '第一条', duration: 5000, resetOnUpdate: true });
        },
        handleUpdate() {
          // 更新配置无 duration、无 resetOnUpdate：不应把用户设置的 true 覆盖为 false
          Notification.info({ id: 'keep', content: '更新后' });
        },
      },
    });
    cy.get('#add').click();
    cy.get('.sd-notification').should('contain.text', '第一条');
    cy.tick(2000);
    cy.get('#update').click();
    cy.get('.sd-notification').should('contain.text', '更新后');
    // t=6000ms：若 resetOnUpdate 被覆盖为 false，原 5000ms 计时器已关闭通知
    cy.tick(4000);
    cy.get('.sd-notification').should('have.length', 1);
    // t=8000ms：重启后的 5000ms 计时器到期
    cy.tick(2000);
    cy.get('.sd-notification').should('have.length', 0);
  });

  it('updates list position class when the position prop changes', () => {
    cy.mount(NotificationList, {
      props: {
        notifications: [{ id: 0, content: '位置通知', type: 'info' }],
        position: 'topRight',
      },
    });
    cy.get('.sd-notification-list').should('have.class', 'sd-notification-list-top-right');
    cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.setProps({ position: 'bottomLeft' })));
    cy.get('.sd-notification-list').should('have.class', 'sd-notification-list-bottom-left');
  });
});
