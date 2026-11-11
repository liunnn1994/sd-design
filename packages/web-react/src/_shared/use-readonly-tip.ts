import { createReadonlyTip } from '@sdata/web-core/text-input/readonly';
import { useLayoutEffect, useRef, useState } from 'react';

import { useI18n } from '../locale/index.js';

export function useReadonlyTip(readonly: boolean | string | undefined, disabled: boolean) {
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);
  const current = useRef({ readonly, disabled });
  current.current = { readonly, disabled };
  const [tip] = useState(() =>
    createReadonlyTip({
      get readonly() {
        return current.current.readonly;
      },
      get disabled() {
        return current.current.disabled;
      },
      setVisible,
    }),
  );
  useLayoutEffect(() => () => tip.hide(), [tip]);
  const translated = t('readonlyTip');
  return {
    ...tip,
    visible,
    text:
      typeof readonly === 'string'
        ? readonly
        : translated === 'readonlyTip'
          ? 'Read-only mode'
          : translated,
  };
}
