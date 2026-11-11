import type {
  QrCodeType,
  QrCodeValue,
  QrCodeIconSize,
  QrCodeErrorLevel,
  QrCodeStatusType,
  QrCodeInactiveStatus,
  QrCodeStatusRenderInfo,
} from '@sdata/web-core/qr-code/types';
import type { ComponentPropsWithRef, ReactNode } from 'react';

import {
  createQrCode,
  mergeQrCodeValue,
  getQrCodeIconStyle,
  getQrCodeStyle,
  getQrCodeOptions,
} from '@sdata/web-core/qr-code/foundation';
import { useImperativeHandle, useLayoutEffect, useRef, useState } from 'react';

import { useAfterRender } from '../_shared/use-after-render.js';
import { useThemeMode } from '../_shared/use-theme-mode.js';
import { useConfig, usePrefix } from '../config-provider/index.js';
import { useI18n } from '../locale/index.js';
import { Spin, type SpinProps } from '../spin/index.js';
export type * from '@sdata/web-core/qr-code/types';
export type QrCodeInstance = HTMLDivElement;
export interface QrCodeStatusProps {
  prefixCls: string;
  status: QrCodeInactiveStatus;
  spinProps?: SpinProps;
}
export interface QrCodeProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  value?: QrCodeValue;
  type?: QrCodeType;
  icon?: string;
  iconAlt?: string;
  size?: number;
  iconSize?: QrCodeIconSize;
  color?: string;
  bgColor?: string;
  bordered?: boolean;
  errorLevel?: QrCodeErrorLevel;
  boostLevel?: boolean;
  marginSize?: number;
  status?: QrCodeStatusType;
  statusRender?: (info: QrCodeStatusRenderInfo) => ReactNode;
  renderStatus?: (info: QrCodeStatusRenderInfo) => ReactNode;
  spinProps?: SpinProps;
  iconContent?: ReactNode;
  onRefresh?: () => void;
}
export function QrCode({
  value,
  type = 'canvas',
  icon = '',
  iconAlt = 'qr-code-icon',
  size = 160,
  iconSize = 40,
  color = '',
  bgColor = 'transparent',
  bordered = true,
  errorLevel = 'M',
  boostLevel = true,
  marginSize = 0,
  status = 'active',
  statusRender,
  renderStatus,
  spinProps,
  iconContent,
  onRefresh,
  ref,
  className,
  style,
  ...attrs
}: QrCodeProps) {
  const prefix = usePrefix('qr-code');
  const config = useConfig();
  const { t } = useI18n();
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const theme = useThemeMode(root);
  const merged = mergeQrCodeValue(value);
  const hasValue = Boolean(merged);
  const options = getQrCodeOptions(
    { color, bgColor, errorLevel, boostLevel, marginSize, size },
    theme,
  );
  const live = useRef({ merged, type, options });
  live.current = { merged, type, options };
  const [svg, setSvg] = useState('');
  const afterRender = useAfterRender();
  const [foundation] = useState(() =>
    createQrCode({
      get value() {
        return live.current.merged;
      },
      get type() {
        return live.current.type;
      },
      get options() {
        return live.current.options;
      },
      get canvas() {
        return canvas.current ?? undefined;
      },
      nextRender: afterRender,
      createCanvas: () => document.createElement('canvas'),
      setSvg,
    }),
  );
  useLayoutEffect(() => () => foundation.dispose(), [foundation]);
  useLayoutEffect(() => {
    void foundation.render();
  }, [foundation, merged, type, size, color, bgColor, errorLevel, marginSize, boostLevel, theme]);
  useImperativeHandle(ref, () => root.current!, [hasValue]);
  if (!hasValue) return null;
  const info = status === 'active' ? undefined : { status, onRefresh: () => onRefresh?.() };
  const custom = info ? statusRender?.(info) : null;
  return (
    <div
      {...attrs}
      ref={root}
      className={[
        prefix,
        !bordered && `${prefix}-borderless`,
        info && `${prefix}-has-status`,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ ...getQrCodeStyle(size, bgColor), ...style }}
    >
      {info && (
        <div className={`${prefix}-cover`}>
          {custom ||
            (renderStatus ? (
              renderStatus(info)
            ) : (
              <div className={`${prefix}-status`} role="status" aria-live="polite">
                {status === 'loading' ? (
                  <Spin {...config.qrCodeSpinProps} {...spinProps} />
                ) : status === 'expired' ? (
                  <>
                    <p className={`${prefix}-expired`}>{t('qrCode.expired')}</p>
                    <button type="button" className={`${prefix}-refresh-btn`} onClick={onRefresh}>
                      {t('qrCode.refresh')}
                    </button>
                  </>
                ) : (
                  <p className={`${prefix}-scanned`}>{t('qrCode.scanned')}</p>
                )}
              </div>
            ))}
        </div>
      )}
      {type === 'canvas' ? (
        <canvas
          ref={canvas}
          className={`${prefix}-canvas`}
          role="img"
          aria-label={t('a11y.qrCode', merged)}
        />
      ) : (
        <div
          className={`${prefix}-svg`}
          role="img"
          aria-label={t('a11y.qrCode', merged)}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      )}
      {(icon || iconContent !== undefined) && (
        <div className={`${prefix}-icon`}>
          {iconContent !== undefined ? (
            iconContent
          ) : (
            <img src={icon} alt={iconAlt} style={getQrCodeIconStyle(iconSize)} />
          )}
        </div>
      )}
    </div>
  );
}
export default QrCode;
