import { computed, shallowRef } from 'vue';

import { parseThemeConfig, type SdThemeConfig } from '@sdata/web-vue';

import { canonicalConfig, editToken } from './editor-model';
import { themePresets } from './theme-playground';

export function useThemeEditor() {
  const theme = shallowRef<SdThemeConfig>(canonicalConfig({}));
  const preset = shallowRef('custom');
  const status = shallowRef('');
  const error = shallowRef('');
  const json = shallowRef('');
  const showJson = shallowRef(false);
  const serialized = computed(() => JSON.stringify(theme.value, null, 2));
  const changes = computed(
    () =>
      Object.keys(theme.value.seed ?? {}).length +
      Object.keys(theme.value.tokens ?? {}).length +
      Object.values(theme.value.components ?? {}).reduce(
        (sum, value) => sum + Object.keys(value).length,
        0,
      ),
  );
  function update(next: SdThemeConfig) {
    theme.value = canonicalConfig(next);
    preset.value = 'custom';
    status.value = '';
    error.value = '';
  }
  function updateToken(key: string, value: string | undefined, component = '') {
    update(editToken(theme.value, key, value, component));
  }
  function reset() {
    update({});
    status.value = '已恢复组件库默认主题。';
  }
  function applyPreset(key: string) {
    const item = themePresets.find((item) => item.key === key);
    if (!item) return;
    update(item.theme);
    preset.value = key;
  }
  function openJson() {
    json.value = serialized.value;
    showJson.value = true;
    error.value = '';
  }
  function applyJson(text = json.value) {
    const result = parseThemeConfig(text);
    if (!result.valid || !result.data) {
      error.value = result.errors.join(' ');
      return false;
    }
    update(result.data);
    showJson.value = false;
    status.value = '主题配置已应用。';
    return true;
  }
  async function importFile(file: File) {
    try {
      applyJson(await file.text());
    } catch {
      error.value = '读取文件失败，请重新选择 JSON 文件。';
    }
    // Upload only selects the local file; no network upload or retained file list.
    return false;
  }
  function download() {
    const url = URL.createObjectURL(new Blob([serialized.value], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sd-theme.json';
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    status.value = '主题 JSON 已导出。';
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(serialized.value);
      status.value = '主题 JSON 已复制。';
    } catch {
      error.value = '复制失败，可在主题配置中手动复制或下载 JSON。';
    }
  }
  return {
    theme,
    preset,
    status,
    error,
    json,
    showJson,
    serialized,
    changes,
    update,
    updateToken,
    reset,
    applyPreset,
    openJson,
    applyJson,
    importFile,
    download,
    copy,
  };
}
