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

## Calendar audit details

- Calendar: 100 cases pass (34 behavior + 13 demos + 2 realtime + 3 event updates + 7 drag boundaries + 6 async drop + 5 resize lifecycle + 4 resize rejection + 2 form navigation + 2 editing updates + 10 special-hours drops + 4 special-hours creation + 2 special-hours resize + 1 locale isolation + 1 week-start isolation + 2 ISO week numbers + 2 locale controls), retries disabled; package vue-tsc passed using installed TNB. Fix uses one minute-aligned timer, cancels realtime updates reliably and reacts when time is enabled dynamically. Also fix same-length event replacement indexing and normalize copied dates before createEvent interval snapping. Both new regressions failed before the fix and pass afterward. Also fix source-event deletion after rejected cross-calendar drops and obsolete month-cell hover selectors/navigation calls. Both drag regressions reproduced before fixes; browser tests dispatch DOM drag events with DataTransfer. Hover timers now clear on drag end and owning-calendar unmount; regression checks wait past the actual hover delay. Async drop tests now cover acceptance, false and thrown rejection after dragend; accepted transfers remove the captured source exactly once, while rejected transfers preserve it. The acceptance test reproduced duplicate events before the fix. Date constraints (disableDays, minDate, maxDate) reject cross-calendar drops without invoking the drop callback. All Calendar specs use real Vue transitions through explicit mount options. Latest full run passed all 100 cases together with retries disabled. Resize document listeners now clear on unmount; pending resize/resize-end callbacks cannot mutate disposed state. The listener-identity regression failed before cleanup was added. Both default and custom clickable titles now use type=button; both form-submit regressions reproduced unwanted submissions before the fix. Prop membership tracking now handles same-length item replacement after a full events-array replacement; this regression reproduced stale content before the fix. Resize revisions invalidate move callbacks after mouseup and stop document movement while final approval is pending; the late-move regression reproduced an unhandled null-state write before the fix. Resize and resize-end Promise rejection now follows the false/revert path; both error regressions failed before the catch was added, while both false paths already passed. Out-of-order moves now verify distinct proposed end times and preserve the latest accepted position. This coordinate regression explicitly disables Vue Test Utils transition stubs: the default stub adds an extra grid item and collapses the day cell to zero height. All Calendar specs now import a local mount override to disable transition stubs; directly changing imported Vue Test Utils config did not affect Cypress bundled mounting and was replaced. Dynamic editableEvents changes now refresh cell drop listeners; enabling and disabling regressions both failed before the fix and now pass with nonzero cell geometry. Horizontal and vertical drops now cover allowed, blocked, ends-at-block-start and starts-at-block-end ranges. Schedule-specific allowed overrides previously inherited default restrictions despite rendering as allowed; the failing browser regression now passes after preserving empty forbidden-range overrides. Special-hours creation now verifies both pointer directions in both layouts; resize tests verify clamping at the blocked boundary in both layouts. These six cases passed without further production changes. This Calendar-only checkpoint contains the validated interaction/lifecycle fixes and coverage. Mixed English/Chinese calendars now keep per-instance formatting locale after navigation; the regression reproduced a Chinese title in the English calendar after waiting for the outgoing transition to disappear. Shared date initialization returns its resolved locale name; Calendar uses it for texts and formatters. Week-start calculation now honors the existing per-instance Sunday/Monday argument instead of global dayjs locale state. The paired-calendar navigation test reproduced Monday dates shifting to Sunday before the fix. ISO week numbering now uses dayjs isoWeek rather than locale-sensitive week; English previously reported week 1 instead of ISO week 53 on 2021-01-01. English and Chinese year-boundary navigation regressions pass. Explicit en/en-us now selects English control messages and switching to zh-cn updates them; both Today regressions failed before the fix. Without an explicit locale, global/ConfigProvider messages remain the source. Cross-calendar accepted moves now remove the source independently of the delete control, while retaining update:events and event-delete notifications. The drag-only acceptance test reproduced a duplicate event before the fix; all six asynchronous acceptance/rejection combinations pass. Calendar code review and this component browser regression are complete; full-repository regression and release gates remain pending.

## Inventory

After the AutoComplete support-CSS change, reran AutoComplete, Alert, Affix and Anchor together: 115 tests passed with retries disabled (exit 0).

Includes every immediate directory in components; internal helpers and styles require shared-support review rather than pretending they are public components. Next public component: cascader.

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
| cascader                      | Pending                              |
| chat-composer                 | Pending                              |
| checkbox                      | Pending                              |
| clamp                         | Pending                              |
| collapse                      | Pending                              |
| color-picker                  | Pending                              |
| comment                       | Pending                              |
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
