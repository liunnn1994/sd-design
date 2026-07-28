import { h } from 'vue';

import ConfigProvider from '../../config-provider';
import enUS from '../../locale/lang/en-us';
import Sender, {
  SenderHeader,
  type SenderInstance,
  type SenderSlotConfig,
  SenderSwitch,
} from '../index';

interface AudioWorkletNodeMock {
  port: {
    onmessage: ((event: MessageEvent<ArrayBuffer | { type: 'flushed' }>) => void) | null;
    postMessage: (message: unknown) => void;
  };
}

const installSpeechMocks = (permissionDenied = false) => {
  const state: { workletNode?: AudioWorkletNodeMock; socket?: WebSocket } = {};

  cy.window().then((win) => {
    const stopTrack = cy.spy().as('microphoneTrackStop');
    const mediaStream = {
      getTracks: () => [{ stop: stopTrack }],
    } as unknown as MediaStream;
    const getUserMedia = cy.stub().as('getUserMedia');
    if (permissionDenied) {
      getUserMedia.rejects(new win.DOMException('Permission denied', 'NotAllowedError'));
    } else {
      getUserMedia.resolves(mediaStream);
    }
    cy.stub(win.navigator.mediaDevices, 'getUserMedia').callsFake(getUserMedia);

    const addModule = cy.stub().resolves().as('audioWorkletAddModule');
    const sourceConnect = cy.spy().as('mediaStreamSourceConnect');
    const sourceDisconnect = cy.spy().as('mediaStreamSourceDisconnect');
    const close = cy.stub().resolves().as('audioContextClose');
    class MockAudioContext {
      sampleRate = 48_000;
      state: AudioContextState = 'running';
      audioWorklet = { addModule };

      createMediaStreamSource() {
        return {
          connect: sourceConnect,
          disconnect: sourceDisconnect,
        };
      }

      close() {
        this.state = 'closed';
        return close();
      }
    }

    class MockAudioWorkletNode {
      port = {
        onmessage: null as
          | ((event: MessageEvent<ArrayBuffer | { type: 'flushed' }>) => void)
          | null,
        postMessage: (message: unknown) => {
          if ((message as { type?: string }).type !== 'flush') return;
          queueMicrotask(() =>
            this.port.onmessage?.({
              data: { type: 'flushed' },
            } as MessageEvent<{ type: 'flushed' }>),
          );
        },
      };

      constructor() {
        state.workletNode = this;
      }

      disconnect() {}
    }

    const webSocketSend = cy.spy().as('speechWebSocketSend');
    class MockWebSocket extends win.EventTarget {
      static CONNECTING = 0;
      static OPEN = 1;
      static CLOSING = 2;
      static CLOSED = 3;
      readyState = MockWebSocket.CONNECTING;
      binaryType: BinaryType = 'blob';
      onopen: ((event: Event) => void) | null = null;
      onmessage: ((event: MessageEvent) => void) | null = null;
      onclose: ((event: CloseEvent) => void) | null = null;
      onerror: ((event: Event) => void) | null = null;

      constructor(
        readonly url: string,
        readonly protocols?: string | string[],
      ) {
        super();
        state.socket = this as unknown as WebSocket;
        queueMicrotask(() => {
          this.readyState = MockWebSocket.OPEN;
          this.onopen?.(new win.Event('open'));
        });
      }

      send(data: string | ArrayBufferLike | Blob | ArrayBufferView) {
        webSocketSend(data);
      }

      close() {
        this.readyState = MockWebSocket.CLOSED;
      }
    }

    cy.stub(win.URL, 'createObjectURL').returns('blob:sender-audio-worklet');
    Object.defineProperty(win, 'AudioContext', {
      configurable: true,
      value: MockAudioContext,
    });
    Object.defineProperty(win, 'AudioWorkletNode', {
      configurable: true,
      value: MockAudioWorkletNode,
    });
    Object.defineProperty(win, 'WebSocket', {
      configurable: true,
      value: MockWebSocket,
    });
  });

  return state;
};

describe('Sender', () => {
  it('renders the antd-x sender structure and updates v-model', () => {
    cy.mount(Sender, {
      props: {
        defaultValue: '你好',
        placeholder: '请输入消息',
      },
    });

    cy.get('.sd-sender-main').should('exist');
    cy.get('textarea').should('have.value', '你好').type('，世界');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).to.equal('你好，世界');
      expect(wrapper.emitted('change')?.at(-1)?.[0]).to.equal('你好，世界');
    });
  });

  it('submits on Enter and keeps Shift+Enter as a newline by default', () => {
    cy.mount(Sender, {
      props: {
        defaultValue: '发送内容',
      },
    });

    cy.get('textarea').type('{shift+enter}');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('submit')).to.equal(undefined);
    });
    cy.get('textarea').type('{enter}');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('submit')?.[0]?.[0]).to.include('发送内容');
    });
  });

  it('supports shiftEnter submit mode', () => {
    cy.mount(Sender, {
      props: {
        defaultValue: '发送内容',
        submitType: 'shiftEnter',
      },
    });

    cy.get('textarea').type('{enter}');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('submit')).to.equal(undefined);
    });
    cy.get('textarea').type('{shift+enter}');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('submit')).to.have.length(1);
    });
  });

  it('emits one change in controlled mode', () => {
    cy.mount(Sender, {
      props: {
        modelValue: '',
      },
    });

    cy.get('textarea').type('A');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')).to.have.length(1);
    });
  });

  it('shows the readonly tooltip on hover, click and modification attempts in text mode', () => {
    cy.mount(Sender, {
      props: {
        defaultValue: '已锁定内容',
        readonly: '内容已锁定',
      },
    });

    cy.get('.sd-sender').trigger('mouseenter');
    cy.get('.sd-tooltip-content').should('be.visible').and('contain', '内容已锁定');
    cy.get('.sd-sender').trigger('mouseleave');
    cy.get('.sd-tooltip-content').should('not.be.visible');

    cy.get('.sd-sender-content').click();
    cy.get('.sd-tooltip-content').should('be.visible').and('contain', '内容已锁定');

    cy.get('textarea').trigger('keydown', { key: 'a' });
    cy.get('.sd-tooltip-content:visible').should('have.length', 1).and('contain', '内容已锁定');
  });

  it('shows the readonly tooltip on hover, click and modification attempts in slot mode', () => {
    cy.mount(Sender, {
      props: {
        readonly: true,
        slotConfig: [{ type: 'text', value: '只读词槽' }],
      },
    });

    cy.get('.sd-sender').trigger('mouseenter');
    cy.get('.sd-tooltip-content').should('be.visible').and('contain', '只读');
    cy.get('.sd-sender').trigger('mouseleave');
    cy.get('.sd-tooltip-content').should('not.be.visible');

    cy.get('.sd-sender-input-slot').click();
    cy.get('.sd-tooltip-content').should('be.visible').and('contain', '只读');

    cy.get('.sd-sender-input-slot').trigger('keydown', { key: 'a' });
    cy.get('.sd-tooltip-content:visible').should('have.length', 1).and('contain', '只读');
  });

  it('does not show the readonly tooltip when the sender is disabled', () => {
    cy.mount(Sender, {
      props: {
        disabled: true,
        readonly: true,
        slotConfig: [{ type: 'text', value: '禁用词槽' }],
      },
    });

    cy.get('.sd-sender').trigger('mouseenter').click();
    cy.get('.sd-sender-input-slot').trigger('keydown', { key: 'a' });
    cy.get('.sd-tooltip-content').should('not.exist');
  });

  it('switches to the cancellable loading action', () => {
    cy.mount(Sender, {
      props: {
        defaultValue: '生成中',
        loading: true,
      },
    });

    cy.get('button[aria-label="停止生成"]').click();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('cancel')).to.have.length(1);
      expect(wrapper.emitted('submit')).to.equal(undefined);
    });
  });

  it('supports controlled speech state', () => {
    const onRecordingChange = cy.spy().as('onRecordingChange');
    cy.mount(Sender, {
      props: {
        allowSpeech: {
          recording: false,
          onRecordingChange,
        },
      },
    });

    cy.get('.sd-sender-actions-btn')
      .first()
      .should('have.attr', 'aria-label', '开始语音输入')
      .click();
    cy.get('@onRecordingChange').should('have.been.calledOnceWith', true);
  });

  it('emits streaming AudioWorklet buffers without using browser speech recognition', () => {
    const speech = installSpeechMocks();
    cy.mount(Sender, {
      props: {
        allowSpeech: true,
      },
    });

    cy.get('.sd-sender-actions-btn')
      .first()
      .should('have.attr', 'aria-label', '开始语音输入')
      .click();
    cy.get('@getUserMedia').should('have.been.calledOnceWith', {
      audio: true,
      video: false,
    });
    cy.get('@audioWorkletAddModule').should(
      'have.been.calledOnceWith',
      'blob:sender-audio-worklet',
    );
    cy.get('@mediaStreamSourceConnect').should('have.been.calledOnce');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('speechStart')).to.have.length(1);
      expect(wrapper.emitted('change')).to.equal(undefined);
    });

    cy.then(() => {
      const buffer = new Float32Array([0.1, -0.2]).buffer;
      speech.workletNode?.port.onmessage?.({ data: buffer } as MessageEvent<ArrayBuffer>);
    });
    cy.get('@vue').should(({ wrapper }) => {
      const data = wrapper.emitted('speechData')?.[0]?.[0];
      expect(data).to.include({ sampleRate: 48_000, sequence: 0 });
      expect(data.buffer).to.be.instanceOf(ArrayBuffer);
    });
    cy.get('.sd-sender-actions-btn').first().click();
    cy.get('@microphoneTrackStop').should('have.been.calledOnce');
    cy.get('@audioContextClose').should('have.been.calledOnce');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('speechEnd')?.[0]?.[0]).to.include({
        source: 'capture',
        reason: 'manual',
        chunks: 1,
      });
    });
  });

  it('streams AudioWorklet buffers to a configured WebSocket URL', () => {
    const speech = installSpeechMocks();
    cy.mount(Sender, {
      props: {
        allowSpeech: {
          url: 'wss://speech.example.test/stream',
          protocols: 'pcm',
        },
      },
    });

    cy.get('.sd-sender-actions-btn').first().click();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('speechTransportOpen')).to.have.length(1);
      expect(wrapper.emitted('speechStart')).to.have.length(1);
    });
    cy.then(() => {
      speech.workletNode?.port.onmessage?.({
        data: new Float32Array([0.25]).buffer,
      } as MessageEvent<ArrayBuffer>);
    });
    cy.get('@speechWebSocketSend').should('have.callCount', 2);
    cy.get('@speechWebSocketSend').should(
      'have.been.calledWithMatch',
      Cypress.sinon.match.instanceOf(ArrayBuffer),
    );
  });

  it('shows a clear status when microphone permission is denied', () => {
    installSpeechMocks(true);
    cy.mount(Sender, {
      props: {
        allowSpeech: true,
      },
    });

    cy.get('.sd-sender-actions-btn')
      .first()
      .should('have.attr', 'aria-label', '开始语音输入')
      .click();
    cy.get('@getUserMedia').should('have.been.calledOnce');
    cy.get('@audioWorkletAddModule').should('not.have.been.called');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('speechError')?.[0]?.[0]).to.include({ phase: 'permission' });
    });
    cy.get('button[aria-label="麦克风权限已被拒绝，请在浏览器设置中允许"]').should('be.disabled');
  });

  it('renders header, prefix, suffix and footer slots', () => {
    cy.mount(Sender, {
      slots: {
        header: '<div class="custom-header">引用内容</div>',
        prefix: '<span class="custom-prefix">+</span>',
        suffix: '<button class="custom-suffix">发送</button>',
        footer: '<div class="custom-footer">快捷提示</div>',
      },
    });

    cy.get('.custom-header').should('contain.text', '引用内容');
    cy.get('.custom-prefix').should('exist');
    cy.get('.sd-sender-content > .sd-sender-actions-list .custom-suffix').should('exist');
    cy.get('.sd-sender-footer > .sd-sender-footer-content .custom-footer').should(
      'contain.text',
      '快捷提示',
    );
    cy.get('button[aria-label="发送"]').should('not.exist');
  });

  it('renders the suffix on the right side of the footer', () => {
    cy.mount(Sender, {
      props: {
        defaultValue: '待发送内容',
        suffixPlacement: 'footer',
      },
      slots: {
        suffix: '<button class="custom-suffix">发送</button>',
        footer: '<div class="custom-footer">左侧提示</div>',
      },
    });

    cy.get('.sd-sender-content > .sd-sender-actions-list').should('not.exist');
    cy.get('.sd-sender-footer').within(() => {
      cy.get('> .sd-sender-footer-content .custom-footer').should('contain.text', '左侧提示');
      cy.get('> .sd-sender-footer-suffix > .sd-sender-actions-list .custom-suffix').should(
        'contain.text',
        '发送',
      );
    });

    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ suffixPlacement: 'content' }));
    cy.get('.sd-sender-content > .sd-sender-actions-list .custom-suffix').should('exist');
    cy.get('.sd-sender-footer > .sd-sender-footer-content .custom-footer').should('exist');
    cy.get('.sd-sender-footer-suffix').should('not.exist');
  });

  it('renders a footer suffix without requiring the footer slot', () => {
    cy.mount(Sender, {
      props: {
        suffixPlacement: 'footer',
      },
    });

    cy.get('.sd-sender-footer > .sd-sender-footer-suffix > .sd-sender-actions-list')
      .should('exist')
      .find('button[aria-label="发送"]')
      .should('exist');
    cy.get('.sd-sender-footer-content').should('not.exist');
  });

  it('emits pasted files without inserting them into the textarea', () => {
    cy.mount(Sender);

    cy.get('textarea').then(($textarea) => {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(new File(['image'], 'image.png', { type: 'image/png' }));
      $textarea[0].dispatchEvent(
        new ClipboardEvent('paste', {
          bubbles: true,
          cancelable: true,
          clipboardData: dataTransfer,
        }),
      );
    });
    cy.get('@vue').should(({ wrapper }) => {
      const files = wrapper.emitted('pasteFile')?.[0]?.[0] as FileList;
      expect(files).to.have.length(1);
      expect(files[0].name).to.equal('image.png');
    });
  });

  it('exposes focus, insert, clear and getValue in text mode', () => {
    cy.mount(Sender, {
      props: {
        defaultValue: 'Hello',
      },
    });

    cy.get('@vue').then(({ wrapper }) => {
      const sender = wrapper.vm as unknown as SenderInstance;
      sender.insert(' world', 'end');
      expect(sender.getValue().value).to.equal('Hello world');
      sender.focus({ cursor: 'all' });
    });
    cy.get('textarea').should('be.focused');
    cy.get('@vue').then(({ wrapper }) => {
      const sender = wrapper.vm as unknown as SenderInstance;
      sender.clear();
      expect(sender.getValue().value).to.equal('');
    });
  });

  it('renders every structured slot type and returns formatted values', () => {
    const slotConfig: SenderSlotConfig[] = [
      { type: 'text', value: '在 ' },
      {
        type: 'select',
        key: 'city',
        props: { options: ['杭州', '上海'], defaultValue: '杭州' },
      },
      { type: 'text', value: ' 查询 ' },
      {
        type: 'input',
        key: 'keyword',
        props: { defaultValue: '天气', placeholder: '关键词' },
      },
      {
        type: 'content',
        key: 'date',
        props: { defaultValue: '今天' },
        formatResult: (value) => `[${String(value)}]`,
      },
      {
        type: 'tag',
        key: 'tag',
        props: { label: '详细', value: '详细信息' },
      },
    ];
    cy.mount(Sender, {
      props: {
        slotConfig,
        skill: { title: '天气助手', value: 'weather', closable: true },
      },
    });

    cy.get('.sd-sender-skill-tag').should('contain.text', '天气助手');
    cy.get('.sd-rich-text-editor-component-select').should('exist');
    cy.get('[data-rich-text-component-key="keyword"] input').should('have.value', '天气');
    cy.get('[data-rich-text-component-key="date"] input').should('have.value', '今天');
    cy.get('.sd-rich-text-editor-component-tag').should('contain.text', '详细');

    cy.get('@vue').then(({ wrapper }) => {
      const value = (wrapper.vm as unknown as SenderInstance).getValue();
      expect(value.value).to.equal('在 杭州 查询 天气[今天]详细信息');
      expect(value.slotConfig).to.have.length(6);
      expect(value.skill?.value).to.equal('weather');
    });
  });

  it('submits a structured input once per Enter keypress', () => {
    cy.mount(Sender, {
      props: {
        slotConfig: [
          {
            type: 'input',
            key: 'keyword',
            props: { defaultValue: '天气' },
          },
        ],
      },
    });

    cy.get('.sd-rich-text-editor-component-input input').type('{enter}');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('submit')).to.have.length(1);
    });
  });

  it('inserts runtime slots and removes a closable skill', () => {
    cy.mount(Sender, {
      props: {
        slotConfig: [{ type: 'text', value: '请' }],
        skill: { value: 'agent', closable: true },
      },
    });

    cy.get('@vue').then(({ wrapper }) => {
      (wrapper.vm as unknown as SenderInstance).insert(
        [{ type: 'tag', key: 'tone', props: { label: '简洁', value: '简洁地' } }],
        'end',
      );
    });
    cy.get('.sd-rich-text-editor-component-tag').should('contain.text', '简洁');
    cy.get('@vue').then(({ wrapper }) => {
      expect((wrapper.vm as unknown as SenderInstance).getValue().value).to.equal('请简洁地');
    });
    cy.get('[role="button"][aria-label="移除技能"]').click();
    cy.get('.sd-sender-skill').should('not.exist');
  });

  for (const [keyName, key] of [
    ['Enter', '{enter}'],
    ['Space', ' '],
  ] as const) {
    it(`removes a closable skill with ${keyName} without submitting`, () => {
      cy.mount(Sender, {
        props: {
          slotConfig: [{ type: 'text', value: '消息' }],
          skill: {
            value: 'agent',
            tooltip: '技能说明',
            closable: true,
          },
        },
      });

      cy.get('[role="button"][aria-label="移除技能"]').focus().type(key);
      cy.get('.sd-sender-skill-tag').should('not.exist');
      cy.get('@vue').should(({ wrapper }) => {
        expect(wrapper.emitted('submit')).to.equal(undefined);
      });
    });
  }

  it('supports custom structured slots through Vue scoped slots', () => {
    cy.mount(Sender, {
      props: {
        slotConfig: [
          {
            type: 'custom',
            key: 'custom',
            props: { defaultValue: '自定义值' },
          },
        ],
      },
      slots: {
        'slot-custom': ({ value }: { value: string }) =>
          h('strong', { class: 'custom-slot' }, value),
      },
    });

    cy.get('.custom-slot').should('contain.text', '自定义值');
  });

  it('preserves caret order when typing in an editable text node', () => {
    cy.mount(Sender, {
      props: {
        submitType: 'shiftEnter',
        slotConfig: [{ type: 'text', value: '你好' }],
      },
    });

    cy.get('.sd-rich-text-editor-content').as('editor').click('right');
    cy.get('@editor').type('世界');
    cy.get('@vue').then(({ wrapper }) => {
      expect((wrapper.vm as unknown as SenderInstance).getValue().value).to.equal('你好世界');
    });
  });

  it('enables the send button and submits on Enter after typing in an empty slot editor', () => {
    cy.mount(Sender, {
      props: {
        slotConfig: [],
      },
    });

    cy.get('button[aria-label="发送"]').should('be.disabled');
    cy.get('.sd-rich-text-editor-content').as('editor').click('right');
    cy.get('@editor').type('你好');
    cy.get('button[aria-label="发送"]').should('not.be.disabled');
    cy.get('@editor').type('{enter}');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('submit')).to.have.length(1);
    });
  });

  it('renders localized aria-labels under a ConfigProvider locale', () => {
    cy.mount(ConfigProvider, {
      props: { locale: enUS },
      slots: {
        default: () => h(Sender, { slotConfig: [] }),
      },
    });

    cy.get('button[aria-label="Send"]').should('exist');
    cy.get('.sd-rich-text-editor-content').should('have.attr', 'aria-label', 'Message input');
  });

  it('inserts a Lexical line break on Enter in shiftEnter mode', () => {
    cy.mount(Sender, {
      props: {
        submitType: 'shiftEnter',
        slotConfig: [{ type: 'text', value: '你好' }],
      },
    });

    cy.get('.sd-rich-text-editor-content').as('editor').click('right');
    cy.get('@editor').type('{enter}');
    cy.get('@vue').then(({ wrapper }) => {
      expect((wrapper.vm as unknown as SenderInstance).getValue().value).to.equal('你好\n');
    });
    cy.get('.sd-rich-text-editor-paragraph').should('have.length', 1);
  });

  it('inserts a newline on Shift+Enter in the default submit mode', () => {
    cy.mount(Sender, {
      props: {
        slotConfig: [{ type: 'text', value: '你好' }],
      },
    });

    cy.get('.sd-rich-text-editor-content').as('editor').click('right');
    cy.get('@editor').type('{shift+enter}');
    cy.get('@vue').then(({ wrapper }) => {
      expect((wrapper.vm as unknown as SenderInstance).getValue().value).to.equal('你好\n');
      expect(wrapper.emitted('submit')).to.equal(undefined);
    });
  });

  it('replaces the selected rich-text content without submitting', () => {
    cy.mount(Sender, {
      props: {
        submitType: 'shiftEnter',
        slotConfig: [{ type: 'text', value: '你好世界' }],
      },
    });

    cy.get('@vue').then(({ wrapper }) => {
      (wrapper.vm as unknown as SenderInstance).focus({ cursor: 'all' });
    });
    cy.get('.sd-rich-text-editor-content').as('editor').should('be.focused');
    cy.get('@editor').type('{enter}');
    cy.get('@vue').then(({ wrapper }) => {
      expect((wrapper.vm as unknown as SenderInstance).getValue().value).to.equal('');
      expect(wrapper.emitted('submit')).to.equal(undefined);
    });
  });

  it('delegates structured editing to RichTextEditor', () => {
    cy.mount(Sender, {
      props: {
        slotConfig: [{ type: 'text', value: '原值' }],
      },
    });

    cy.get('.sd-sender-input-slot')
      .should('have.class', 'sd-rich-text-editor')
      .find('.sd-rich-text-editor-content')
      .should('have.attr', 'contenteditable', 'true')
      .and('contain.text', '原值');
    cy.get('.sd-sender-text-node').should('not.exist');
  });

  it('recalculates autoSize constraints when the input line height changes', () => {
    cy.mount(Sender, {
      props: {
        autoSize: { minRows: 2, maxRows: 4 },
        slotConfig: [{ type: 'text', value: '内容' }],
        styles: {
          input: {
            fontSize: '14px',
            lineHeight: '20px',
          },
        },
      },
    });

    cy.get('.sd-rich-text-editor-content')
      .should('have.css', 'min-height', '40px')
      .and('have.css', 'max-height', '80px');
    cy.get('@vue').then(({ wrapper }) =>
      wrapper.setProps({
        styles: {
          input: {
            fontSize: '14px',
            lineHeight: '30px',
          },
        },
      }),
    );
    cy.get('.sd-rich-text-editor-content')
      .should('have.css', 'min-height', '60px')
      .and('have.css', 'max-height', '120px');
  });
});

describe('SenderHeader', () => {
  it('renders title/content and emits close state', () => {
    cy.mount(SenderHeader, {
      props: {
        open: true,
        title: '上传内容',
      },
      slots: {
        default: '<div class="header-content">文件列表</div>',
      },
    });

    cy.get('.sd-sender-header-title').should('contain.text', '上传内容');
    cy.get('.header-content').should('contain.text', '文件列表');
    cy.get('button[aria-label="关闭头部面板"]').click();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('update:open')?.[0]).to.deep.equal([false]);
      expect(wrapper.emitted('openChange')?.[0]).to.deep.equal([false]);
    });
  });
});

describe('SenderSwitch', () => {
  it('supports controlled and uncontrolled modes', () => {
    cy.mount(SenderSwitch, {
      props: {
        defaultValue: false,
      },
      slots: {
        checked: '深度思考',
        unchecked: '快速回答',
      },
    });

    cy.contains('button', '快速回答').click();
    cy.get('.sd-sender-switch').should('have.class', 'sd-sender-switch-checked');
    cy.contains('button', '深度思考').should('exist');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')?.[0]).to.deep.equal([true]);
    });
  });

  it('does not change while disabled', () => {
    cy.mount(SenderSwitch, {
      props: {
        disabled: true,
      },
      slots: {
        default: '联网搜索',
      },
    });

    cy.contains('button', '联网搜索').should('be.disabled').click({ force: true });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')).to.equal(undefined);
    });
  });
});
