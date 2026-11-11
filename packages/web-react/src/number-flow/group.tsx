import type { ComponentPropsWithRef } from 'react';

import { createNumberFlowGroup } from '@sdata/web-core/number-flow/group';
import { createContext, useState } from 'react';

import { usePrefix } from '../config-provider/index.js';

function createGroup() {
  const foundation = createNumberFlowGroup({
    afterRender: () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())),
  });
  let scheduled = false;
  return {
    register: foundation.register,
    schedule() {
      if (scheduled) return;
      scheduled = true;
      queueMicrotask(() => {
        scheduled = false;
        void foundation.animate();
      });
    },
  };
}

export const NumberFlowGroupContext = createContext<ReturnType<typeof createGroup> | undefined>(
  undefined,
);
export type NumberFlowGroupProps = ComponentPropsWithRef<'span'>;

export function NumberFlowGroup({ children, className, ...attrs }: NumberFlowGroupProps) {
  const [group] = useState(createGroup);
  const prefix = usePrefix('number-flow-group');
  return (
    <NumberFlowGroupContext.Provider value={group}>
      <span {...attrs} className={[prefix, className].filter(Boolean).join(' ')}>
        {children}
      </span>
    </NumberFlowGroupContext.Provider>
  );
}
