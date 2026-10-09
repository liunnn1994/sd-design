import { computed, shallowRef } from 'vue';

import { parseThemeConfig, type SdThemeConfig } from '@sdata/web-vue';

import { canonicalConfig, editToken } from './editor-model';
import { themePresets } from './theme-playground';

interface EditorSnapshot {
  theme: SdThemeConfig;
  preset: string;
  baseline: SdThemeConfig;
}

export function useThemeEditor() {
  const theme = shallowRef<SdThemeConfig>(canonicalConfig(themePresets[0].theme));
  const preset = shallowRef(themePresets[0].key);
  const status = shallowRef('');
  const error = shallowRef('');
  const json = shallowRef('');
  const showJson = shallowRef(false);
  const history = shallowRef<EditorSnapshot[]>([]);
  const future = shallowRef<EditorSnapshot[]>([]);
  const baseline = shallowRef<SdThemeConfig>(canonicalConfig(themePresets[0].theme));
  const canUndo = computed(() => history.value.length > 0);
  const canRedo = computed(() => future.value.length > 0);
  const serialized = computed(() => JSON.stringify(theme.value, null, 2));
  function snapshot(): EditorSnapshot {
    return { theme: theme.value, preset: preset.value, baseline: baseline.value };
  }
  function restore(value: EditorSnapshot) {
    theme.value = value.theme;
    preset.value = value.preset;
    baseline.value = value.baseline;
    status.value = '';
    error.value = '';
  }
  function update(next: SdThemeConfig) {
    const canonical = canonicalConfig(next);
    if (JSON.stringify(canonical) === JSON.stringify(theme.value)) return;
    history.value = [...history.value, snapshot()];
    future.value = [];
    theme.value = canonical;
    preset.value = 'custom';
    status.value = '';
    error.value = '';
  }
  function undo() {
    const previous = history.value.at(-1);
    if (!previous) return;
    future.value = [...future.value, snapshot()];
    history.value = history.value.slice(0, -1);
    restore(previous);
  }
  function redo() {
    const next = future.value.at(-1);
    if (!next) return;
    history.value = [...history.value, snapshot()];
    future.value = future.value.slice(0, -1);
    restore(next);
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
    baseline.value = canonicalConfig(item.theme);
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
    baseline.value = canonicalConfig(result.data);
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
    status.value = '主题文件已下载，可交给实施人员，也可重新导入继续调整。';
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
    baseline,
    canUndo,
    canRedo,
    undo,
    redo,
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
