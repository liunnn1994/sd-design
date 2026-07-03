import { flushPromises, mount } from '@vue/test-utils';

import FilePreviewer from '../index';

const imageSrc = 'https://picsum.photos/id/10/1000/1000?t=file-previewer-test';
const videoSrc = 'https://developer.mozilla.org/shared-assets/videos/flower.webm';
const audioSrc = 'https://developer.mozilla.org/shared-assets/audio/t-rex-roar.mp3';
const pdfSrc = 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf';

describe('FilePreviewer', () => {
  test('renders image preview in fullscreen overlay', async () => {
    const wrapper = mount(FilePreviewer, {
      props: {
        src: imageSrc,
        defaultVisible: true,
        renderToBody: false,
      },
    });

    await flushPromises();

    expect(wrapper.find('.sd-file-previewer').exists()).toBe(true);
    expect(wrapper.find('.sd-file-previewer-mask').exists()).toBe(true);
    expect(wrapper.html()).toContain(imageSrc);
    await wrapper.vm.onImageLoad();
    expect(wrapper.find('.sd-file-previewer-loading').exists()).toBe(false);
  });

  test('renders video preview with videojs html elements', async () => {
    const wrapper = mount(FilePreviewer, {
      props: {
        src: videoSrc,
        type: 'video',
        defaultVisible: true,
        renderToBody: false,
      },
    });
    await flushPromises();

    expect(wrapper.find('video-player').exists()).toBe(true);
    expect(wrapper.find('video').attributes('src')).toBe(videoSrc);
  });

  test('renders audio preview with native audio controls', () => {
    const wrapper = mount(FilePreviewer, {
      props: {
        src: audioSrc,
        type: 'audio',
        defaultVisible: true,
        renderToBody: false,
      },
    });

    expect(wrapper.find('audio').attributes('src')).toBe(audioSrc);
    expect(wrapper.find('audio').attributes()).toHaveProperty('controls');
  });

  test('renders pdf preview in iframe', () => {
    const wrapper = mount(FilePreviewer, {
      props: {
        src: pdfSrc,
        type: 'pdf',
        defaultVisible: true,
        renderToBody: false,
      },
    });

    expect(wrapper.find('iframe').attributes('src')).toBe(pdfSrc);
  });

  test('renders inline preview when fullscreen is false', () => {
    const wrapper = mount(FilePreviewer, {
      props: {
        src: imageSrc,
        fullscreen: false,
        visible: false,
      },
    });

    expect(wrapper.find('.sd-file-previewer-inline').exists()).toBe(true);
    expect(wrapper.find('.sd-file-previewer-mask').exists()).toBe(false);
    expect(wrapper.find('.sd-file-previewer-close-btn').exists()).toBe(false);
    expect(wrapper.html()).toContain(imageSrc);
  });

  test('passes preview context to content slot', async () => {
    const wrapper = mount(FilePreviewer, {
      props: {
        src: pdfSrc,
        type: 'pdf',
        defaultVisible: true,
        renderToBody: false,
      },
      slots: {
        content: `
          <template #content="slotProps">
            <button class="custom-close" @click="slotProps.close()">关闭</button>
            <button class="custom-load" @click="slotProps.onLoad()">加载</button>
            <span class="custom-src">{{ slotProps.src }}</span>
            <span class="custom-type">{{ slotProps.type }}</span>
            <span class="custom-fullscreen">{{ String(slotProps.fullscreen) }}</span>
            <span class="custom-status">{{ slotProps.status }}</span>
          </template>
        `,
      },
    });

    expect(wrapper.find('.custom-src').text()).toBe(pdfSrc);
    expect(wrapper.find('.custom-type').text()).toBe('pdf');
    expect(wrapper.find('.custom-fullscreen').text()).toBe('true');
    expect(wrapper.find('.custom-status').text()).toBe('loaded');

    await wrapper.find('.custom-close').trigger('click');
    expect(wrapper.emitted('close')).toHaveLength(1);
    expect(wrapper.emitted('visible-change')![0]).toEqual([false]);
  });

  test('closes when mask is clicked', async () => {
    const wrapper = mount(FilePreviewer, {
      props: {
        src: imageSrc,
        defaultVisible: true,
        renderToBody: false,
      },
    });

    await wrapper.find('.sd-file-previewer-mask').trigger('click');
    expect(wrapper.emitted('close')).toHaveLength(1);
    expect(wrapper.emitted('visible-change')![0]).toEqual([false]);
    expect(wrapper.find('.sd-file-previewer').exists()).toBe(false);
  });
});
