import type { Direction } from '../_utils/constant.js';
import type { StepData, StepStatus, StepsType } from './types.js';

import { isActivationKey } from '../_utils/keyboard.js';

export interface StepsState {
  current: number;
  direction: Direction;
  labelPlacement: Direction;
  lineLess: boolean;
  type: StepsType;
  errorSteps: number[];
  changeable: boolean;
  getStatus(step: number): StepStatus;
  onClick(step: number, event: Event): void;
}

export function createSteps(adapter: {
  readonly props: {
    type: StepsType;
    direction: Direction;
    labelPlacement: Direction;
    status: StepStatus;
    changeable: boolean;
  };
  readonly current: number;
  readonly registry: Map<number, StepData>;
  setInner(step: number): void;
  onUpdate(step: number): void;
  onChange(step: number, event: Event): void;
}) {
  function direction(): Direction {
    return ['navigation', 'arrow'].includes(adapter.props.type)
      ? 'horizontal'
      : adapter.props.direction;
  }
  return {
    direction,
    labelPlacement(): Direction {
      if (adapter.props.type === 'dot')
        return direction() === 'vertical' ? 'horizontal' : 'vertical';
      if (adapter.props.type === 'navigation') return 'horizontal';
      return adapter.props.labelPlacement;
    },
    status(step: number): StepStatus {
      if (step < adapter.current) return 'finish';
      if (step > adapter.current) return 'wait';
      return adapter.props.status;
    },
    click(step: number, event: Event) {
      if (adapter.props.changeable) {
        adapter.setInner(step);
        adapter.onUpdate(step);
        adapter.onChange(step, event);
      }
    },
    errors() {
      return Array.from(adapter.registry.values())
        .filter((item) => item.status === 'error')
        .map((item) => item.step);
    },
    add(id: number, data: StepData) {
      adapter.registry.set(id, data);
    },
    remove(id: number) {
      adapter.registry.delete(id);
    },
  };
}

export function createStep(adapter: {
  readonly props: { status?: StepStatus; disabled: boolean };
  readonly context: StepsState | undefined;
  readonly step: number;
}) {
  return {
    status() {
      return adapter.props.status ?? adapter.context?.getStatus(adapter.step) ?? 'process';
    },
    nextError() {
      return adapter.context?.errorSteps.includes(adapter.step + 1) ?? false;
    },
    showTail() {
      return (
        !adapter.context?.lineLess &&
        (adapter.context?.labelPlacement === 'vertical' ||
          adapter.context?.direction === 'vertical')
      );
    },
    click(event: Event) {
      if (!adapter.props.disabled) adapter.context?.onClick(adapter.step, event);
    },
    keydown(event: KeyboardEvent) {
      if (adapter.context?.changeable && !adapter.props.disabled && isActivationKey(event)) {
        event.preventDefault();
        adapter.context.onClick(adapter.step, event);
      }
    },
  };
}
