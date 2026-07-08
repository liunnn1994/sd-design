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
    expect(wrapper.find('.sd-image').exists()).toBe(true);
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
    expect(wrapper.find('video-skin').exists()).toBe(true);
    expect(wrapper.find('video').attributes('src')).toBe(videoSrc);
    expect(wrapper.find('video').attributes()).not.toHaveProperty('controls');
  });

  test('renders audio preview with videojs html elements', async () => {
    const wrapper = mount(FilePreviewer, {
      props: {
        src: audioSrc,
        type: 'audio',
        defaultVisible: true,
        renderToBody: false,
      },
    });
    await flushPromises();

    expect(wrapper.find('audio-player').exists()).toBe(true);
    expect(wrapper.find('audio-skin').exists()).toBe(true);
    expect(wrapper.find('audio').attributes('src')).toBe(audioSrc);
    expect(wrapper.find('audio').attributes()).not.toHaveProperty('controls');
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

  test('passes image, media and pdf props to inner previewers', async () => {
    const imageWrapper = mount(FilePreviewer, {
      props: {
        src: imageSrc,
        defaultVisible: true,
        renderToBody: false,
        imageProps: {
          'alt': 'custom image alt',
          'preview': false,
          'data-image': 'image',
        },
      },
    });
    await flushPromises();

    expect(imageWrapper.find('.sd-image-img').attributes('alt')).toBe('custom image alt');
    expect(imageWrapper.find('.sd-image-img').attributes('data-image')).toBe('image');

    const mediaWrapper = mount(FilePreviewer, {
      props: {
        src: videoSrc,
        type: 'video',
        defaultVisible: true,
        renderToBody: false,
        mediaProps: {
          'preload': 'metadata',
          'loop': true,
          'data-media': 'video',
          'playerProps': {
            'data-player': 'player',
          },
          'skinProps': {
            'data-skin': 'skin',
          },
        },
      },
    });
    await flushPromises();

    expect(mediaWrapper.find('video-player').attributes('data-player')).toBe('player');
    expect(mediaWrapper.find('video-skin').attributes('data-skin')).toBe('skin');
    expect(mediaWrapper.find('video').attributes('preload')).toBe('metadata');
    expect(mediaWrapper.find('video').attributes('data-media')).toBe('video');
    expect(mediaWrapper.find('video').attributes()).toHaveProperty('loop');

    const pdfWrapper = mount(FilePreviewer, {
      props: {
        src: pdfSrc,
        type: 'pdf',
        defaultVisible: true,
        renderToBody: false,
        pdfProps: {
          'title': 'Custom PDF',
          'loading': 'lazy',
          'data-pdf': 'pdf',
        },
      },
    });

    expect(pdfWrapper.find('iframe').attributes('title')).toBe('Custom PDF');
    expect(pdfWrapper.find('iframe').attributes('loading')).toBe('lazy');
    expect(pdfWrapper.find('iframe').attributes('data-pdf')).toBe('pdf');
  });

  test('renders native media when mediaProps.skin is native', async () => {
    const wrapper = mount(FilePreviewer, {
      props: {
        src: videoSrc,
        type: 'video',
        defaultVisible: true,
        renderToBody: false,
        mediaProps: {
          skin: 'native',
        },
      },
    });
    await flushPromises();

    expect(wrapper.find('video-player').exists()).toBe(false);
    expect(wrapper.find('video').attributes('src')).toBe(videoSrc);
    expect(wrapper.find('video').attributes()).toHaveProperty('controls');
  });

  test('renders inline preview when fullscreen is false', async () => {
    const wrapper = mount(FilePreviewer, {
      props: {
        src: imageSrc,
        fullscreen: false,
        visible: false,
      },
    });

    await flushPromises();

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
