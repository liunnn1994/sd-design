// Adapted from the MIT-licensed palette algorithm; see THIRD_PARTY_NOTICES.md.
import { hexToRgb, hsvToRgb, rgbToHsv } from '../_utils/color';

/** 为已校验的六位十六进制 seed 生成十级 RGB 通道值。 */
export function generateThemePalette(color: string, dark = false): string[] {
  const rgb = hexToRgb(color);
  if (!rgb) return [];
  const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
  const hue = hsv.h * 360;
  const saturation = hsv.s * 100;
  const value = hsv.v * 100;
  const light = Array.from({ length: 10 }, (_, offset) => {
    const index = offset + 1;
    if (index === 6) return rgb;
    const lighter = index < 6;
    const distance = Math.abs(index - 6);
    const direction = hue >= 60 && hue <= 240 ? -1 : 1;
    const nextHue = (Math.round(hue + direction * (lighter ? 2 : -2) * distance) + 360) % 360;
    const nextSaturation = lighter
      ? saturation <= 9
        ? saturation
        : saturation - ((saturation - 9) / 5) * distance
      : saturation + ((100 - saturation) / 4) * distance;
    const nextValue = lighter
      ? value + ((100 - value) / 5) * distance
      : value <= 30
        ? value
        : value - ((value - 30) / 4) * distance;
    return hsvToRgb(nextHue / 360, nextSaturation / 100, nextValue / 100);
  });

  const baseSaturation = Math.max(0, saturation - (hue >= 50 && hue < 191 ? 20 : 15));
  return light.map((rgb, offset) => {
    if (dark) {
      // 暗色沿用反向浅色色阶的色相和亮度，再调整饱和度。
      const reversed = light[9 - offset];
      const { h, v } = rgbToHsv(reversed.r, reversed.g, reversed.b);
      const index = offset + 1;
      const s =
        index < 6
          ? baseSaturation + (6 - index) * Math.ceil((100 - baseSaturation) / 5)
          : baseSaturation - Math.ceil((baseSaturation - 9) / 4) * (index - 6);
      rgb = hsvToRgb(h, Math.min(100, Math.max(0, s)) / 100, v);
    }
    return `${rgb.r}, ${rgb.g}, ${rgb.b}`;
  });
}
