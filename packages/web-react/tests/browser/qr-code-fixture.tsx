import enUS from '@sdata/web-core/locale/lang/en-us';
import { QRCode } from '@sdata/web-core/qr-code/engine';
import { useEffect, useRef, useState } from 'react';

import { ConfigProvider } from '../../src/config-provider/index.js';
import {
  QrCode,
  type QrCodeType,
  type QrCodeStatusType,
  type QrCodeValue,
} from '../../src/qr-code/index.js';
export function QrCodeFixture() {
  const [value, setValue] = useState<QrCodeValue>('first-value');
  const [type, setType] = useState<QrCodeType>('canvas');
  const [status, setStatus] = useState<QrCodeStatusType>('active');
  const [dark, setDark] = useState(false);
  const [colors, setColors] = useState(false);
  const [custom, setCustom] = useState(false);
  const [icon, setIcon] = useState(0);
  const [localSpin, setLocalSpin] = useState(false);
  const [english, setEnglish] = useState(false);
  const [mounted, setMounted] = useState(true);
  const [empty, setEmpty] = useState(true);
  const [pending, setPending] = useState<string[]>([]);
  const [events, setEvents] = useState<string[]>([]);
  const root = useRef<HTMLDivElement>(null);
  const requests = useRef(new Map<string, (markup: string) => void>());
  const original = useRef(QRCode.toString);
  useEffect(
    () => () => {
      QRCode.toString = original.current;
    },
    [],
  );
  const hold = () => {
    QRCode.toString = ((text: string) =>
      new Promise<string>((resolve) => {
        requests.current.set(text, resolve);
        setPending([...requests.current.keys()]);
      })) as typeof QRCode.toString;
    setType('svg');
    setValue('old');
  };
  const finish = (text: string) => {
    const resolve = requests.current.get(text);
    requests.current.delete(text);
    setPending([...requests.current.keys()]);
    resolve?.(`<svg data-value="${text}"></svg>`);
  };
  return (
    <section data-testid="qr-fixture">
      <button onClick={() => setType((old) => (old === 'canvas' ? 'svg' : 'canvas'))}>
        QR type
      </button>
      <button onClick={() => setValue(['second-value', '多行'])}>QR value</button>
      <button
        onClick={() =>
          setStatus((old) =>
            old === 'active'
              ? 'expired'
              : old === 'expired'
                ? 'loading'
                : old === 'loading'
                  ? 'scanned'
                  : 'active',
          )
        }
      >
        QR status
      </button>
      <button onClick={() => setDark((old) => !old)}>QR theme</button>
      <button onClick={() => setColors((old) => !old)}>QR options</button>
      <button onClick={() => setIcon((old) => (old + 1) % 3)}>QR icon</button>
      <button onClick={() => setCustom((old) => !old)}>QR custom status</button>
      <button onClick={() => setLocalSpin((old) => !old)}>QR local spin</button>
      <button onClick={() => setEnglish((old) => !old)}>QR locale</button>
      <button onClick={() => setEmpty((old) => !old)}>QR empty</button>
      <button onClick={() => setMounted((old) => !old)}>QR mount</button>
      <button
        onClick={() =>
          setEvents((old) => [...old, `ref:${root.current?.dataset.testid ?? 'null'}`])
        }
      >
        QR ref
      </button>
      <button onClick={hold}>QR defer</button>
      <button onClick={() => setValue('new')}>QR newer</button>
      <button onClick={() => finish('new')}>QR resolve new</button>
      <button onClick={() => finish('old')}>QR resolve old</button>
      <ConfigProvider
        locale={english ? enUS : undefined}
        qrCodeSpinProps={{ size: 10, dot: true, tip: 'Inherited QR loading' }}
      >
        <div data-testid="qr-theme" sd-theme={dark ? 'dark' : 'light'}>
          {mounted && (
            <QrCode
              data-testid="qr-main"
              ref={root}
              value={value}
              type={type}
              status={status}
              size={colors ? 200 : 160}
              color={colors ? '#112233' : ''}
              bgColor={colors ? '#aabbcc' : 'transparent'}
              marginSize={colors ? 8 : 0}
              errorLevel={colors ? 'H' : 'M'}
              boostLevel={!colors}
              bordered={!colors}
              icon={
                icon === 1 ? 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg"/%3E' : ''
              }
              iconAlt="QR icon"
              iconSize={{ width: 24, height: 36 }}
              iconContent={icon === 2 ? <strong>Custom icon</strong> : undefined}
              spinProps={localSpin ? { tip: 'Local QR loading', size: 8 } : undefined}
              statusRender={
                custom
                  ? (info) => <button onClick={info.onRefresh}>Render {info.status}</button>
                  : undefined
              }
              onRefresh={() => setEvents((old) => [...old, 'refresh'])}
            />
          )}
        </div>
      </ConfigProvider>
      <div sd-theme="dark">
        <QrCode data-testid="qr-empty" value={empty ? '' : 'after-empty'} type="svg" />
      </div>
      <QrCode
        data-testid="qr-status-slot"
        value="slot"
        type="svg"
        status="expired"
        statusRender={() => null}
        renderStatus={(info) => <button onClick={info.onRefresh}>Slot {info.status}</button>}
        onRefresh={() => setEvents((old) => [...old, 'slot-refresh'])}
      />
      <output data-testid="qr-pending">{pending.join('|')}</output>
      <output data-testid="qr-events">{events.join('|')}</output>
    </section>
  );
}
