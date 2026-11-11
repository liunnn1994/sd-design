import { useState } from 'react';

import { Trigger } from '../../src/trigger/index';

export function TriggerFixture() {
  const [controlled, setControlled] = useState(false);
  const [requests, setRequests] = useState(0);
  const [animationEvents, setAnimationEvents] = useState('');
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
      <Trigger trigger={['hover', 'focus']} duration={0} content="悬浮弹层内容">
        <button>悬浮弹层</button>
      </Trigger>
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
    </section>
  );
}
