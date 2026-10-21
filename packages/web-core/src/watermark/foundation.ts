import type { Properties } from 'csstype';

import type { WatermarkFont } from './types.js';

import { styleToString, canvasToGray } from './utils.js';

type WatermarkStyle = Properties<string | number> & {
  [name: `--${string}`]: string | number | undefined;
};
export interface WatermarkOptions {
  content?: string | string[];
  image?: string;
  width?: number;
  height?: number;
  gap?: [number, number];
  offset?: [number, number];
  rotate: number;
  font?: WatermarkFont;
  zIndex: number;
  alpha: number;
  antiTamper: boolean;
  grayscale: boolean;
  repeat: boolean;
  staggered: boolean;
}

export function createWatermark(adapter: {
  readonly props: WatermarkOptions;
  readonly container: HTMLDivElement | undefined;
  readonly theme: 'light' | 'dark';
  readonly ratio: number;
}) {
  const ratio = adapter.ratio;
  const watermarkMap = new Map<HTMLDivElement, HTMLDivElement>();
  // Text content and style related
  const fontSize = () => adapter.props.font?.fontSize ?? 16;
  const fontWeight = () => adapter.props.font?.fontWeight ?? 'normal';
  const fontStyle = () => adapter.props.font?.fontStyle ?? 'normal';
  const fontFamily = () => adapter.props.font?.fontFamily ?? 'sans-serif';
  const textAlign = () => adapter.props.font?.textAlign ?? 'center';
  const contents = () =>
    Array.isArray(adapter.props.content) ? adapter.props.content : [adapter.props.content];
  const color = () =>
    adapter.props.font?.color ??
    (adapter.theme === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)');

  // Watermark position related
  const gapX = () => adapter.props.gap?.[0] ?? 90;
  const gapY = () => adapter.props.gap?.[1] ?? 90;
  const gapXCenter = () => gapX() / 2;
  const gapYCenter = () => gapY() / 2;
  const offsetLeft = () => adapter.props.offset?.[0] ?? gapXCenter();
  const offsetTop = () => adapter.props.offset?.[1] ?? gapYCenter();
  const markStyle = () => {
    const left = offsetLeft() - gapXCenter();
    const top = offsetTop() - gapYCenter();
    return {
      position: 'absolute',
      left: left > 0 ? `${left}px` : 0,
      top: top > 0 ? `${top}px` : 0,
      width: left > 0 ? `calc(100% - ${left}px)` : '100%',
      height: top > 0 ? `calc(100% - ${top}px)` : '100%',
      pointerEvents: 'none',
      backgroundRepeat: adapter.props.repeat ? 'repeat' : 'no-repeat',
      backgroundPosition: `${left > 0 ? 0 : left}px ${top > 0 ? 0 : top}px`,
      zIndex: adapter.props.zIndex ?? 6,
    } as WatermarkStyle;
  };
  const isStaggered = () => adapter.props.repeat && adapter.props.staggered;
  let renderId = 0;

  const appendWatermark = (base64: string, width: number) => {
    if (adapter.container) {
      const watermarkEle = watermarkMap.get(adapter.container);

      if (watermarkEle) {
        if (adapter.container.contains(watermarkEle)) {
          adapter.container.removeChild(watermarkEle);
        }
        watermarkMap.delete(adapter.container);
      }
      const newWatermarkEle = document.createElement('div');
      newWatermarkEle.setAttribute(
        'style',
        styleToString({
          ...markStyle(),
          backgroundImage: `url('${base64}')`,
          backgroundSize: `${width}px`,
        }),
      );
      adapter.container?.append(newWatermarkEle);
      watermarkMap.set(adapter.container, newWatermarkEle);
    }
  };

  const getMarkSize = (ctx: CanvasRenderingContext2D) => {
    let defaultWidth = 120;
    let defaultHeight = 28;
    if (!adapter.props.image && contents().length && ctx.measureText) {
      // 测量字体需与绘制字体一致（含 fontStyle/fontWeight），否则粗体/斜体会贴边裁切
      ctx.font = `${fontStyle()} normal ${fontWeight()} ${fontSize()}px ${fontFamily()}`;
      const widths = contents().map((item) => ctx.measureText(item!).width);
      defaultWidth = Math.ceil(Math.max(...widths));
      defaultHeight = fontSize() * contents().length + (contents().length - 1) * 3;
    }
    return [adapter.props.width ?? defaultWidth, adapter.props.height ?? defaultHeight] as const;
  };

  const renderWatermark = () => {
    const currentRenderId = ++renderId;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const [markWidth, markheight] = getMarkSize(ctx);
    const realMarkWidth = markWidth * ratio;
    const realMarkHeight = markheight * ratio;
    const canvasWidth = (gapX() + markWidth) * ratio;
    const canvasHeight = (gapY() + markheight) * ratio;
    const drawX = (gapX() / 2) * ratio;
    const drawY = (gapY() / 2) * ratio;
    const rotateX = canvasWidth / 2;
    const rotateY = canvasHeight / 2;
    const baseSize = isStaggered() ? 2 : 1;
    const fillWidth = (gapX() + markWidth) * baseSize;

    canvas.width = canvasWidth * baseSize;
    canvas.height = canvasHeight * baseSize;
    ctx.globalAlpha = adapter.props.alpha;
    ctx.save();
    ctx.translate(rotateX, rotateY);
    ctx.rotate((Math.PI / 180) * adapter.props.rotate);
    ctx.translate(-rotateX, -rotateY);

    const drawImage = () => {
      ctx.restore();
      if (isStaggered()) {
        ctx.globalAlpha = 1;
        ctx.drawImage(
          canvas,
          0,
          0,
          canvasWidth,
          canvasHeight,
          canvasWidth,
          canvasHeight,
          canvasWidth,
          canvasHeight,
        );
      }
      if (adapter.props.grayscale) {
        // 跨域图片（未带 CORS 头）会让 canvas 被污染，getImageData 抛 SecurityError；
        // 此时回退为绘制未灰阶的原图，而不是在 img.onload 内抛出未捕获异常
        try {
          canvasToGray(canvas);
        } catch {
          // noop
        }
      }
      appendWatermark(canvas.toDataURL(), fillWidth);
    };

    if (adapter.props.image) {
      const img = new Image();
      img.onload = () => {
        if (currentRenderId !== renderId) return;
        ctx.drawImage(img, drawX, drawY, realMarkWidth, realMarkHeight);
        drawImage();
      };
      img.crossOrigin = 'anonymous';
      img.referrerPolicy = 'no-referrer';
      img.src = adapter.props.image;
    } else {
      const mergedFontSize = Number(fontSize()) * ratio;
      ctx.font = `${fontStyle()} normal ${fontWeight()} ${mergedFontSize}px/${markheight}px ${fontFamily()}`;
      ctx.fillStyle = color();
      ctx.textAlign = textAlign();
      ctx.textBaseline = 'top';
      const textX =
        textAlign() === 'left' || textAlign() === 'start'
          ? 0
          : textAlign() === 'right' || textAlign() === 'end'
            ? realMarkWidth
            : realMarkWidth / 2;
      ctx.translate(textX, 0);
      contents()?.forEach((item, index) => {
        ctx.fillText(item ?? '', drawX, drawY + index * (mergedFontSize + 3 * ratio));
      });
      drawImage();
    }
  };

  const isWatermarkEle = (ele: Node) =>
    Array.from(watermarkMap.values()).some((watermark) => watermark === ele);

  const handleMutations = (mutations: MutationRecord[]) => {
    if (!adapter.props.antiTamper) return;
    for (const mutation of mutations) {
      const isRemoved = Array.from(mutation.removedNodes).some((node) => isWatermarkEle(node));
      const isModified = mutation.type === 'attributes' && isWatermarkEle(mutation.target);

      if (isRemoved || isModified) {
        renderWatermark();
        break;
      }
    }
  };

  return {
    render: renderWatermark,
    mutations: handleMutations,
    dispose() {
      renderId++;
      watermarkMap.clear();
    },
  };
}
