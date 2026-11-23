import { useState } from 'react';

import { Trigger } from '../../src/trigger/index';

export function TriggerScrollFixture() {
  const [mounted, setMounted] = useState(true);
  const [enabled, setEnabled] = useState(false);
  const [label, setLabel] = useState('Original');
  const [requests, setRequests] = useState<boolean[]>([]);
  return (
    <section style={{ minHeight: 1600 }}>
      <button disabled={enabled} onClick={() => setEnabled(true)}>
        Enable scroll dismissal
      </button>
      <button onClick={() => setMounted(false)}>Unmount scroll trigger</button>
      <button onClick={() => setLabel('Updated')}>Update popup label</button>
      <output data-testid="scroll-requests">{requests.join('|')}</output>
      <div data-testid="scroll-parent" style={{ height: 180, overflow: 'auto', marginTop: 100 }}>
        <div style={{ height: 720, paddingTop: 72 }}>
          {mounted && (
            <Trigger
              defaultPopupVisible
              clickOutsideToClose={false}
              duration={0}
              scrollToClose={enabled}
              scrollToCloseDistance={30}
              data-label={label}
              content="Tracked popup"
              onPopupVisibleChange={(next) => setRequests((old) => [...old, next])}
            >
              <button>Tracked reference</button>
            </Trigger>
          )}
        </div>
      </div>
    </section>
  );
}

export function TriggerFixture() {
  const [controlled, setControlled] = useState(false);
  const [requests, setRequests] = useState(0);
  const [animationEvents, setAnimationEvents] = useState('');
  const [clickOnly, setClickOnly] = useState(false);
  const [preventFocus, setPreventFocus] = useState(false);
  const [blurToClose, setBlurToClose] = useState(true);
  return (
    <section>
      <Trigger
        trigger="click"
        duration={80}
        content="动画弹层内容"
        onShow={() => setAnimationEvents((text) => text + 'S')}
        onHide={() => setAnimationEvents((text) => text + 'H')}
      >
        <button>动画弹层</button>
      </Trigger>
      <output data-testid="trigger-animation-events">{animationEvents}</output>
      <Trigger trigger="contextMenu" alignPoint content="右键弹层内容">
        <button>右键弹层</button>
      </Trigger>
      <Trigger
        trigger="click"
        content="点击弹层内容"
        escToClose
        ariaHasPopup="dialog"
        role="dialog"
      >
        <button>点击弹层</button>
      </Trigger>
      <Trigger
        trigger="click"
        popupVisible={false}
        onPopupVisibleChange={() => setRequests((n) => n + 1)}
        content="拒绝写回内容"
      >
        <button>锁定弹层</button>
      </Trigger>
      <Trigger
        trigger="click"
        popupVisible={controlled}
        onPopupVisibleChange={setControlled}
        content="受控弹层内容"
      >
        <button>受控弹层</button>
      </Trigger>
      <Trigger
        trigger={clickOnly ? 'click' : ['hover', 'focus']}
        duration={0}
        clickOutsideToClose={false}
        preventFocus={preventFocus}
        blurToClose={blurToClose}
        content={<button>悬浮弹层内容</button>}
      >
        <button>悬浮弹层</button>
      </Trigger>
      <button onClick={() => setClickOnly(!clickOnly)}>Switch combination trigger</button>
      <button
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => setPreventFocus(!preventFocus)}
      >
        Toggle popup focus protection
      </button>
      <button
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => setBlurToClose(!blurToClose)}
      >
        Toggle blur dismissal
      </button>
      <Trigger
        trigger="click"
        content={
          <Trigger trigger="click" content="嵌套弹层内容">
            <button>内层弹层</button>
          </Trigger>
        }
      >
        <button>外层弹层</button>
      </Trigger>
      <output data-testid="trigger-requests">{requests}</output>
      <div id="trigger-host" />
      <Trigger
        trigger="click"
        popupContainer="#trigger-host"
        autoFitPopupWidth
        showArrow
        arrowClass="custom-trigger-arrow"
        contentClass="custom-trigger-content"
        contentStyle={{ backgroundColor: '#112233' }}
        content="Sized content"
        openedClass="sized-open"
        unmountOnClose={false}
      >
        <button style={{ width: 180 }}>Sized reference</button>
      </Trigger>
      <Trigger
        trigger="click"
        scrollToClose
        scrollToCloseDistance={40}
        content="Scroll-sensitive content"
      >
        <button>Scroll-sensitive reference</button>
      </Trigger>
      <Trigger trigger="click" disabled content="Disabled content">
        <button>Disabled reference</button>
      </Trigger>
      <Trigger trigger="click" hideEmpty contentClass="empty-trigger-content">
        <button>Empty reference</button>
      </Trigger>
      <div style={{ height: 1600 }} />
    </section>
  );
}
