import type { ComponentPropsWithRef } from 'react';

import {
  getColorFormatOptions,
  getColorSectionList,
  type ColorSectionTrigger,
} from '@sdata/web-core/color-picker/panel';
import {
  formatColor,
  getColorBackground,
  getGradientThumbBackground,
  getLinearGradientString,
} from '@sdata/web-core/color-picker/utils';

import { usePrefix } from '../config-provider/index.js';
import { InputNumber } from '../input-number/index.js';
import { Input, InputGroup } from '../input/index.js';
import { useI18n } from '../locale/index.js';
import { RadioGroup } from '../radio/index.js';
import { Select } from '../select/index.js';
import { ColorControlBar, ColorPalette } from './controls.js';
import { ColorGradientThumb } from './gradient-thumb.js';
import { useColorPanel, type ColorPanelOptions } from './use-panel.js';

export interface ColorPanelProps extends ColorPanelOptions {
  showPrimaryColorPreview?: boolean;
  rootProps?: ComponentPropsWithRef<'div'>;
}

export function ColorPanel(props: ColorPanelProps) {
  const prefix = usePrefix('color-picker');
  const { t } = useI18n();
  const { state, format, drafts, foundation: f, track, shell } = useColorPanel(props);
  const active = f.active();
  const color = f.colorModel();
  const recent = getColorSectionList(props.recentColors, props.colorModes);
  const swatches = getColorSectionList(props.swatchColors, props.colorModes);
  const colorSection = (text: string, values: string[], trigger: ColorSectionTrigger) => (
    <div className={`${prefix}-colors-section`}>
      <div className={`${prefix}-colors-header`}>
        <div className={`${prefix}-colors-text`}>{text}</div>
        {trigger === 'recent' && (
          <button
            type="button"
            className={`${prefix}-colors-action`}
            disabled={props.disabled}
            onClick={f.addRecentColor}
          >
            {t('colorPicker.addCurrent')}
          </button>
        )}
      </div>
      <div className={`${prefix}-colors-wrapper`}>
        {values.length ? (
          <div className={`${prefix}-colors-list`}>
            {values.map((value) => (
              <button
                key={value}
                type="button"
                className={`${prefix}-color-block`}
                disabled={props.disabled}
                aria-label={t('a11y.selectColor', value)}
                onClick={() => f.selectColorBlock(value, trigger)}
              >
                <div className={`${prefix}-block`} style={f.getColorBlockStyle(value)} />
              </button>
            ))}
          </div>
        ) : (
          <span className={`${prefix}-colors-empty`}>{t('colorPicker.empty')}</span>
        )}
      </div>
    </div>
  );
  return (
    <div
      {...props.rootProps}
      className={[`${prefix}-panel`, props.disabled && `${prefix}-panel-disabled`]
        .concat(props.rootProps?.className ?? '')
        .filter(Boolean)
        .join(' ')}
    >
      {props.colorModes.length > 1 && (
        <div className={`${prefix}-panel-head`}>
          <RadioGroup
            type="button"
            size="small"
            value={state.mode}
            options={[
              { value: 'monochrome', label: t('colorPicker.monochrome') },
              { value: 'linear-gradient', label: t('colorPicker.gradient') },
            ]}
            disabled={props.disabled}
            onChange={f.handleModeChange}
          />
        </div>
      )}
      {state.mode === 'linear-gradient' && (
        <div className={`${prefix}-gradient-panel`}>
          <div ref={shell} className={`${prefix}-gradient-bar-shell`}>
            <button
              ref={track}
              type="button"
              className={`${prefix}-gradient-bar`}
              disabled={props.disabled}
              style={{ backgroundImage: getGradientThumbBackground(state.gradientColors) }}
              onClick={(event) => f.handleGradientBarClick(event.nativeEvent)}
              onKeyDown={(event) => f.handleGradientBarKeyDown(event.nativeEvent)}
            />
            {state.gradientColors.map((point) => (
              <ColorGradientThumb
                key={point.id}
                point={point}
                prefixCls={prefix}
                active={point.id === state.gradientSelectedId}
                disabled={props.disabled}
                onSelect={() => f.handleThumbSelect(point.id)}
                onMove={(x) => f.updateThumbLeft(point.id, x)}
                onRemove={() => f.handleThumbRemove(point.id)}
              />
            ))}
          </div>
          <div className={`${prefix}-gradient-meta`}>
            <span className={`${prefix}-gradient-label`}>{t('colorPicker.angle')}</span>
            <InputNumber
              className={`${prefix}-gradient-degree`}
              size="mini"
              min={0}
              max={360}
              hideButton
              disabled={props.disabled}
              value={state.gradientDegree}
              onChange={f.handleDegreeChange}
            />
          </div>
          <div
            className={`${prefix}-gradient-preview`}
            style={{ backgroundImage: getLinearGradientString(state) }}
          />
        </div>
      )}
      <ColorPalette color={color} onChange={f.handlePaletteChange} />
      <div className={`${prefix}-panel-control`}>
        <div className={`${prefix}-control-wrapper`}>
          <div>
            <ColorControlBar
              x={active.h}
              color={color}
              colorString={formatColor(active, 'CSS', true)}
              onChange={f.handleHueChange}
            />
            {props.enableAlpha && (
              <ColorControlBar
                type="alpha"
                x={active.a}
                color={color}
                colorString={formatColor(active, 'CSS', true)}
                onChange={f.handleAlphaChange}
              />
            )}
          </div>
          {props.showPrimaryColorPreview !== false && (
            <div
              className={`${prefix}-preview`}
              style={
                state.mode === 'linear-gradient'
                  ? { backgroundImage: getColorBackground(state) }
                  : { backgroundColor: getColorBackground(state) }
              }
            />
          )}
        </div>
        <div className={`${prefix}-input-wrapper`}>
          <Select
            className={`${prefix}-select`}
            size="mini"
            triggerProps={{ className: `${prefix}-select-popup` }}
            options={getColorFormatOptions(props.enableAlpha)}
            value={format}
            disabled={props.disabled}
            onChange={f.handleFormatChange}
          />
          <div className={`${prefix}-group-wrapper`}>
            <InputGroup className={`${prefix}-input-group`}>
              {drafts.map((draft, index) => (
                <Input
                  key={`${format}-${index}`}
                  className={`${prefix}-format-input`}
                  size="mini"
                  disabled={props.disabled}
                  value={draft}
                  onValueChange={(value) => f.updateDraft(index, value)}
                  onChange={() => f.commitDrafts(index)}
                />
              ))}
            </InputGroup>
          </div>
        </div>
      </div>
      {recent || swatches?.length ? (
        <div className={`${prefix}-panel-colors`}>
          {recent && colorSection(t('colorPicker.recent'), recent, 'recent')}
          {swatches?.length ? colorSection(t('colorPicker.swatches'), swatches, 'preset') : null}
        </div>
      ) : null}
    </div>
  );
}
