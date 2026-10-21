import { isActivationKey } from '../_utils/keyboard.js';
import { getPaginationTarget, getStepPagerDisabled } from './utils.js';

export interface PagerState {
  readonly disabled: boolean;
  readonly current?: number | undefined;
  readonly pageNumber?: number | undefined;
}

export function createPagerFoundation(
  state: PagerState,
  onClick: (pageNumber: number, event: Event) => void,
) {
  const getIsActive = () => state.current === state.pageNumber;
  const activate = (e: Event) => {
    if (!state.disabled) {
      onClick(state.pageNumber!, e);
    }
  };
  const handleClick = (e: MouseEvent) => activate(e);
  const handleKeydown = (e: KeyboardEvent) => {
    if (state.disabled) return;
    if (isActivationKey(e)) {
      e.preventDefault();
      activate(e);
    }
  };
  return { getIsActive, activate, handleClick, handleKeydown };
}

export interface PagerTargetState {
  readonly mergedDisabled: boolean;
  readonly nextPage: number;
}

function createTargetPagerHandlers(state: PagerTargetState, onClick: (page: number) => void) {
  const handleClick = (_e: MouseEvent) => {
    if (!state.mergedDisabled) {
      onClick(state.nextPage);
    }
  };
  const handleKeydown = (e: KeyboardEvent) => {
    if (state.mergedDisabled) return;
    if (isActivationKey(e)) {
      e.preventDefault();
      onClick(state.nextPage);
    }
  };
  return { handleClick, handleKeydown };
}

export interface StepPagerState extends PagerTargetState {
  readonly disabled: boolean;
  readonly pages: number;
  readonly current: number;
  readonly isNext: boolean;
}

export function createStepPagerFoundation(state: StepPagerState, onClick: (page: number) => void) {
  const getMergedDisabled = () =>
    getStepPagerDisabled(state.disabled, state.pages, state.current, state.isNext);
  const getNextPage = () => getPaginationTarget(state.current, state.isNext ? 1 : -1, state.pages);
  return { getMergedDisabled, getNextPage, ...createTargetPagerHandlers(state, onClick) };
}

export interface EllipsisPagerState extends PagerTargetState {
  readonly disabled: boolean;
  readonly pages: number;
  readonly current: number;
  readonly step: number;
}

export function createEllipsisPagerFoundation(
  state: EllipsisPagerState,
  onClick: (page: number) => void,
) {
  const getNextPage = () => getPaginationTarget(state.current, state.step, state.pages);
  const getMergedDisabled = () => state.disabled || !state.pages;
  return { getNextPage, getMergedDisabled, ...createTargetPagerHandlers(state, onClick) };
}

export interface PageOptionsState {
  readonly pageSize?: number | undefined;
  readonly sizeOptions: number[];
}

export function createPageOptionsFoundation(
  state: PageOptionsState,
  countPerPage: () => string,
  onChange: (value: number) => void,
) {
  const getModelValue = () => state.pageSize ?? undefined;
  const getOptions = () =>
    state.sizeOptions.map((value) => ({ value, label: `${value} ${countPerPage()}` }));
  const handleChange = (value: unknown) => {
    if (typeof value !== 'number') {
      return;
    }
    onChange(value);
  };
  return { getModelValue, getOptions, handleChange };
}
