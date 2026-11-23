import { useRef, useState } from 'react';

import { ConfigProvider } from '../../src/config-provider/index';
import enUS from '../../src/locale/lang/en-us';
import { Popconfirm } from '../../src/popconfirm/index';

export function PopconfirmFixture() {
  const throwFirst = new URLSearchParams(location.search).has('throw-first');
  const [ok, setOk] = useState(0);
  const [cancel, setCancel] = useState(0);
  const [calls, setCalls] = useState(0);
  const [requests, setRequests] = useState(0);
  const [controlled, setControlled] = useState(false);
  const [controlledOpen, setControlledOpen] = useState(true);
  const [completion, setCompletion] = useState('immediate');
  const [mounted, setMounted] = useState(true);
  const resolve = useRef<((value: boolean) => void) | null>(null);
  const reject = useRef<(() => void) | null>(null);
  const done = useRef<((value: boolean) => void) | null>(null);
  const pending = useRef<((value: boolean) => void)[]>([]);
  return (
    <section>
      <Popconfirm
        content="确认执行操作？"
        type="warning"
        onBeforeOk={
          throwFirst
            ? () => {
                setCalls((value) => value + 1);
                if (calls === 0) throw new Error('Confirmation unavailable');
                return true;
              }
            : undefined
        }
        onPopupVisibleChange={() => setRequests((value) => value + 1)}
        onOk={() => setOk(ok + 1)}
        onCancel={() => setCancel(cancel + 1)}
      >
        <button>基本确认</button>
      </Popconfirm>
      {mounted && (
        <Popconfirm
          content={
            <span>
              异步确认内容<button onClick={() => resolve.current?.(true)}>完成异步确认</button>
              <button onClick={() => resolve.current?.(false)}>拒绝关闭</button>
              <button onClick={() => reject.current?.()}>拒绝异步确认</button>
              <button onClick={() => setMounted(false)}>卸载异步确认</button>
            </span>
          }
          onBeforeOk={() => {
            setCalls((value) => value + 1);
            return new Promise<boolean>((yes, no) => {
              resolve.current = yes;
              reject.current = () => no(new Error('rejected'));
            });
          }}
          onOk={() => setOk((value) => value + 1)}
          onCancel={() => setCancel((value) => value + 1)}
        >
          <button>异步确认</button>
        </Popconfirm>
      )}
      <button onClick={() => resolve.current?.(true)}>解决迟到结果</button>
      <Popconfirm content="保持开启内容" onBeforeOk={() => false} onBeforeCancel={() => false}>
        <button>拦截确认与取消</button>
      </Popconfirm>
      <Popconfirm
        content={
          <span>
            回调确认内容<button onClick={() => done.current?.(true)}>完成回调确认</button>
          </span>
        }
        onBeforeOk={(callback) => {
          done.current = callback;
        }}
        onOk={() => setOk((value) => value + 1)}
      >
        <button>回调式确认</button>
      </Popconfirm>
      <button onClick={() => setControlled(!controlled)}>挂载受控确认</button>
      <select
        aria-label="Controlled confirmation mode"
        value={completion}
        onChange={(event) => setCompletion(event.target.value)}
      >
        <option value="immediate">Immediate</option>
        <option value="callback">Callback</option>
        <option value="promise">Promise</option>
      </select>
      <button onClick={() => setControlledOpen(true)}>Reopen controlled confirmation</button>
      {controlled && (
        <ConfigProvider locale={enUS}>
          <Popconfirm
            content={
              <div>
                Controlled confirmation
                {completion !== 'immediate' && (
                  <>
                    <button onClick={() => setControlledOpen(false)}>
                      Hide controlled confirmation
                    </button>
                    <button onClick={() => pending.current.shift()?.(true)}>
                      Resolve oldest confirmation
                    </button>
                  </>
                )}
              </div>
            }
            popupVisible={controlledOpen}
            onBeforeOk={(callback) => {
              if (completion === 'immediate') return true;
              if (completion === 'callback') {
                pending.current.push(callback);
                return;
              }
              return new Promise<boolean>((finish) => {
                pending.current.push(finish);
              });
            }}
            onPopupVisibleChange={() => setRequests((value) => value + 1)}
            onOk={() => setOk((value) => value + 1)}
          >
            <button data-testid="controlled-confirm">受控确认</button>
          </Popconfirm>
        </ConfigProvider>
      )}
      <output data-testid="confirm-ok">{ok}</output>
      <output data-testid="confirm-cancel">{cancel}</output>
      <output data-testid="confirm-calls">{calls}</output>
      <output data-testid="confirm-requests">{requests}</output>
    </section>
  );
}
