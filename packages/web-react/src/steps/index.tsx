import type { Direction } from '@sdata/web-core/_utils/constant';
import type { StepData, StepStatus, StepsType } from '@sdata/web-core/steps/types';
import type { ComponentRef as ReactComponentRef } from 'react';
import type { ComponentPropsWithRef, ReactNode } from 'react';

import { createStep, createSteps, type StepsState } from '@sdata/web-core/steps/foundation';
import {
  createContext,
  useContext,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { useItemIndex } from '../_shared/use-item-index.js';
import { usePrefix } from '../config-provider/index.js';
import { useI18n } from '../locale/index.js';

export type { StepData, StepStatus, StepsType };
export type StepsChangeHandler = NonNullable<StepsProps['onChange']>;
export { STEPS_TYPES, STEP_STATUSES } from '@sdata/web-core/steps/types';
export interface StepsProps extends Omit<ComponentPropsWithRef<'div'>, 'onChange'> {
  type?: StepsType;
  direction?: Direction;
  labelPlacement?: Direction;
  current?: number;
  defaultCurrent?: number;
  status?: StepStatus;
  lineLess?: boolean;
  small?: boolean;
  changeable?: boolean;
  onCurrentChange?: (step: number) => void;
  onChange?: (step: number, event: Event) => void;
}
type StepRender = ReactNode | ((context: StepData) => ReactNode);
export interface StepProps extends Omit<ComponentPropsWithRef<'div'>, 'title'> {
  title?: ReactNode;
  description?: ReactNode;
  status?: StepStatus;
  disabled?: boolean;
  node?: StepRender;
  icon?: StepRender;
}
const StepsContext = createContext<(StepsState & { parentCls: string }) | undefined>(undefined);
const RegistryContext = createContext<
  { collect(id: string, data: StepData): void; remove(id: string): void } | undefined
>(undefined);

function StepsRoot({
  type = 'default',
  direction = 'horizontal',
  labelPlacement = 'horizontal',
  current,
  defaultCurrent = 1,
  status = 'process',
  lineLess = false,
  small = false,
  changeable = false,
  onCurrentChange,
  onChange,
  children,
  className,
  ...attrs
}: StepsProps) {
  const prefix = usePrefix('steps');
  const { t } = useI18n();
  const [inner, setInner] = useState(defaultCurrent);
  const [, render] = useState(0);
  const registry = useRef(new Map<string, StepData>());
  const live = useRef({
    props: { type, direction, labelPlacement, status, changeable },
    current: current ?? inner,
    onCurrentChange,
    onChange,
  });
  live.current = {
    props: { type, direction, labelPlacement, status, changeable },
    current: current ?? inner,
    onCurrentChange,
    onChange,
  };
  const [foundation] = useState(() =>
    createSteps({
      get props() {
        return live.current.props;
      },
      get current() {
        return live.current.current;
      },
      registry: registry.current,
      setInner,
      onUpdate: (value) => live.current.onCurrentChange?.(value),
      onChange: (value, event) => live.current.onChange?.(value, event),
    }),
  );
  const [collector] = useState(() => ({
    collect(id: string, data: StepData) {
      const previous = registry.current.get(id);
      if (previous?.step === data.step && previous.status === data.status) return;
      foundation.add(id, data);
      render((value) => value + 1);
    },
    remove(id: string) {
      if (!registry.current.has(id)) return;
      foundation.remove(id);
      render((value) => value + 1);
    },
  }));
  const context = {
    type,
    current: current ?? inner,
    direction: foundation.direction(),
    labelPlacement: foundation.labelPlacement(),
    lineLess,
    errorSteps: foundation.errors(),
    changeable,
    getStatus: foundation.status,
    onClick: foundation.click,
    parentCls: prefix,
  };
  return (
    <StepsContext.Provider value={context}>
      <RegistryContext.Provider value={collector}>
        <div
          role="list"
          aria-label={t('a11y.steps')}
          {...attrs}
          className={[
            prefix,
            `${prefix}-${context.direction}`,
            `${prefix}-label-${context.labelPlacement}`,
            `${prefix}-mode-${type}`,
            changeable && `${prefix}-changeable`,
            small && type !== 'dot' && `${prefix}-size-small`,
            lineLess && `${prefix}-line-less`,
            className,
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {children}
        </div>
      </RegistryContext.Provider>
    </StepsContext.Provider>
  );
}
export function Step({
  title,
  description,
  status,
  disabled = false,
  node,
  icon,
  children,
  ref,
  onClick,
  onKeyDown,
  className,
  ...attrs
}: StepProps) {
  const prefix = usePrefix('steps-item');
  const iconPrefix = usePrefix('steps-icon');
  const root = useRef<HTMLDivElement>(null);
  const context = useContext(StepsContext);
  const collector = useContext(RegistryContext);
  const id = useId();
  const step = useItemIndex(root, `.${prefix}`, context?.parentCls) + 1;
  useImperativeHandle(ref, () => root.current!, []);
  const foundation = createStep({ props: { status, disabled }, context, step });
  const resolvedStatus = foundation.status();
  useLayoutEffect(() => {
    collector?.collect(id, { step, status: resolvedStatus });
  }, [collector, id, step, resolvedStatus]);
  useLayoutEffect(() => () => collector?.remove(id), [collector, id]);
  const type = context?.type ?? 'default';
  const data = { step, status: resolvedStatus };
  const renderNode = (value: StepRender) => (typeof value === 'function' ? value(data) : value);
  const defaultIcon =
    resolvedStatus === 'finish' || resolvedStatus === 'error' ? (
      <svg
        viewBox="0 0 48 48"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        width="1em"
        height="1em"
        aria-hidden="true"
      >
        <path
          d={
            resolvedStatus === 'finish'
              ? 'M41.678 11.05 19.05 33.678 6.322 20.95'
              : 'm12 12 24 24M12 36l24-24'
          }
        />
      </svg>
    ) : (
      step
    );
  return (
    <div
      {...attrs}
      ref={root}
      role="listitem"
      aria-current={step === context?.current ? 'step' : undefined}
      aria-disabled={disabled || undefined}
      tabIndex={context?.changeable && !disabled ? 0 : undefined}
      className={[
        prefix,
        `${prefix}-${resolvedStatus}`,
        step === context?.current && `${prefix}-active`,
        foundation.nextError() && `${prefix}-next-error`,
        disabled && `${prefix}-disabled`,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={(event) => {
        onClick?.(event);
        foundation.click(event.nativeEvent);
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        foundation.keydown(event.nativeEvent);
      }}
    >
      {foundation.showTail() && <div className={`${prefix}-tail`} />}
      {type !== 'arrow' && (
        <div className={`${prefix}-node`}>
          {node !== undefined ? (
            renderNode(node)
          ) : type !== 'dot' ? (
            <div className={iconPrefix}>{icon !== undefined ? renderNode(icon) : defaultIcon}</div>
          ) : null}
        </div>
      )}
      <div className={`${prefix}-content`}>
        <div className={`${prefix}-title`}>{children !== undefined ? children : title}</div>
        {description != null && <div className={`${prefix}-description`}>{description}</div>}
      </div>
    </div>
  );
}
export const Steps = Object.assign(StepsRoot, { Step });
export default Steps;

export type StepsInstance = ReactComponentRef<typeof Steps>;
export type StepsStepInstance = ReactComponentRef<typeof Step>;
