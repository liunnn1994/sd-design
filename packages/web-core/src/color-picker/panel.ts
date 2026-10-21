import type {
  Color,
  ColorFormat,
  ColorModes,
  ColorObject,
  ColorPickerChangeTrigger,
  ColorValueState,
  GradientColorPoint,
  HSVA,
  RecentColorsValue,
} from './types.js';

import {
  TD_COLOR_USED_COLORS_MAX_SIZE,
  addGradientColor,
  formatColor,
  formatColorState,
  getActiveGradientPoint,
  getColorObject,
  getDefaultColorState,
  getDefaultGradientState,
  getFormatInputs,
  normalizeFormat,
  parseColorState,
  parseFormatInputValues,
  removeGradientColor,
  round,
  setActiveColorHsva,
  setGradientColors,
  setGradientDegree,
  setGradientSelectedPoint,
} from './utils.js';
export type ColorSectionTrigger = 'recent' | 'preset';
const clampPercent = (value: number) => Math.min(100, Math.max(0, value));
const getGradientPointComparableColor = (point: GradientColorPoint) =>
  formatColor(point.hsva, 'CSS', true);

const matchGradientPoint = (
  previousPoints: GradientColorPoint[],
  nextPoint: GradientColorPoint,
  usedIds: Set<string>,
) => {
  const availablePoints = previousPoints.filter((point) => !usedIds.has(point.id));
  if (!availablePoints.length) return undefined;
  const nextColor = getGradientPointComparableColor(nextPoint);
  const sameColorPoints = availablePoints.filter(
    (point) => getGradientPointComparableColor(point) === nextColor,
  );
  const candidates = sameColorPoints.length ? sameColorPoints : availablePoints;
  return candidates.reduce<GradientColorPoint | undefined>((closestPoint, point) => {
    if (!closestPoint) return point;
    return Math.abs(point.left - nextPoint.left) < Math.abs(closestPoint.left - nextPoint.left)
      ? point
      : closestPoint;
  }, undefined);
};

export const reconcileGradientState = (
  previousState: ColorValueState,
  nextState: ColorValueState,
) => {
  if (previousState.mode !== 'linear-gradient' || nextState.mode !== 'linear-gradient') {
    return nextState;
  }
  const usedIds = new Set<string>();
  const nextColors = nextState.gradientColors.map((point) => {
    const matchedPoint = matchGradientPoint(previousState.gradientColors, point, usedIds);
    if (!matchedPoint) return point;
    usedIds.add(matchedPoint.id);
    return { ...point, id: matchedPoint.id } satisfies GradientColorPoint;
  });
  const selectedPoint =
    nextColors.find((point) => point.id === previousState.gradientSelectedId) || nextColors[0];
  return {
    ...nextState,
    gradientColors: nextColors,
    gradientSelectedId: selectedPoint?.id || '',
    hsva: selectedPoint?.hsva || nextState.hsva,
  } satisfies ColorValueState;
};

export function getColorSectionList(colors: string[] | boolean | null, modes: ColorModes) {
  if (!Array.isArray(colors)) return undefined;
  const onlyGradient = modes.length === 1 && modes[0] === 'linear-gradient';
  return onlyGradient ? colors.filter((item) => item.startsWith('linear-gradient(')) : colors;
}
export function getColorFormatOptions(alpha: boolean) {
  const base: Array<{ value: ColorFormat; label: string }> = [
    'HEX',
    'RGB',
    'HSL',
    'HSV',
    'CMYK',
    'CSS',
  ].map((value) => ({ value: value as ColorFormat, label: value }));
  return alpha
    ? [
        ...(['HEX8', 'RGBA', 'HSLA', 'HSVA'] as const).map((value) => ({ value, label: value })),
        ...base,
      ]
    : base;
}
export function createColorPanel(adapter: {
  readonly props: {
    value: string;
    colorModes: ColorModes;
    disabled: boolean;
    enableAlpha: boolean;
    format: ColorFormat;
    recentColors: RecentColorsValue;
    swatchColors: string[] | null;
    enableMultipleGradient: boolean;
    onChange?: (value: string, trigger: ColorPickerChangeTrigger) => void;
    onRecentColorsChange?: (value: string[]) => void;
    onPaletteBarChange?: (context: { color: ColorObject }) => void;
  };
  state: ColorValueState;
  format: ColorFormat;
  drafts: string[];
  afterRender(callback: () => void): void;
  trackRect(): Pick<DOMRect, 'left' | 'width'> | undefined;
  isTrackTarget(event: MouseEvent): boolean;
}) {
  const active = () => getActiveGradientPoint(adapter.state)?.hsva || adapter.state.hsva;
  const recentColors = () =>
    getColorSectionList(adapter.props.recentColors, adapter.props.colorModes);
  const syncDrafts = () => {
    adapter.drafts = getFormatInputs(active(), adapter.format, adapter.props.enableAlpha);
  };
  const emitStateChange = (
    nextState: ColorValueState,
    trigger: ColorPickerChangeTrigger,
    notifyPaletteBar?: boolean,
  ) => {
    if (adapter.props.disabled) return;
    adapter.state = nextState;
    syncDrafts();
    adapter.props.onChange?.(
      formatColorState(nextState, adapter.format, adapter.props.enableAlpha),
      trigger,
    );
    if (notifyPaletteBar) adapter.props.onPaletteBarChange?.({ color: getColorObject(nextState) });
    adapter.afterRender(() => {
      const acceptedState = parseColorState(adapter.props.value, adapter.props.colorModes);
      if (
        formatColorState(adapter.state, adapter.format, adapter.props.enableAlpha) ===
        formatColorState(acceptedState, adapter.format, adapter.props.enableAlpha)
      )
        return;
      adapter.state = reconcileGradientState(adapter.state, acceptedState);
      syncDrafts();
    });
  };
  const handleHsvaChange = (
    nextHsva: HSVA,
    trigger: ColorPickerChangeTrigger,
    notifyPaletteBar?: boolean,
  ) => emitStateChange(setActiveColorHsva(adapter.state, nextHsva), trigger, notifyPaletteBar);
  const handleModeChange = (mode: string | number | boolean) => {
    if (adapter.props.disabled || typeof mode !== 'string' || mode === adapter.state.mode) return;
    if (mode === 'linear-gradient') {
      emitStateChange(getDefaultGradientState(formatColor(active(), 'CSS', true)), 'input');
      return;
    }
    emitStateChange({ ...getDefaultColorState(), mode: 'monochrome', hsva: active() }, 'input');
  };
  const updateDraft = (index: number, value: string) => {
    const nextDrafts = [...adapter.drafts];
    nextDrafts[index] = value;
    adapter.drafts = nextDrafts;
  };
  const commitDrafts = (index: number) => {
    const drafts = [...adapter.drafts];
    if (index === 1 && normalizeFormat(adapter.format, adapter.props.enableAlpha) === 'HEX8') {
      drafts[0] = drafts[0].slice(0, 6);
    }
    handleHsvaChange(
      parseFormatInputValues(drafts, adapter.format, adapter.props.enableAlpha),
      'input',
    );
  };
  const updateThumbLeft = (pointId: string, clientX: number) => {
    const rect = adapter.trackRect();
    if (!rect) return;
    const nextLeft = clampPercent(((clientX - rect.left) / rect.width) * 100);
    const gradientColors = adapter.state.gradientColors.map((point) =>
      point.id === pointId ? { ...point, left: round(nextLeft, 2) } : point,
    );
    emitStateChange(setGradientColors(adapter.state, gradientColors), 'input');
  };
  const handleGradientBarClick = (event: MouseEvent) => {
    if (
      adapter.props.disabled ||
      !adapter.props.enableMultipleGradient ||
      adapter.state.mode !== 'linear-gradient'
    )
      return;
    if (!adapter.isTrackTarget(event)) return;
    const rect = adapter.trackRect();
    if (!rect) return;
    const left = clampPercent(((event.clientX - rect.left) / rect.width) * 100);
    emitStateChange(addGradientColor(adapter.state, left), 'input');
  };
  const handleGradientBarKeyDown = (event: KeyboardEvent) => {
    if (
      (event.key === 'Enter' || event.key === ' ') &&
      !adapter.props.disabled &&
      adapter.props.enableMultipleGradient
    ) {
      event.preventDefault();
      emitStateChange(addGradientColor(adapter.state, 50), 'input');
    }
  };
  const handleThumbSelect = (pointId: string) => {
    if (adapter.state.gradientSelectedId !== pointId) {
      emitStateChange(setGradientSelectedPoint(adapter.state, pointId), 'input');
    }
  };
  const handleThumbRemove = (pointId: string) => {
    if (adapter.state.gradientColors.length > 2) {
      emitStateChange(removeGradientColor(adapter.state, pointId), 'input');
    }
  };
  const handleDegreeChange = (value: unknown) => {
    if (typeof value === 'number') {
      emitStateChange(setGradientDegree(adapter.state, value), 'input');
    }
  };
  const handlePaletteChange = (s: number, v: number) =>
    handleHsvaChange({ ...active(), s, v }, 'palette-saturation-brightness');
  const handleHueChange = (h: number) =>
    handleHsvaChange({ ...active(), h }, 'palette-hue-bar', true);
  const handleAlphaChange = (a: number) =>
    handleHsvaChange({ ...active(), a }, 'palette-alpha-bar', true);
  const handleFormatChange = (value: unknown) => {
    if (typeof value !== 'string') return;
    adapter.format = value as ColorFormat;
    syncDrafts();
  };
  const addRecentColor = () => {
    if (adapter.props.disabled) return;
    if (adapter.props.recentColors === null || adapter.props.recentColors === false) return;
    const currentValue = formatColorState(adapter.state, adapter.format, adapter.props.enableAlpha);
    const next = [...(recentColors() || [])];
    const index = next.indexOf(currentValue);
    if (index !== -1) next.splice(index, 1);
    next.unshift(currentValue);
    if (next.length > TD_COLOR_USED_COLORS_MAX_SIZE) next.length = TD_COLOR_USED_COLORS_MAX_SIZE;
    adapter.props.onRecentColorsChange?.(next);
  };
  const getColorBlockStyle = (value: string): Record<string, string> =>
    value.startsWith('linear-gradient(') ? { backgroundImage: value } : { backgroundColor: value };
  const selectColorBlock = (value: string, trigger: ColorSectionTrigger) =>
    emitStateChange(parseColorState(value, adapter.props.colorModes), trigger);

  return {
    syncDrafts,
    syncValue() {
      adapter.state = reconcileGradientState(
        adapter.state,
        parseColorState(adapter.props.value, adapter.props.colorModes),
      );
      syncDrafts();
    },
    syncFormat() {
      adapter.format = normalizeFormat(adapter.props.format, adapter.props.enableAlpha);
      syncDrafts();
    },
    active,
    colorModel(): Color {
      const color = getColorObject(adapter.state);
      return {
        hsv: { h: active().h, s: active().s, v: active().v },
        rgb: { r: color.red, g: color.green, b: color.blue },
        hex: color.hex.replace('#', ''),
      };
    },
    handleModeChange,
    updateDraft,
    commitDrafts,
    updateThumbLeft,
    handleGradientBarClick,
    handleGradientBarKeyDown,
    handleThumbSelect,
    handleThumbRemove,
    handleDegreeChange,
    handlePaletteChange,
    handleHueChange,
    handleAlphaChange,
    handleFormatChange,
    addRecentColor,
    getColorBlockStyle,
    selectColorBlock,
  };
}
