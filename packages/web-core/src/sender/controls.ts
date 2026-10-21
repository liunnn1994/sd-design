export interface SenderHeaderState {
  readonly props: { open: boolean; forceRender: boolean };
  rendered: boolean;
}

export function createSenderHeader(
  state: SenderHeaderState,
  callbacks: {
    update(open: boolean): void;
    change(open: boolean): void;
  },
) {
  state.rendered = state.props.forceRender || state.props.open;
  let frame: number | undefined;
  const cancelFrame = () => {
    if (frame !== undefined) cancelAnimationFrame(frame);
    frame = undefined;
  };
  const afterEnter = (element: Element) => {
    cancelFrame();
    const target = element as HTMLElement;
    target.style.height = 'auto';
    target.style.borderBottomColor = '';
  };
  return {
    syncRendered(open: boolean, forceRender: boolean) {
      if (open || forceRender) state.rendered = true;
    },
    close() {
      const nextOpen = !state.props.open;
      callbacks.update(nextOpen);
      callbacks.change(nextOpen);
    },
    cancelFrame,
    beforeEnter(element: Element) {
      cancelFrame();
      const target = element as HTMLElement;
      target.style.height = '0';
      target.style.borderBottomColor = 'transparent';
    },
    enter(element: Element) {
      const target = element as HTMLElement;
      frame = requestAnimationFrame(() => {
        frame = undefined;
        target.style.height = `${target.scrollHeight}px`;
        target.style.borderBottomColor = '';
      });
    },
    afterEnter,
    beforeLeave(element: Element) {
      cancelFrame();
      const target = element as HTMLElement;
      target.style.height = `${target.scrollHeight}px`;
    },
    leave(element: Element) {
      const target = element as HTMLElement;
      frame = requestAnimationFrame(() => {
        frame = undefined;
        target.style.height = '0';
        target.style.borderBottomColor = 'transparent';
      });
    },
    afterLeave() {
      cancelFrame();
      if (!state.props.open && !state.props.forceRender) state.rendered = false;
    },
  };
}

export function createSenderSwitch(
  state: {
    readonly props: {
      modelValue?: boolean | undefined;
      disabled?: boolean | undefined;
      loading?: boolean | undefined;
    };
    readonly controlled: boolean;
    readonly checked: boolean;
    innerChecked: boolean;
  },
  callbacks: { update(checked: boolean): void; change(checked: boolean): void },
) {
  return {
    checked: () => (state.controlled ? Boolean(state.props.modelValue) : state.innerChecked),
    syncDefault(value: boolean) {
      if (!state.controlled) state.innerChecked = value;
    },
    change() {
      if (state.props.disabled || state.props.loading) return;
      const nextChecked = !state.checked;
      if (!state.controlled) state.innerChecked = nextChecked;
      callbacks.update(nextChecked);
      callbacks.change(nextChecked);
    },
  };
}

export const isSenderSkillCloseDisabled = (state: {
  disabled?: boolean;
  readonly?: boolean;
  skill: { closable?: boolean | { disabled?: boolean } };
}) =>
  state.disabled ||
  state.readonly ||
  (typeof state.skill.closable === 'object' && state.skill.closable.disabled);

export const resolveSenderSkillTooltip = <T>(skill: { tooltip?: string | T }) =>
  typeof skill.tooltip === 'string' ? { content: skill.tooltip } : skill.tooltip;

export function createSenderSkillTag(onRemove: (event: Event) => void) {
  return {
    remove(event: Event) {
      event.stopPropagation();
      onRemove(event);
    },
    keydown(event: KeyboardEvent) {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      event.stopPropagation();
      onRemove(event);
    },
  };
}
