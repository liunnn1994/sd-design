import { StrictMode, useState } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import '@sdata/web-core/styles/style/index.scss';

import '../../styles/avatar.scss';
import { Avatar } from '../../src/avatar';
import { ConfigProvider } from '../../src/config-provider';
import { AvatarGroupFixture } from './avatar-group-fixture';

const loadedAvatar =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect width="10" height="10" fill="red"/></svg>',
  );

function AvatarPhoto() {
  return <img src={loadedAvatar} alt="Slotted avatar" />;
}

function App() {
  const [imageUrl, setImageUrl] = useState('/missing-avatar.png');
  const [imageEvents, setImageEvents] = useState<string[]>([]);
  const [mask, setMask] = useState(false);
  const [rtl, setRtl] = useState(false);
  const [textContent, setTextContent] = useState<'long' | 'image' | 'short'>('long');
  const record = (event: string) => setImageEvents((events) => [...events, event]);
  return (
    <>
      <AvatarGroupFixture />
      <div data-testid="avatar-row" style={{ display: 'flex', width: 24 }}>
        <Avatar data-testid="text-avatar" size={32}>
          {textContent === 'image' ? (
            <AvatarPhoto />
          ) : textContent === 'long' ? (
            'LongAvatarName'
          ) : (
            'A'
          )}
        </Avatar>
        <Avatar
          data-testid="image-avatar"
          size={32}
          imageUrl={imageUrl}
          objectFit="contain"
          error={<span>头像失败</span>}
          onLoad={() => record('load')}
          onError={() => record('error')}
        />
      </div>
      <button onClick={() => setTextContent('image')}>Show slotted avatar image</button>
      <button onClick={() => setTextContent('short')}>Shorten avatar text</button>
      <button onClick={() => setImageUrl(loadedAvatar)}>重试头像</button>
      <output data-testid="avatar-events">{imageEvents.join('|')}</output>
      <ConfigProvider rtl={rtl}>
        <Avatar
          data-testid="trigger-avatar"
          style={{ backgroundColor: 'rgb(22, 93, 255)' }}
          triggerType={mask ? 'mask' : 'button'}
          triggerIconStyle={mask ? { color: 'white' } : undefined}
          triggerIcon={<button onClick={() => setMask(!mask)}>切换编辑遮罩</button>}
        >
          NN
        </Avatar>
      </ConfigProvider>
      <button onClick={() => setRtl(!rtl)}>切换编辑方向</button>
    </>
  );
}

flushSync(() =>
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  ),
);
