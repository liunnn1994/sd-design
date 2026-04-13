```yaml
changelog: true
```

## 2.56.2

`2024-09-13`

### 🐛 BugFix

- fix(switch): loading state can't be controlled with truthy initial state ([#3285](https://github.com/liunnn1994/sd-design/pull/3285))

## 2.56.1

`2024-08-22`

### 🆕 Feature

- add `tagNowrap` prop ([#3270](https://github.com/liunnn1994/sd-design/pull/3270))

## 2.54.2

`2024-01-11`

### 💎 Enhancement

- enhance selected state style for options ([#2895](https://github.com/liunnn1994/sd-design/pull/2895))

## 2.54.1

`2023-12-28`

### 🐛 BugFix

- Fix `defaultPopupVisible` failure problem ([#2881](https://github.com/liunnn1994/sd-design/pull/2881))

## 2.51.0

`2023-09-01`

### 🆕 Feature

- support boolean type ([#2661](https://github.com/liunnn1994/sd-design/pull/2661))

## 2.47.1

`2023-06-09`

### 🐛 BugFix

- Fix mouse cursor positioning issue in search mode ([#2487](https://github.com/liunnn1994/sd-design/pull/2487))

## 2.47.0

`2023-06-02`

### 🆕 Feature

- the header and footer are displayed in the empty state of select ([#2429](https://github.com/liunnn1994/sd-design/pull/2429))

## 2.46.0

`2023-05-12`

### 💎 Enhancement

- Add a title hint to the selection box ([#2412](https://github.com/liunnn1994/sd-design/pull/2412))

## 2.45.3

`2023-04-28`

### 🐛 BugFix

- Fix the problem that the Enter key in the input method state will trigger the selection ([#2378](https://github.com/liunnn1994/sd-design/pull/2378))

## 2.45.2

`2023-04-21`

### 💅 Style

- Fix the inconsistent line-height and height of select-view-input ([#2346](https://github.com/liunnn1994/sd-design/pull/2346))

## 2.44.6

`2023-03-31`

### 🐛 BugFix

- Fix the problem that setting modelValue to undefined is invalid ([#2285](https://github.com/liunnn1994/sd-design/pull/2285))

## 2.44.3

`2023-03-24`

### 🐛 BugFix

- fix blank dropdown caused by dynamic slot options ([#2265](https://github.com/liunnn1994/sd-design/pull/2265))
- Automatic creation of empty string entries is not allowed. Dropdown option with empty string, set value to `undefined` when empty ([#2257](https://github.com/liunnn1994/sd-design/pull/2257))

## 2.44.2

`2023-03-17`

### 🐛 BugFix

- drop-down option value supports empty string ([#2190](https://github.com/liunnn1994/sd-design/pull/2190))

## 2.43.0

`2023-02-10`

### 🆕 Feature

- Added `defaultActiveFirstOption` property ([#2107](https://github.com/liunnn1994/sd-design/pull/2107))
- add header slot ([#2099](https://github.com/liunnn1994/sd-design/pull/2099))

## 2.41.0

`2022-12-30`

### 💅 Style

- Unify the suffix icon of `select` component for single selection and multi-selection as `arrow-icon`. ([#2005](https://github.com/liunnn1994/sd-design/pull/2005))

## 2.38.0

`2022-10-28`

### 🐛 BugFix

- Fix formatLabel error when there is no data ([#1797](https://github.com/liunnn1994/sd-design/pull/1797))

## 2.38.0-beta.1

`2022-10-14`

### 💎 Enhancement

- Increase the cache of selected items, and optimize the label display problem during remote search ([#1731](https://github.com/liunnn1994/sd-design/pull/1731))

## 2.37.4

`2022-09-30`

### 💅 Style

- Fix the problem that the custom label color is displayed incorrectly ([#1703](https://github.com/liunnn1994/sd-design/pull/1703))

## 2.37.2

`2022-09-21`

### 🐛 BugFix

- Fixed the problem that the drop-down menu did not follow the scrolling in keyboard interaction ([#1655](https://github.com/liunnn1994/sd-design/pull/1655))
- Fix the problem of error reporting in some cases of built-in virtual scroll bar ([#1655](https://github.com/liunnn1994/sd-design/pull/1655))

## 2.36.1

`2022-09-09`

### 🐛 BugFix

- Fix option slot parameter problem ([#1607](https://github.com/liunnn1994/sd-design/pull/1607))

## 2.32.1

`2022-07-01`

### 🐛 BugFix

- Fixed click-to-expand issue in search mode in Firefox ([#1371](https://github.com/liunnn1994/sd-design/pull/1371))

## 2.30.0

`2022-06-10`

### 🐛 BugFix

- Fixed remote search and fieldNames used at the same time, no options displayed ([#1271](https://github.com/liunnn1994/sd-design/pull/1271))

### 💅 Style

- Fixed the issue that the selection box collapsed when the option label was empty ([#1274](https://github.com/liunnn1994/sd-design/pull/1274))

## 2.29.0

`2022-05-27`

### 🐛 BugFix

- Fix the problem of controlled invalidation of inputValue ([#1204](https://github.com/liunnn1994/sd-design/pull/1204))

## 2.27.1

`2022-05-16`

### 🐛 BugFix

- Fixed an issue where grouping options could not be selected when using the options property ([#1141](https://github.com/liunnn1994/sd-design/pull/1141))

## 2.27.0

`2022-05-13`

### 🐛 BugFix

- Fix the problem that `render` and `tagProps` in options property do not take effect ([#1114](https://github.com/liunnn1994/sd-design/pull/1114))

### 💅 Style

- Fix the problem that the mouse pointer is wrong in the disabled state when the search is turned on ([#1114](https://github.com/liunnn1994/sd-design/pull/1114))

## 2.24.0

`2022-04-15`

### 🆎 TypeScript

- `Option, OptionData, GroupOption` interface names are changed to `SelectOption, SelectOptionData, SelectOptionGroup` ([#983](https://github.com/liunnn1994/sd-design/pull/983))

## 2.23.0

`2022-04-08`

### 🆕 Feature

- add trigger slot ([#952](https://github.com/liunnn1994/sd-design/pull/952))

## 2.22.0

`2022-04-01`

### 💎 Enhancement

- Enter event can no longer be triggered in loading state ([#911](https://github.com/liunnn1994/sd-design/pull/911))

### 🆕 Feature

- Added `field-names` attribute to allow custom fields ([#911](https://github.com/liunnn1994/sd-design/pull/911))

### 🐛 BugFix

- Fixed duplicate options in `allow-create` mode ([#911](https://github.com/liunnn1994/sd-design/pull/911))

## 2.21.2

`2022-03-29`

### 🐛 BugFix

- Fix the problem that `fallback-option` attribute setting false is invalid ([#893](https://github.com/liunnn1994/sd-design/pull/893))
- Fixed the problem that the selected label in the multi-selection mode does not display delete by default ([#886](https://github.com/liunnn1994/sd-design/pull/886))

## 2.20.1

`2022-03-21`

### 💅 Style

- Fixed vertical centering of option #icon slots ([#854](https://github.com/liunnn1994/sd-design/pull/854))
- Fix the problem that the omission is not displayed after the option exceeds the width ([#854](https://github.com/liunnn1994/sd-design/pull/854))

## 2.20.0

`2022-03-18`

### 🐛 BugFix

- Fixed the problem that the search function failed when the virtual list was opened ([#841](https://github.com/liunnn1994/sd-design/pull/841))
- Fix the problem that the `Enter` key on the small keyboard cannot be selected ([#841](https://github.com/liunnn1994/sd-design/pull/841))

## 2.18.0

`2022-03-04`

### 💎 Enhancement

- Select box display using flex layout ([#778](https://github.com/liunnn1994/sd-design/pull/778))
- trigger-props properties can override default properties ([#778](https://github.com/liunnn1994/sd-design/pull/778))

### 🐛 BugFix

- Fix the problem that the label attribute is invalid ([#777](https://github.com/liunnn1994/sd-design/pull/777))
- Fix the problem that the properties of option are not updated synchronously ([#777](https://github.com/liunnn1994/sd-design/pull/777))

## 2.18.0-beta.2

`2022-02-25`

### 🆕 Feature

- Added `search-delay` property and defaulted to `500ms` ([#728](https://github.com/liunnn1994/sd-design/pull/728))

## 2.18.0-beta.1

`2022-02-18`

### ⚠️ Important Attention

- Component uses context refactoring to allow encapsulation of Option components ([#688](https://github.com/liunnn1994/sd-design/pull/688))
- Added `valueKey` attribute, option value supports object form ([#688](https://github.com/liunnn1994/sd-design/pull/688))
- The class name of the <option> component is changed from sd-dropdown-option to sd-select-option, and flex is used to center the layout vertically ([#688](https://github.com/liunnn1994/sd-design/pull/688))

## 2.16.0

`2022-01-21`

### 🆕 Feature

- Added custom icon slot ([#634](https://github.com/liunnn1994/sd-design/pull/634))

## 2.15.0

`2022-01-14`

### 💎 Enhancement

- Optimize loading status display ([#557](https://github.com/liunnn1994/sd-design/pull/557))

## 2.14.3

`2022-01-12`

### 🐛 BugFix

- missing arguments when calling scrollTo ([#543](https://github.com/liunnn1994/sd-design/pull/543))

## 2.14.2

`2022-01-10`

### 🐛 BugFix

- Fix on-demand loading without imported styles ([#536](https://github.com/liunnn1994/sd-design/pull/536))

## 2.13.0

`2021-12-31`

### 🐛 BugFix

- Fix the problem of Chinese input method when searching ([#481](https://github.com/liunnn1994/sd-design/pull/481))
- Fix the incomplete display of placeholder in `drawer` ([#481](https://github.com/liunnn1994/sd-design/pull/481))

## 2.11.1

`2021-12-20`

### 🐛 BugFix

- Fix the problem that Group is unavailable when using JSX ([#427](https://github.com/liunnn1994/sd-design/pull/427))

## 2.10.1

`2021-12-14`

### 🐛 BugFix

- Fix the problem of disabled in the options attribute ([#385](https://github.com/liunnn1994/sd-design/pull/385))
- Fix the problem that the bordered property does not take effect, add an example ([#385](https://github.com/liunnn1994/sd-design/pull/385))

## 2.10.0

`2021-12-10`

### 💎 Enhancement

- When the input box is editable, clicking will not close the drop-down menu ([#348](https://github.com/liunnn1994/sd-design/pull/348))

### 🆕 Feature

- Add fallback-option and show-extra-options attributes ([#347](https://github.com/liunnn1994/sd-design/pull/347))

### 🐛 BugFix

- Fix the problem of warnings when components are used in JSX, and variables cannot be used in slots ([#347](https://github.com/liunnn1994/sd-design/pull/347))
- Fix the problem that the drop-down menu cannot pop up when the icon is clicked for the first time in the multi-select input box ([#347](https://github.com/liunnn1994/sd-design/pull/347))

## 2.8.0

`2021-12-01`

### 🆕 Feature

- Add support for `tagProps` ([#307](https://github.com/liunnn1994/sd-design/pull/307))

## 2.6.0

`2021-11-19`

### 🆕 Feature

- Add `footer` slot ([#201](https://github.com/liunnn1994/sd-design/pull/201))
- Add `trigger-props` property ([#197](https://github.com/liunnn1994/sd-design/pull/197))

### 🐛 BugFix

- Fix the problem that the `data` parameter is not sent from the `option` slot ([#200](https://github.com/liunnn1994/sd-design/pull/200))

## 2.5.0

`2021-11-18`

### ⚠️ Important Attention

- Move the custom rendering of `options.label` added in 2.4.0 to `options.render` ([#183](https://github.com/liunnn1994/sd-design/pull/183))
- `<option>` Add label prop support ([#183](https://github.com/liunnn1994/sd-design/pull/183))

## 2.4.0

`2021-11-17`

### 🆕 Feature

- Add `option` slot ([#170](https://github.com/liunnn1994/sd-design/pull/170))
- `options.label` supports custom rendering ([#170](https://github.com/liunnn1994/sd-design/pull/170))

## 2.1.0

`2021-11-05`

### 🐛 BugFix

- Fix the issue of `#empty` slot loss ([#96](https://github.com/liunnn1994/sd-design/pull/96))

## 2.0.3

`2021-10-29`

### 🐛 BugFix

- Fix the clear button is not displayed in multi-select mode ([#38](https://github.com/liunnn1994/sd-design/pull/38))
