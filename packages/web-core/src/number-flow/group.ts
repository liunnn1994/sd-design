export interface NumberFlowGroupChild {
  prepare(): number | undefined;
  commit(version: number): boolean;
  start(version: number): void;
}

export function createNumberFlowGroup(adapter: { afterRender(): Promise<unknown> }) {
  const children = new Set<NumberFlowGroupChild>();
  let updating = false;
  let pending = false;

  return {
    register(child: NumberFlowGroupChild) {
      children.add(child);
      return () => {
        children.delete(child);
      };
    },
    async animate() {
      if (updating) {
        pending = true;
        return;
      }
      updating = true;
      try {
        do {
          pending = false;
          const preparedChildren = [...children].flatMap((child) => {
            const version = child.prepare();
            return version === undefined ? [] : [{ child, version }];
          });
          if (preparedChildren.length === 0) continue;
          await adapter.afterRender();
          const committedChildren = preparedChildren.filter(({ child, version }) =>
            child.commit(version),
          );
          committedChildren.forEach(({ child, version }) => child.start(version));
        } while (pending);
      } finally {
        updating = false;
      }
    },
  };
}
