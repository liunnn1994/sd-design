import { Button, Icon } from '@sdata/web-react';
import { useId, useState } from 'react';
import '@sdata/web-react/styles/icon-component.scss';

const IconFont = Icon.addFromIconFontCn({});
export default function IconFontDemo() {
  const id = useId();
  const [symbol, setSymbol] = useState<'small' | 'large' | 'slot'>('small');
  const [spin, setSpin] = useState(false);
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <svg width={0} height={0} aria-hidden="true">
        <defs>
          <symbol id={`${id}-small`} viewBox="0 0 20 20">
            <rect x={5} y={5} width={10} height={10} />
          </symbol>
          <symbol id={`${id}-large`} viewBox="0 0 20 20">
            <circle cx={10} cy={10} r={9} />
          </symbol>
        </defs>
      </svg>
      <IconFont
        data-testid="icon-font-demo"
        type={symbol === 'slot' ? undefined : `${id}-${symbol}`}
        size={48}
        spin={spin}
        rotate={45}
        viewBox="0 0 20 20"
        aria-label="自定义图标"
      >
        <path d="M10 1L19 19H1Z" />
      </IconFont>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <Button onClick={() => setSymbol('small')}>方形 symbol</Button>
        <Button onClick={() => setSymbol('large')}>圆形 symbol</Button>
        <Button onClick={() => setSymbol('slot')}>自定义内容</Button>
        <Button onClick={() => setSpin((value) => !value)}>{spin ? '停止旋转' : '开始旋转'}</Button>
      </div>
    </div>
  );
}
