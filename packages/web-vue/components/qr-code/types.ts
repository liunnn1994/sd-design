import type { QrCodeInactiveStatus } from '@sdata/web-core/qr-code/types';

import type { SpinProps } from '../spin';

export type {
  QrCodeType,
  QrCodeErrorLevel,
  QrCodeStatusType,
  QrCodeInactiveStatus,
  QrCodeIconSize,
  QrCodeValue,
  QrCodeStatusRenderInfo,
} from '@sdata/web-core/qr-code/types';

export type QrCodeStatusProps = {
  prefixCls: string;
  status: QrCodeInactiveStatus;
  spinProps?: SpinProps;
};
