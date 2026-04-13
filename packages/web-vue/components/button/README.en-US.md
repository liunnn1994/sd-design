```yaml
meta:
  type: Component
  category: Common
title: Button
description: Button is a command component that can initiate an instant operation.
```

_Auto translate by google._

@import ./**demo**/basic.md

@import ./**demo**/icon.md

@import ./**demo**/shape.md

@import ./**demo**/size.md

@import ./**demo**/status.md

@import ./**demo**/disabled.md

@import ./**demo**/loading.md

@import ./**demo**/long.md

@import ./**demo**/group.md

## API

### `<button>` Props

| Attribute | Description | Type | Default |
| --- | --- | --- | :-: |
| type | Button types are divided into five types: secondary, primary, dashed, outline and text. | `ButtonTypes` | `'secondary'` |
| shape | Button shape | `BorderShape` | `-` |
| status | Button state | `'normal' \| 'warning' \| 'success' \| 'danger'` | `'normal'` |
| size | Button size | `'mini' \| 'small' \| 'medium' \| 'large'` | `'medium'` |
| long | Whether the width of the button adapts to the container. | `boolean` | `false` |
| loading | Whether the button is in the loading state | `boolean` | `false` |
| disabled | Whether the button is disabled | `boolean` | `false` |
| html-type | Set the native `type` attribute of `button`, optional values refer to [HTML](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button#attr-type '_blank') | `HTMLButtonElement['type']` | `'button'` |
| autofocus | Set the native `autofocus` attribute of `button`, optional values refer to [HTML](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button#attr-type '_blank') | `boolean` | `false` |
| href | Set up a jump link. When this property is set, the button is rendered as `<a>` | `string` | `-` |

### `<button>` Events

| Event Name | Description                        | Parameters       |
| ---------- | ---------------------------------- | ---------------- |
| click      | Emitted when the button is clicked | ev: `MouseEvent` |

### `<button>` Slots

| Slot Name | Description | Parameters |
| --------- | ----------- | ---------- |
| icon      | Icon        | -          |

### `<button-group>` Props

| Attribute | Description | Type | Default |
| --- | --- | --- | :-: |
| type | Children button types are divided into five types: secondary, primary, dashed, outline and text. | `ButtonTypes` | `-` |
| status | Children button state | `'normal' \| 'warning' \| 'success' \| 'danger'` | `-` |
| shape | Button shape | `BorderShape` | `-` |
| size | Children button size | `'mini' \| 'small' \| 'medium' \| 'large'` | `-` |
| disabled | All children whether the button is disabled | `boolean` | `false` |
