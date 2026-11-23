import { createContext, useContext, useEffect, useRef, useState } from 'react';

import type { ModalReturn, ModalMethod } from '../../src/modal';

import { Button } from '../../src/button';
import { ConfigProvider } from '../../src/config-provider';
import { Drawer } from '../../src/drawer';
import { Modal, useModal } from '../../src/modal';
const LabelContext = createContext('missing');
function ContextText() {
  return <span>{useContext(LabelContext)}</span>;
}
function EffectModal() {
  const [api, holder] = useModal();
  useEffect(() => {
    api.info({ title: 'Effect modal', content: 'Owned effect modal' });
  }, [api]);
  return holder;
}
function HookModal({ retain }: { retain: React.RefObject<ModalMethod | undefined> }) {
  const [api, holder] = useModal();
  useEffect(() => {
    retain.current = api;
  }, [api, retain]);
  return (
    <>
      <Button onClick={() => api.confirm({ title: 'Hook modal', content: <ContextText /> })}>
        Open hook modal
      </Button>
      <LabelContext.Provider value="Holder context">
        <ConfigProvider
          modal={{ okText: 'Inherited confirm', width: 330 }}
          theme={{ tokens: { 'color-primary-6': '#d03050' } }}
          themeMode="dark"
        >
          {holder}
        </ConfigProvider>
      </LabelContext.Provider>
    </>
  );
}
export function ModalFixture() {
  const [moving, setMoving] = useState(true);
  const [visible, setVisible] = useState(false);
  const [nested, setNested] = useState(false);
  const [nestedMounted, setNestedMounted] = useState(true);
  const [showTitle, setShowTitle] = useState(true);
  const [mounted, setMounted] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [confirmation, setConfirmation] = useState<'immediate' | 'promise' | 'callback' | 'throw'>(
    'immediate',
  );
  const [escapeClose, setEscapeClose] = useState(true);
  const [maskClosable, setMaskClosable] = useState(true);
  const [veto, setVeto] = useState(false);
  const [rejected, setRejected] = useState(false);
  const [local, setLocal] = useState(false);
  const [hook, setHook] = useState(true);
  const [effect, setEffect] = useState(false);
  const [defaultOpen, setDefaultOpen] = useState(false);
  const [events, setEvents] = useState<string[]>([]);
  const pending = useRef<(value: boolean) => void>(undefined);
  const handle = useRef<ModalReturn>(undefined);
  const retained = useRef<ModalMethod>(undefined);
  const log = (value: string) => setEvents((old) => [...old, value]);
  useEffect(() => {
    const action = (event: Event) => {
      const detail = (event as CustomEvent<{ type: string; value?: boolean }>).detail;
      if (detail.type === 'moving-unmount') setMoving(false);
      if (detail.type === 'resolve') pending.current?.(detail.value ?? true);
      if (detail.type === 'unmount') setMounted(false);
      if (detail.type === 'hide') setVisible(false);
      if (detail.type === 'destroy') Modal.destroyAll();
      if (detail.type === 'update')
        handle.current?.update({ width: 420, okText: 'Updated confirm' });
      if (detail.type === 'close') handle.current?.close();
      if (detail.type === 'hook-unmount') setHook(false);
      if (detail.type === 'late-hook') retained.current?.info({ content: 'Orphan modal' });
      if (detail.type === 'effect-unmount') setEffect(false);
    };
    window.addEventListener('modal-action', action);
    return () => {
      window.removeEventListener('modal-action', action);
      Modal.destroyAll();
    };
  }, []);
  return (
    <section data-testid="modal-fixture">
      {moving && (
        <>
          <MovingDialog kind="Modal" />
          <MovingDialog kind="Drawer" />
        </>
      )}
      <Button onClick={() => setVisible(true)}>Open modal</Button>
      <Button onClick={() => setRejected(true)}>Open rejected modal</Button>
      <Button onClick={() => setLocal(true)}>Open local modal</Button>
      <Button
        onClick={() => {
          handle.current = Modal.confirm({
            title: 'Static confirm',
            content: 'Static content',
            onClose: () => log('static-close'),
            onOk: () => log('static-ok'),
          });
        }}
      >
        Open static modal
      </Button>
      <Button
        onClick={() => {
          const item = Modal.open({
            title: 'Immediate',
            content: 'Immediate close',
            onClose: () => log('immediate-close'),
          });
          item.close();
        }}
      >
        Immediate modal close
      </Button>
      <Button
        onClick={() => {
          Modal.config({ simple: false });
          for (const type of ['info', 'success', 'warning', 'error'] as const)
            Modal[type]({ title: type, content: `Static ${type}` });
          Modal.config({ simple: true });
        }}
      >
        Open modal types
      </Button>
      <Button onClick={() => setEffect(true)}>Open effect modal</Button>
      <Button onClick={() => setDefaultOpen(true)}>Open default modal</Button>
      <Button
        onClick={() =>
          Modal.info(
            { title: 'Explicit context', content: 'Context content' },
            { modal: { okText: 'Context confirm', width: 310 } },
          )
        }
      >
        Open context modal
      </Button>
      {defaultOpen && (
        <Modal
          defaultVisible
          title="Default modal"
          unmountOnClose
          onClose={() => setDefaultOpen(false)}
        >
          Default content
        </Modal>
      )}
      {hook && <HookModal retain={retained} />}
      {effect && <EffectModal />}
      {mounted && (
        <ConfigProvider
          modal={{
            width: 360,
            titleAlign: 'start',
            okText: 'Confirm modal',
            cancelText: 'Cancel modal',
          }}
        >
          <Modal
            data-testid="modal-main"
            title={showTitle ? 'Main modal' : undefined}
            visible={visible}
            onVisibleChange={(next) => {
              log(`visible:${next}`);
              setVisible(next);
            }}
            draggable
            fullscreen={fullscreen}
            unmountOnClose
            escToClose={escapeClose}
            maskClosable={maskClosable}
            onBeforeOk={(done) => {
              if (confirmation === 'throw') {
                setConfirmation('immediate');
                throw new Error('Confirmation unavailable');
              }
              if (confirmation === 'callback') {
                pending.current = done;
                return;
              }
              if (confirmation === 'promise')
                return new Promise<boolean>((resolve) => {
                  pending.current = resolve;
                });
              return !veto;
            }}
            onBeforeCancel={() => !veto}
            onBeforeOpen={() => log('before-open')}
            onOpen={() => log('open')}
            onBeforeClose={() => log('before-close')}
            onClose={() => log('close')}
            onOk={() => log('ok')}
            onCancel={() => log('cancel')}
          >
            <input aria-label="Modal input" />
            <Button onClick={() => setNested(true)}>Open nested modal</Button>
            <Button onClick={() => setFullscreen((old) => !old)}>Modal fullscreen</Button>
            <Button onClick={() => setConfirmation('promise')}>Modal async</Button>
            <Button onClick={() => setConfirmation('callback')}>Modal deferred callback</Button>
            <Button onClick={() => setConfirmation('throw')}>Fail next modal confirmation</Button>
            <Button onClick={() => setEscapeClose((enabled) => !enabled)}>
              Modal toggle Escape
            </Button>
            <Button onClick={() => setMaskClosable((enabled) => !enabled)}>
              Modal toggle mask closing
            </Button>
            <Button onClick={() => setVeto((old) => !old)}>Modal veto</Button>
            <Button onClick={() => setShowTitle(!showTitle)}>Toggle modal title</Button>
            {nestedMounted && (
              <Modal
                data-testid="modal-nested"
                title="Nested modal"
                visible={nested}
                onVisibleChange={setNested}
                unmountOnClose
                footer={false}
              >
                <input aria-label="Nested modal input" />
                <Button onClick={() => setNestedMounted(false)}>Unmount nested modal</Button>
              </Modal>
            )}
          </Modal>
        </ConfigProvider>
      )}
      <Modal
        data-testid="modal-rejected"
        title="Rejected modal"
        visible={rejected}
        onVisibleChange={(next) => log(`rejected:${next}`)}
        onCancel={() => setRejected(false)}
      >
        <input aria-label="Rejected input" />
      </Modal>
      <div id="modal-local-host" style={{ position: 'relative', height: 120, overflow: 'auto' }}>
        <div style={{ height: 240 }}>Local host</div>
        <Modal
          data-testid="modal-local"
          title="Local modal"
          visible={local}
          onVisibleChange={setLocal}
          popupContainer="#modal-local-host"
          mask={false}
          alignCenter={false}
          top={40}
          width={280}
          footer={<span>Custom footer</span>}
          bodyClass="custom-modal-body"
          bodyStyle={{ padding: 12 }}
          hideTitle
          renderToBody={false}
        >
          Local content
        </Modal>
      </div>
      <output data-testid="modal-events">{events.join('|')}</output>
    </section>
  );
}

function MovingDialog({ kind }: { kind: 'Modal' | 'Drawer' }) {
  const [visible, setVisible] = useState(false);
  const [target, setTarget] = useState('a');
  const [opens, setOpens] = useState(0);
  const Dialog = kind === 'Modal' ? Modal : Drawer;
  useEffect(() => {
    const move = () => setTarget((value) => (value === 'a' ? 'b' : 'a'));
    window.addEventListener(`move-${kind}`, move);
    return () => window.removeEventListener(`move-${kind}`, move);
  }, [kind]);
  return (
    <>
      <Button onClick={() => setVisible(true)}>Open moving {kind}</Button>
      {['a', 'b'].map((id) => (
        <div key={id} id={`moving-${kind}-${id}`} style={{ height: 100, overflow: 'auto' }}>
          <div style={{ height: 500 }}>Host {id}</div>
        </div>
      ))}
      <Dialog
        title={`Moving ${kind}`}
        visible={visible}
        onVisibleChange={setVisible}
        popupContainer={`#moving-${kind}-${target}`}
        onOpen={() => setOpens((value) => value + 1)}
        unmountOnClose
      >
        <input aria-label={`Moving ${kind} draft`} defaultValue="initial" />
      </Dialog>
      <output data-testid={`moving-${kind}-opens`}>{opens}</output>
    </>
  );
}
