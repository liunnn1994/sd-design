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
- Anchor: 31 passing (20 behavior + 5 demos + 6 lifecycle), included with this audit. Fix instant-scroll tracking, href registration/removal, animation cancellation on navigation/unmount, replacement containers and restored indicator position. Full component suite passed with retries disabled. Package vue-tsc passed using the worktree's installed TNB compiler.

## Inventory

Includes every immediate directory in components; internal helpers and styles require shared-support review rather than pretending they are public components. Next public component: auto-complete.

| Component / support directory | Review status                        |
| ----------------------------- | ------------------------------------ |
| \_components                  | Pending                              |
| \_hooks                       | Pending                              |
| \_utils                       | Pending                              |
| affix                         | Reviewed; browser cases above passed |
| alert                         | Reviewed; browser cases above passed |
| anchor                        | Reviewed; browser cases above passed |
| auto-complete                 | Pending                              |
| avatar                        | Pending                              |
| back-top                      | Pending                              |
| badge                         | Pending                              |
| basic-crud-table              | Pending                              |
| bloom-menu                    | Pending                              |
| border-beam                   | Pending                              |
| breadcrumb                    | Pending                              |
| button                        | Pending                              |
| calendar                      | Pending                              |
| card                          | Pending                              |
| carousel                      | Pending                              |
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
