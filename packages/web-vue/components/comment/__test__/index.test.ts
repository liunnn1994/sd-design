import { mount } from '@vue/test-utils';

import Comment from '../index';

describe('Comment', () => {
  test('Should have prefix', () => {
    const wrapper = mount(Comment);
    expect(wrapper.classes()).toContain('sd-comment');
  });

  test('Content prop should work', () => {
    const wrapper = mount(Comment, {
      props: {
        content: 'hello world',
      },
    });
    const contentElement = wrapper.find('.sd-comment-content');
    expect(contentElement.text()).toContain('hello world');
  });

  test('Content slot should work', () => {
    const wrapper = mount(Comment, {
      slots: {
        content: '<div>hello world</div>',
      },
    });
    const contentElement = wrapper.find('.sd-comment-content');
    expect(contentElement.text()).toContain('hello world');
  });

  test('Author should work', () => {
    const wrapper = mount(Comment, {
      props: {
        author: 'Stephen',
      },
    });
    const authorElement = wrapper.find('.sd-comment-author');
    expect(authorElement.text()).toContain('Stephen');
  });

  test('Datetime should work', () => {
    const wrapper = mount(Comment, {
      props: {
        datetime: '1 hour',
      },
    });
    const dateTimeElement = wrapper.find('.sd-comment-datetime');
    expect(dateTimeElement.text()).toContain('1 hour');
  });

  test('Slot actions should work', () => {
    const wrapper = mount(Comment, {
      slots: {
        actions: [`<div class='custom-action'/>`, `<div class='custom-action'/>`],
      },
    });
    const actionsWrapper = wrapper.find('.sd-comment-actions');
    expect(actionsWrapper.exists()).toBe(true);
    const actions = actionsWrapper.findAll('.custom-action');
    expect(actions.length).toBe(2);
  });

  test('Align should work', () => {
    const wrapper = mount(Comment, {
      slots: {
        actions: `<div class='custom-action'/>`,
      },
      props: {
        align: 'right',
      },
    });
    const actionsWrapper = wrapper.find('.sd-comment-actions');
    expect(actionsWrapper.classes()).toContain('sd-comment-actions-align-right');
  });

  test('Align with object format should also work', () => {
    const wrapper = mount(Comment, {
      slots: {
        actions: `<div class='custom-action'/>`,
      },
      props: {
        author: 'Stephen',
        align: {
          datetime: 'right',
          actions: 'right',
        },
      },
    });
    const actionsWrapper = wrapper.find('.sd-comment-actions');
    expect(actionsWrapper.classes()).toContain('sd-comment-actions-align-right');
    const titleWrapper = wrapper.find('.sd-comment-title');
    expect(titleWrapper.classes()).toContain('sd-comment-title-align-right');
  });
});
