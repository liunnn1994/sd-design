# Component stability audit

Goal: review every component's source, public props/events/slots and lifecycle; add meaningful browser regressions; fix failures; commit each component separately. Push only after the full inventory is verified, then follow GitHub Actions through successful publication.

Tests use Cypress component mode in real Chrome, including generated documentation demos. A passing row records the scenarios actually exercised, not proof of every possible combination. Keep adding uncovered contractual cases found during review. Existing tests alone do not mark an unreviewed component complete.

Run one component at a time from the repository root:

```sh
pnpm --filter @sdata/web-vue run cypress:run --spec 'components/<component>/__test__/*.cy.ts' --config retries=0
```

## Verified work (2026-09-09)

- Alert: 27 passing (19 behavior + 8 demos), commit `19db9662`. Real leave transition, close/afterClose ordering, keyboard close/non-activation, reactive visibility/title/type, slots and variants.
- Affix: 15 passing (9 behavior + 5 demos + 1 real-scroll regression), commit `5416d2c0`. Fix reactive offset updates; real scrolling, geometry, placeholder, release; existing top/bottom/target/container and exposed-method cases.
- Anchor: 31 passing (20 behavior + 5 demos + 6 lifecycle), commit `08984200`. Fix instant-scroll tracking, href registration/removal, animation cancellation on navigation/unmount, replacement containers and restored indicator position. Full component suite passed with retries disabled. Package vue-tsc passed using the worktree's installed TNB compiler.
- AutoComplete: 42 passing (24 behavior + 6 demos + 2 readonly-tip + 10 boundary interactions). Fix zero/empty option slots, numeric-to-string selection, dynamic readonly/disabled closure, popupContainer forwarding, virtual keyboard scrolling, recycled option identity and virtual scroll/reach-bottom events. Also verifies IME Enter, disabled-option skipping and asynchronous suggestion replacement. Cypress support now imports OverlayScrollbars CSS, matching the dependency included by the production build; without it virtual viewports had overflow: visible and could not scroll. Package vue-tsc passed using installed TNB.

- Avatar: 40 passing (26 behavior + 6 demos + 8 lifecycle), retries disabled. Fix failed-image retry on URL changes, group image sizing, stale text scaling, dynamic image/text slots, group overflow updates and RTL overlap. Preserve slotted image-component support. Package vue-tsc passed using installed TNB.

- BackTop: 16 passing (9 behavior + 2 demos + 5 lifecycle), retries disabled. Fix reactive visibleHeight and targetContainer, zero-duration scrolling and cancellation on target changes/repeated activation/unmount. Real scroll containers verify isolation and cleanup; native Enter activation uses Chrome keyDown with carriage-return text plus keyUp because key events without the text event did not activate the native button in this runner. Package vue-tsc passed using installed TNB.

- Badge: 36 passing (24 behavior + 7 demos + 5 state transitions), retries disabled. Fix custom content incorrectly accompanied by a status count and stale standalone positioning after default-slot changes. Browser cases also verify reactive overflow thresholds, zero removal, custom color/offset cleanup and omitted-versus-zero counts. Package vue-tsc passed using installed TNB.

- BasicCrudTable: 53 passing (33 behavior + 7 demos + 2 action-modal + 11 async boundaries), retries disabled. Fix obsolete list/detail results, loading ownership, unmount cleanup, rejected submit/delete hooks, rejected/stale delete confirmation content and dynamic slot forwarding. Delete confirmation executes against its own row. Dynamic column slots also required reactive slot propagation to Table cells; all 66 existing Table cases passed in the combined 116-case run before the final three CRUD regressions, and the final 53-case CRUD suite passed after those fixes. Table remains pending its individual audit. Full-height regression now checks the actual OverlayScrollbars viewport. Package vue-tsc passed using installed TNB.

- BloomMenu: 32 passing (22 behavior + 4 demos + 6 lifecycle), retries disabled. Fix a rejected controlled open request displaying the collapsed panel; stop delayed focus attempts once closed. Added native Chrome Enter open/select, rapid controlled reopen, item reorder/disabled changes and empty/column transitions. Existing attribute-forwarding and declaration export types preserved. Package vue-tsc passed using installed TNB.

- BorderBeam: 55 passing (38 behavior + 7 demos + 10 lifecycle), retries disabled. Fix interrupted fade reversal, zero/automatic radius detection, replaced-slot observation and pulse glow resize tracking. React to reduced-motion changes, stop the pulse driver and complete deactivation without waiting for disabled CSS animations; all five presets retain a static visible effect. Package vue-tsc passed using installed TNB.

- Breadcrumb: 23 passing (14 behavior + 7 demos + 2 lifecycle), retries disabled. Fix dynamic droplist availability and stale route totals when removing a default slot. Remove the duplicate BreadcrumbItem declaration that prevented the existing test file from compiling. Package vue-tsc passed using installed TNB.

- Button: 36 passing (24 behavior/group + 10 demos + 2 lifecycle), retries disabled. Fix dynamic tooltip-slot detection and forward native attributes directly to the button/link across tooltip changes. Verify loading blocks native form submission and submission resumes afterward. All 32 BloomMenu cases also passed after the attribute-forwarding change. Package vue-tsc passed using installed TNB.

- Card: 46 passing (31 behavior + 10 demos + 5 lifecycle), retries disabled. Fix stale Meta/action placement and Grid layout state after child removal with mounted-child counts; preserve remaining siblings and restore actions on remount. Fix cached named-slot availability in Card headers and Meta content. The dynamic header regression failed before the fix. Full Card Chrome component suite passes after the fixes. Installed package typecheck passed before the slot changes, but its TNB/tsgo bridge is not standard TypeScript validation; the standard TypeScript gate remains outstanding.

- Carousel: 44 passing (31 behavior + 6 demos + 7 lifecycle boundaries), retries disabled. Fix controlled initial navigation and previous-slide reporting, normalize indexes after item-count changes and for deeply negative inputs, resume autoplay when hoverToPause is disabled, and preserve arrow keys in editable slide content. Guard empty/single-slide navigation and verify autoplay stops after unmount. The four state regressions and editable-input regression failed before their fixes; empty-carousel test needed explicit dimensions to dispatch its event. Full Chrome component suite passes together. Standard TypeScript validation remains pending because the installed typescript package is the pre-existing TNB bridge.

- Cascader: 102 passing (45 behavior + 18 demos + 2 readonly + 8 lazy-load lifecycle + 1 search lifecycle + 2 loaded-cache + 2 dynamic-loader + 4 literal-key + 3 dynamic-index + 2 parent-keyboard + 4 disabled-keyboard + 4 path-collision + 2 real-scroll + 1 virtual-toggle + 4 lazy-keyboard cases), retries disabled. Deduplicate pending expansion loads, ignore results after the source option is replaced or unmounted, and release loading state after synchronous throws or rejected Promises so expansion can retry. Both Cascader and CascaderPanel reproduced duplicate loads and stale results before fixes. Search now cancels its pending timer on unmount; the regression checks the actual timer identity because Vue suppresses emitted events after unmount and a callback-only assertion falsely passed. Full Chrome component suite passes together. Loaded children now retain source-option identity so same-key replacements reload instead of displaying stale children; both regressions failed before the fix. Enabling loadMore dynamically now rebuilds the option index in both variants; both regressions failed before the fix. Multiple selection compares literal key prefixes instead of interpolating keys into RegExp; opening-bracket values reproduced a render exception and stalled the diagnostic browser, which was terminated before the fixed full run. Bracket and dot-value cases pass in both variants. Dynamic checkStrictly/valueKey changes now rebuild option indexes. Regressions reproduced stale parent labels, stale active-node keys and disabled standalone-panel parent checkboxes after enabling strict selection. Normal single-mode Enter now expands parents without emitting a parent selection or closing the popup; both variants reproduced the bug. Disabled active options no longer submit through Enter; moving right into a child column now skips disabled options. All four regressions reproduced before the fix in both variants. Selection also respects selectionDisabled at the shared action boundary. Internal path keys now escape percent signs and hyphen delimiters, keeping a-b/c distinct from a/b-c while preserving raw emitted path arrays. Both original collision regressions failed before the fix. Full 93-case suite passed; final expanded four-case path suite also passed, adding literal percent-escape values and actual selection emission checks (95 total covered cases; no production edits after the full run). Two additional Chrome flows disable both transition stubs, expand the last of 30 parents, scroll the last of 30 children into view, check positive scrollTop in both actual OverlayScrollbars viewports and submit the correct original path. Both flows pass without production changes (97 total covered cases across the recorded runs). Column virtualization now derives from current props instead of a mount-time snapshot. The failing regression now enables and disables virtualization while open, then scrolls to and selects option 99. Lazy loading is now shared at the owning panel through useLazyLoad so mouse and keyboard use the same pending-request identity, source validation, loading indicator and failure cleanup. Four failing keyboard regressions now expand with ArrowRight or Enter, wait for loaded children, enter the child column and submit the leaf. Pending requests are invalidated on owning-panel unmount. Latest full Chrome run passes all 102 cases together with retries disabled. Component source review and browser regression are complete; final repository type/build/lint and release gates remain outstanding. Cascader style entry and token sources were read. Standard TypeScript validation remains pending with the pre-existing TNB toolchain.

- Checkbox: 31 passing (21 behavior/group + 9 demos + 1 mixed-state regression), retries disabled. Restore native input.indeterminate from the latest prop after activation; the regression reproduced the native state becoming false while the controlled mixed prop remained true. Also verifies parent-driven clearing of mixed state. Reviewed Checkbox/Group source, context, exports, icon, styles and tokens. Combined Chrome run with all 102 Cascader cases passed (133 total). Standard TypeScript validation remains pending with the pre-existing TNB toolchain.

- ChatComposer: current directory contains only empty **test**/style directories; git ls-files returns no tracked files and current component exports/docs contain no matching reference. No implementation exists in this checkout to exercise; inventory records this explicitly rather than claiming test coverage.

- Clamp: 22 passing (14 behavior/integration + 4 demos + 4 recalculation cases), retries disabled. Local code directly installs and re-exports the four vue-clamp 1.6.0 primitives. Reviewed the local integration and installed resize/cleanup lifecycle code; added real-browser content replacement for LineClamp/RichLineClamp, container-width growth and WrapClamp item replacement. Existing tests cover expansion controls, custom ellipsis/location, inline splitting, rich content and hidden-item accounting. No production change needed. Standard TypeScript validation remains part of the final repository gate.

- Collapse: 32 passing cases (16 behavior + 9 demos + 1 nested keyboard + 2 icon layout + 2 real-transition cases + 2 dynamic-destruction cases), retries disabled. Fix header inputs consuming Enter to toggle the panel and apply the existing no-icon layout class when icons are hidden. All three regressions failed before fixes; full 28-case run passed afterward. Two added real-transition tests then passed: complete leave destroys/recreates content, while reversing after 40ms of an observed active leave retains the original DOM node and restores auto height. Initial reversal test used ordinary clicks and input value, which did not establish interruption timing; replaced with explicit timing and node identity. Dynamic destroyOnHide now updates already hidden content immediately and defers destruction during an active leave until the transition completes. The hidden-content regression failed before the fix. Final full component run passed all 32 cases together with retries disabled; component review is complete. Standard TypeScript validation remains pending.

## Calendar audit details

- Calendar: 100 cases pass (34 behavior + 13 demos + 2 realtime + 3 event updates + 7 drag boundaries + 6 async drop + 5 resize lifecycle + 4 resize rejection + 2 form navigation + 2 editing updates + 10 special-hours drops + 4 special-hours creation + 2 special-hours resize + 1 locale isolation + 1 week-start isolation + 2 ISO week numbers + 2 locale controls), retries disabled; package vue-tsc passed using installed TNB. Fix uses one minute-aligned timer, cancels realtime updates reliably and reacts when time is enabled dynamically. Also fix same-length event replacement indexing and normalize copied dates before createEvent interval snapping. Both new regressions failed before the fix and pass afterward. Also fix source-event deletion after rejected cross-calendar drops and obsolete month-cell hover selectors/navigation calls. Both drag regressions reproduced before fixes; browser tests dispatch DOM drag events with DataTransfer. Hover timers now clear on drag end and owning-calendar unmount; regression checks wait past the actual hover delay. Async drop tests now cover acceptance, false and thrown rejection after dragend; accepted transfers remove the captured source exactly once, while rejected transfers preserve it. The acceptance test reproduced duplicate events before the fix. Date constraints (disableDays, minDate, maxDate) reject cross-calendar drops without invoking the drop callback. All Calendar specs use real Vue transitions through explicit mount options. Latest full run passed all 100 cases together with retries disabled. Resize document listeners now clear on unmount; pending resize/resize-end callbacks cannot mutate disposed state. The listener-identity regression failed before cleanup was added. Both default and custom clickable titles now use type=button; both form-submit regressions reproduced unwanted submissions before the fix. Prop membership tracking now handles same-length item replacement after a full events-array replacement; this regression reproduced stale content before the fix. Resize revisions invalidate move callbacks after mouseup and stop document movement while final approval is pending; the late-move regression reproduced an unhandled null-state write before the fix. Resize and resize-end Promise rejection now follows the false/revert path; both error regressions failed before the catch was added, while both false paths already passed. Out-of-order moves now verify distinct proposed end times and preserve the latest accepted position. This coordinate regression explicitly disables Vue Test Utils transition stubs: the default stub adds an extra grid item and collapses the day cell to zero height. All Calendar specs now import a local mount override to disable transition stubs; directly changing imported Vue Test Utils config did not affect Cypress bundled mounting and was replaced. Dynamic editableEvents changes now refresh cell drop listeners; enabling and disabling regressions both failed before the fix and now pass with nonzero cell geometry. Horizontal and vertical drops now cover allowed, blocked, ends-at-block-start and starts-at-block-end ranges. Schedule-specific allowed overrides previously inherited default restrictions despite rendering as allowed; the failing browser regression now passes after preserving empty forbidden-range overrides. Special-hours creation now verifies both pointer directions in both layouts; resize tests verify clamping at the blocked boundary in both layouts. These six cases passed without further production changes. This Calendar-only checkpoint contains the validated interaction/lifecycle fixes and coverage. Mixed English/Chinese calendars now keep per-instance formatting locale after navigation; the regression reproduced a Chinese title in the English calendar after waiting for the outgoing transition to disappear. Shared date initialization returns its resolved locale name; Calendar uses it for texts and formatters. Week-start calculation now honors the existing per-instance Sunday/Monday argument instead of global dayjs locale state. The paired-calendar navigation test reproduced Monday dates shifting to Sunday before the fix. ISO week numbering now uses dayjs isoWeek rather than locale-sensitive week; English previously reported week 1 instead of ISO week 53 on 2021-01-01. English and Chinese year-boundary navigation regressions pass. Explicit en/en-us now selects English control messages and switching to zh-cn updates them; both Today regressions failed before the fix. Without an explicit locale, global/ConfigProvider messages remain the source. Cross-calendar accepted moves now remove the source independently of the delete control, while retaining update:events and event-delete notifications. The drag-only acceptance test reproduced a duplicate event before the fix; all six asynchronous acceptance/rejection combinations pass. Calendar code review and this component browser regression are complete; full-repository regression and release gates remain pending.

## Inventory

After the AutoComplete support-CSS change, reran AutoComplete, Alert, Affix and Anchor together: 115 tests passed with retries disabled (exit 0).

- ColorPicker: 76 passing cases (38 behavior + 9 demos + 2 readonly-tip + 2 drag lifecycle + 3 disabled-panel + 2 readonly-panel + 3 controlled-value + 2 HEX8-editing + 13 format-conversion + 2 gradient-drag cases), retries disabled. Both drag regressions reproduced retained window listeners and a queued callback after unmount; the shared control hook now removes listeners and cancels its animation frame. The full 51-case run passed after that fix. Three additional regressions reproduced disabled swatches changing the panel display, recent-color additions, and gradient deletion. Panel state/recent changes are now guarded and buttons expose native disabled state. Following that fix, the existing 51 cases passed again; the disabled keyboard test initially stopped at Cypress actionability on the newly disabled button, then all three targeted cases passed using explicit DOM dispatch/native click. Latest full run passed all 76 cases together. Inline readonly panels now suppress edits and recent-color additions for both boolean and string readonly values; both regressions failed before the fix and unlocking restores editing. A controlled swatch previously changed the panel while the trigger retained the parent value; panel state now reconciles after parent updates. Controlled input, swatch and gradient addition verify rejection followed by acceptance. Four existing gradient-edit tests used fixed modelValue without parent writeback and now correctly use defaultValue for autonomous editing. HEX8 alpha-field editing previously ignored the entered percentage whenever the hex field contained eight digits; the browser regression failed before the fix. Commits now identify the edited field so a separate alpha edit overrides embedded alpha, while direct eight-digit edits retain their embedded alpha. Both editing directions pass. Ten format variants now verify external value changes without user change events; HSL, HSV and CMYK text submissions verify conversion to HEX. Pointer-event browser tests verify both track boundaries and DOM/selection identity after crossing another gradient stop. These additions pass without further production changes. Component source/style review and browser regression are complete; standard TypeScript and full-repository release gates remain outstanding. Standard TypeScript validation remains pending.

- Comment: 29 passing (18 behavior + 4 demos + 4 dynamic slots + 3 update/interaction cases), retries disabled. Reviewed component, installation entrypoint and styles. Four browser regressions reproduced author/avatar/content/datetime slots remaining hidden when added after mount because slot presence was cached in computed values. Render-time checks now read current slots while preserving prop precedence. Dynamic insertion/removal, prop updates/clearing, prop-to-slot fallback, alignment CSS and action callbacks all pass in the full component run. Standard TypeScript and final repository gates remain pending.

- ConfigProvider checkpoint: 55 passing cases (30 configuration/theme cases, including helper assertions + 5 standalone theme-provider + 11 demos + 1 global-mode restoration + 3 local lifecycle + 1 nested configuration + 2 global-token restoration + 2 overlapping-global cases), retries disabled. The new browser regression reproduced loss of the preexisting body theme when global changes from true to false. Theme cleanup now records whether the previous active target was global instead of using the new prop value; local mode and subsequent unmount preserve the restored body mode. Full component run passes. Added browser coverage verifies local theme removal/recreation, stale CSS variable removal on both root and popup targets, sibling popup-container isolation during unmount, and explicit inner size defaults remaining stable when outer defaults change. Those four additions passed without production changes. Full run passes all 55 cases; the two overlapping-global tests then also passed after adding older-provider update assertions. Two browser regressions reproduced loss of preexisting inline CSS variables on provider unmount and token removal. The provider now records original values and priorities before global overrides, then restores them when keys are released; both value and important-priority assertions pass. Removing an older global provider before a newer one reproduced restoration of the destroyed provider values after final unmount. Global DOM theme ownership now tracks active providers per target, preserves mount precedence during updates, recomputes remaining overrides on release, and restores original values/priorities when no owner remains. Both removal orders and updates under a later override pass. This replaces the per-instance snapshots introduced at the preceding checkpoint. Review remains in progress for nested popup theme inheritance. Standard TypeScript validation remains pending.

Includes every immediate directory in components; internal helpers and styles require shared-support review rather than pretending they are public components. Next public component: config-provider.

| Component / support directory | Review status                        |
| ----------------------------- | ------------------------------------ |
| \_components                  | Pending                              |
| \_hooks                       | Pending                              |
| \_utils                       | Pending                              |
| affix                         | Reviewed; browser cases above passed |
| alert                         | Reviewed; browser cases above passed |
| anchor                        | Reviewed; browser cases above passed |
| auto-complete                 | Reviewed; browser cases above passed |
| avatar                        | Reviewed; browser cases above passed |
| back-top                      | Reviewed; browser cases above passed |
| badge                         | Reviewed; browser cases above passed |
| basic-crud-table              | Reviewed; browser cases above passed |
| bloom-menu                    | Reviewed; browser cases above passed |
| border-beam                   | Reviewed; browser cases above passed |
| breadcrumb                    | Reviewed; browser cases above passed |
| button                        | Reviewed; browser cases above passed |
| calendar                      | Reviewed; browser cases above passed |
| card                          | Reviewed; browser cases above passed |
| carousel                      | Reviewed; browser cases above passed |
| cascader                      | Reviewed; browser cases above passed |
| chat-composer                 | Empty; no tracked implementation     |
| checkbox                      | Reviewed; browser cases above passed |
| clamp                         | Reviewed; browser cases above passed |
| collapse                      | Reviewed                             |
| color-picker                  | Reviewed; browser cases above passed |
| comment                       | Reviewed; browser cases above passed |
| config-provider               | Pending                              |
| copy                          | Pending                              |
| cropper                       | Pending                              |
| date-picker                   | Pending                              |
| descriptions                  | Pending                              |
| divider                       | Pending                              |
| drawer                        | Pending                              |
| dropdown                      | Pending                              |
| ellipsis                      | Pending                              |
| empty                         | Pending                              |
| file-previewer                | Pending                              |
| form                          | Pending                              |
| grid                          | Pending                              |
| header-list                   | Pending                              |
| icon                          | Pending                              |
| icon-component                | Pending                              |
| image                         | Pending                              |
| input                         | Pending                              |
| input-mask                    | Pending                              |
| input-number                  | Pending                              |
| input-tag                     | Pending                              |
| json-form                     | Pending                              |
| kv-list                       | Pending                              |
| layout                        | Pending                              |
| link                          | Pending                              |
| list                          | Pending                              |
| locale                        | Pending                              |
| mention                       | Pending                              |
| menu                          | Pending                              |
| message                       | Pending                              |
| modal                         | Pending                              |
| model-selector                | Pending                              |
| notification                  | Pending                              |
| number-flow                   | Pending                              |
| page-header                   | Pending                              |
| pagination                    | Pending                              |
| popconfirm                    | Pending                              |
| popover                       | Pending                              |
| progress                      | Pending                              |
| qr-code                       | Pending                              |
| radio                         | Pending                              |
| rate                          | Pending                              |
| regex-vis                     | Pending                              |
| resize-box                    | Pending                              |
| result                        | Pending                              |
| rich-text-editor              | Pending                              |
| scrollbar                     | Pending                              |
| secret                        | Pending                              |
| select                        | Pending                              |
| selectable-card               | Pending                              |
| sender                        | Pending                              |
| skeleton                      | Pending                              |
| slider                        | Pending                              |
| space                         | Pending                              |
| spin                          | Pending                              |
| split                         | Pending                              |
| statistic                     | Pending                              |
| steps                         | Pending                              |
| style                         | Pending                              |
| switch                        | Pending                              |
| table                         | Pending                              |
| tabs                          | Pending                              |
| tag                           | Pending                              |
| tag-group                     | Pending                              |
| textarea                      | Pending                              |
| theme-provider                | Pending                              |
| thinking-orb                  | Pending                              |
| time-picker                   | Pending                              |
| timeline                      | Pending                              |
| toolbar                       | Pending                              |
| tooltip                       | Pending                              |
| tour                          | Pending                              |
| transfer                      | Pending                              |
| tree                          | Pending                              |
| tree-select                   | Pending                              |
| trigger                       | Pending                              |
| typography                    | Pending                              |
| upload                        | Pending                              |
| verification-code             | Pending                              |
| watermark                     | Pending                              |

## Release gates still pending

- Finish every pending row and inspect remaining behavior/branch gaps in the reviewed components.
- Run full browser regression and required type/build/lint checks on final checkout; inspect skipped/pending tests explicitly.
- Resolve ownership of pre-existing staged toolchain/docs/time-picker changes before publishing; do not silently include them in component commits.
- Push the completed component commits, identify the exact GitHub Actions run for that SHA, follow it with gh, fix failures, and verify the resulting release/package publication.
