import FilePreviewer from '../index';

const imageSrc = 'https://picsum.photos/id/10/1000/1000?t=file-previewer-test';
const videoSrc = 'https://developer.mozilla.org/shared-assets/videos/flower.webm';
const audioSrc = 'https://developer.mozilla.org/shared-assets/audio/t-rex-roar.mp3';
const pdfSrc = 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf';

const callVm = (fn: (vm: any) => unknown) =>
  cy.get('@vue').then(({ wrapper }) => cy.wrap(fn(wrapper.vm)));

describe('FilePreviewer', () => {
  it('uses the Image preview without rendering the file preview overlay', () => {
    cy.mount(FilePreviewer, {
      props: { src: imageSrc, defaultVisible: true, renderToBody: false },
    });
    cy.get('.sd-image').should('exist');
    cy.get('.sd-file-previewer').should('not.exist');
    cy.get('.sd-file-previewer-mask').should('not.exist');
    callVm((vm) => vm.onImageLoad());
    cy.get('.sd-image-preview').should('exist');
  });

  it('renders a video preview', () => {
    cy.mount(FilePreviewer, {
      props: { src: videoSrc, type: 'video', defaultVisible: true, renderToBody: false },
    });
    cy.get('video-player').should('exist');
    cy.get('video-skin').should('exist');
    cy.get('video').should('have.attr', 'src', videoSrc);
    cy.get('video').should('not.have.attr', 'controls');
  });

  it('renders an audio preview', () => {
    cy.mount(FilePreviewer, {
      props: { src: audioSrc, type: 'audio', defaultVisible: true, renderToBody: false },
    });
    cy.get('audio-player').should('exist');
    cy.get('audio-skin').should('exist');
    cy.get('audio').should('have.attr', 'src', audioSrc);
    cy.get('audio').should('not.have.attr', 'controls');
  });

  it('renders a pdf preview with pdf.js instead of an iframe', () => {
    cy.mount(FilePreviewer, {
      props: { src: pdfSrc, type: 'pdf', defaultVisible: true, renderToBody: false },
    });
    cy.get('iframe').should('not.exist');
    cy.get('.sd-file-previewer-pdf-canvas').should('exist');
  });

  it('passes src and render helpers to the pdf slot', () => {
    cy.mount(FilePreviewer, {
      props: { src: pdfSrc, type: 'pdf', defaultVisible: true, renderToBody: false },
      slots: {
        pdf: `
          <template #pdf="slotProps">
            <span class="pdf-src">{{ slotProps.src }}</span>
            <span class="pdf-render-type">{{ typeof slotProps.render }}</span>
            <span class="pdf-next-type">{{ typeof slotProps.next }}</span>
            <span class="pdf-goto-type">{{ typeof slotProps.goto }}</span>
          </template>
        `,
      },
    });
    cy.get('.pdf-src').should('have.text', pdfSrc);
    cy.get('.pdf-render-type').should('have.text', 'function');
    cy.get('.pdf-next-type').should('have.text', 'function');
    cy.get('.pdf-goto-type').should('have.text', 'function');
  });

  it('loads the pdf and paginates via the toolbar', () => {
    cy.mount(FilePreviewer, {
      props: { src: pdfSrc, type: 'pdf', defaultVisible: true, renderToBody: false },
    });
    cy.get('.sd-file-previewer-pdf-page', { timeout: 30000 })
      .invoke('text')
      .should((text) => {
        expect(text.trim()).to.match(/^1 \/ \d+$/);
        expect(Number(text.trim().split('/')[1])).to.be.greaterThan(1);
      });
    cy.get('.sd-file-previewer-pdf-btn').eq(1).click();
    cy.get('.sd-file-previewer-pdf-page')
      .invoke('text')
      .should((text) => {
        expect(text.trim()).to.match(/^2 \/ \d+$/);
      });
  });

  it('exposes the loaded pdf document via the pdf slot', () => {
    cy.mount(FilePreviewer, {
      props: { src: pdfSrc, type: 'pdf', defaultVisible: true, renderToBody: false },
      slots: {
        pdf: `
          <template #pdf="slotProps">
            <span class="pdf-num-pages">{{ slotProps.numPages }}</span>
            <span class="pdf-has-doc">{{ slotProps.doc ? 'yes' : 'no' }}</span>
          </template>
        `,
      },
    });
    cy.get('.pdf-num-pages', { timeout: 30000 }).should('not.have.text', '0');
    cy.get('.pdf-has-doc').should('have.text', 'yes');
  });

  it('renders an inline preview when fullscreen is false', () => {
    cy.mount(FilePreviewer, {
      props: { src: imageSrc, fullscreen: false, visible: false },
    });
    cy.get('.sd-file-previewer-inline').should('exist');
    cy.get('.sd-file-previewer-mask').should('not.exist');
    cy.get('.sd-file-previewer-close-btn').should('not.exist');
  });

  it('passes preview context to the content slot and closes', () => {
    cy.mount(FilePreviewer, {
      props: { src: pdfSrc, type: 'pdf', defaultVisible: true, renderToBody: false },
      slots: {
        content: `
          <template #content="slotProps">
            <button class="custom-close" @click="slotProps.close()">关闭</button>
            <span class="custom-src">{{ slotProps.src }}</span>
            <span class="custom-type">{{ slotProps.type }}</span>
            <span class="custom-fullscreen">{{ String(slotProps.fullscreen) }}</span>
          </template>
        `,
      },
    });
    cy.get('.custom-src').should('have.text', pdfSrc);
    cy.get('.custom-type').should('have.text', 'pdf');
    cy.get('.custom-fullscreen').should('have.text', 'true');
    cy.get('.custom-close').click({ force: true });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('close')).to.have.length(1);
      expect(wrapper.emitted('visible-change')![0]).to.deep.equal([false]);
    });
  });

  it('closes when the mask is clicked', () => {
    cy.mount(FilePreviewer, {
      props: {
        src: videoSrc,
        type: 'video',
        defaultVisible: true,
        renderToBody: false,
        mediaProps: { skin: false },
      },
    });
    cy.get('.sd-file-previewer-mask').click({ force: true });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('close')).to.have.length(1);
      expect(wrapper.emitted('visible-change')![0]).to.deep.equal([false]);
    });
  });

  // `worker: false` 会全局切换 pdf.js 到主线程模式（一次性、不可逆），故放在最后执行，
  // 避免影响前面用例的 Worker 渲染路径。
  it('falls back to main-thread rendering when worker is false', () => {
    cy.mount(FilePreviewer, {
      props: {
        src: pdfSrc,
        type: 'pdf',
        defaultVisible: true,
        renderToBody: false,
        pdfProps: { worker: false },
      },
    });
    cy.get('.sd-file-previewer-pdf-page', { timeout: 30000 })
      .invoke('text')
      .should((text) => {
        expect(text.trim()).to.match(/^1 \/ \d+$/);
      });
  });
});
