import type { ReactNode } from 'react';

import { setValueByPath } from '@sdata/web-core/_utils/get-value-by-path';
import { useContext } from 'react';

import { FormContext } from '../form/context.js';

export function JsonFormModelBridge({
  children,
  refresh,
}: {
  children: ReactNode;
  refresh(): void;
}) {
  const form = useContext(FormContext);
  if (!form) return children;
  return (
    <FormContext.Provider
      value={{
        ...form,
        setValue(field, value) {
          setValueByPath(form.model, field, value);
          refresh();
        },
      }}
    >
      {children}
    </FormContext.Provider>
  );
}
