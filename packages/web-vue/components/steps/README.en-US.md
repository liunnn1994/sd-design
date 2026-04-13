```yaml
meta:
  type: Component
  category: Navigation
title: Steps
description: Clearly indicate the task flow and the current degree of completion, and guide the user to follow the steps to complete the task.
```

_Auto translate by google._

@import ./**demo**/basic.md

@import ./**demo**/description.md

@import ./**demo**/label-placement.md

@import ./**demo**/error.md

@import ./**demo**/icon.md

@import ./**demo**/line-less.md

@import ./**demo**/vertical.md

@import ./**demo**/arrow.md

@import ./**demo**/dot.md

@import ./**demo**/navigation.md

@import ./**demo**/changeable.md

## API

### `<steps>` Props

| Attribute | Description | Type | Default |
| --- | --- | --- | :-: |
| type | The type of the steps | `'default' \| 'arrow' \| 'dot' \| 'navigation'` | `'default'` |
| direction | The direction of the steps | `'horizontal' \| 'vertical'` | `'horizontal'` |
| label-placement | The location where the label description is placed. | `'horizontal' \| 'vertical'` | `'horizontal'` |
| current **(v-model)** | Number of current step | `number` | `-` |
| default-current | The default number of step (uncontrolled state) | `number` | `1` |
| status | The status of the current step | `'wait' \| 'process' \| 'finish' \| 'error'` | `'process'` |
| line-less | Whether to use the connectionless style | `boolean` | `false` |
| small | Whether to use a small step bar | `boolean` | `false` |
| changeable | Whether you can click to switch | `boolean` | `false` |

### `<steps>` Events

| Event Name | Description                                | Parameters                    |
| ---------- | ------------------------------------------ | ----------------------------- |
| change     | Triggered when the number of steps changes | step: `number`<br>ev: `Event` |

### `<step>` Props

| Attribute   | Description             | Type                                         | Default |
| ----------- | ----------------------- | -------------------------------------------- | :-----: |
| title       | Title of the step       | `string`                                     |   `-`   |
| description | Description of the step | `string`                                     |   `-`   |
| status      | Status of the step      | `'wait' \| 'process' \| 'finish' \| 'error'` |   `-`   |
| disabled    | Whether to disable      | `boolean`                                    | `false` |

### `<step>` Slots

| Slot Name   | Description | Parameters                         |
| ----------- | ----------- | ---------------------------------- |
| node        | Node        | step: `number`<br>status: `string` |
| icon        | Icon        | step: `number`<br>status: `string` |
| description | Description | -                                  |
