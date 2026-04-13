```yaml
meta:
  type: Component
  category: Data Entry
title: ColorPicker
description: Used for select and display colors.
```

_Auto translate by google._

@import ./**demo**/basic.md @import ./**demo**/size.md @import ./**demo**/disabled.md @import ./**demo**/format.md @import ./**demo**/colors.md @import ./**demo**/trigger.md @import ./**demo**/trigger-element.md @import ./**demo**/only-panel.md

## API

### `<color-picker>` Props

| Attribute | Description | Type | Default |
| --- | --- | --- | :-: |
| model-value **(v-model)** | Value | `string` | `-` |
| default-value | Default value (uncontrolled state) | `string` | `-` |
| format | Color value format | `'hex' \| 'rgb'` | `-` |
| size | Size | `'mini' \| 'small' \| 'medium' \| 'large'` | `'medium'` |
| show-text | Show color value | `boolean` | `false` |
| show-history | Show history colors | `boolean` | `false` |
| show-preset | Show preset colors | `boolean` | `false` |
| disabled | disabled | `boolean` | `false` |
| disabled-alpha | Disable transparency channel | `boolean` | `false` |
| hide-trigger | There is no trigger element, only the color panel is displayed | `boolean` | `false` |
| trigger-props | Can accept Props of all [Trigger](/vue/component/trigger) components | `Partial<TriggerProps>` | `-` |
| history-colors | Color array of historical colors | `string[]` | `-` |
| preset-colors | Color array of preset colors | `string[]` | `() => colors` |

### `<color-picker>` Events

| Event Name | Description | Parameters |
| --- | --- | --- |
| change | Triggered when the color value changes | value: `string` |
| popup-visible-change | Triggered when the color panel is expanded and collapsed | visible: `boolean`<br>value: `string` |
