import type { ComponentRef as ReactComponentRef } from 'react';
import type { ComponentPropsWithRef } from 'react';

import { createSecretFoundation } from '@sdata/web-core/secret/foundation';
import { useState } from 'react';

import { EyeIcon } from '../_shared/eye-icon.js';
import { usePrefix } from '../config-provider/index.js';
import { Copy } from '../copy/index.js';
import { PerformantEllipsis } from '../ellipsis/index.js';
import { useI18n } from '../locale/index.js';
import { Tooltip } from '../tooltip/index.js';

export interface SecretProps extends ComponentPropsWithRef<'div'> {
  text: string;
  hiddenText?: string;
  showCopy?: boolean;
  visible?: boolean;
  onVisibleChange?: (visible: boolean) => void;
}
export function Secret({
  text,
  hiddenText = '********',
  showCopy = true,
  visible,
  onVisibleChange,
  className,
  ...attrs
}: SecretProps) {
  const prefix = usePrefix('secret');
  const { t } = useI18n();
  const [local, setLocal] = useState(false);
  const shown = visible ?? local;
  const foundation = createSecretFoundation({
    get visible() {
      return shown;
    },
    set visible(value) {
      if (visible === undefined) setLocal(value);
      onVisibleChange?.(value);
    },
  });
  const label = t(foundation.labelKey);
  return (
    <div {...attrs} className={[prefix, className].filter(Boolean).join(' ')}>
      {shown ? (
        <PerformantEllipsis className={`${prefix}-content`}>{text}</PerformantEllipsis>
      ) : (
        <span className={`${prefix}-content ${prefix}-placeholder`}>{hiddenText}</span>
      )}
      <Tooltip content={label}>
        <button
          type="button"
          className={`${prefix}-trigger`}
          aria-label={label}
          aria-pressed={shown}
          onClick={foundation.toggle}
        >
          <EyeIcon invisible={shown} />
        </button>
      </Tooltip>
      {showCopy && <Copy content={text} />}
    </div>
  );
}
export default Secret;

export type SecretInstance = ReactComponentRef<typeof Secret>;
